// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SabiRevenueSplitter
 * @dev Enforces automated 60/40 micro-transaction revenue split between
 * the Sabi Vault platform (60%) and Sovereign Regional Node Hosts (40%).
 */
contract SabiRevenueSplitter {
    address public platformTreasury;
    address public owner;

    // Regional node identifier (e.g. keccak256("ng-west-africa")) => Regional government/host payout address
    mapping(bytes32 => address) public regionalNodeHosts;
    mapping(bytes32 => bool) public activeNodes;

    // Query fee in wei (or base currency unit)
    uint256 public standardQueryFee;

    event QueryExecuted(
        string indexed regionalNodeId,
        address indexed enterprisePayer,
        uint256 platformAmount,
        uint256 sovereignHostAmount
    );

    event RegionalHostRegistered(bytes32 indexed nodeIdHash, string nodeId, address hostAddress);
    event PlatformTreasuryUpdated(address newTreasury);
    event StandardFeeUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "SabiSplitter: caller is not owner");
        _;
    }

    constructor(address _platformTreasury, uint256 _standardQueryFee) {
        require(_platformTreasury != address(0), "Invalid platform treasury");
        owner = msg.sender;
        platformTreasury = _platformTreasury;
        standardQueryFee = _standardQueryFee;
    }

    /**
     * @dev Registers a sovereign regional node host payout address.
     * e.g., regionalNodeId = "ng-west-africa" or "eu-central"
     */
    function registerRegionalHost(string calldata regionalNodeId, address hostAddress) external onlyOwner {
        require(hostAddress != address(0), "Invalid host address");
        bytes32 nodeHash = keccak256(abi.encodePacked(regionalNodeId));
        regionalNodeHosts[nodeHash] = hostAddress;
        activeNodes[nodeHash] = true;
        emit RegionalHostRegistered(nodeHash, regionalNodeId, hostAddress);
    }

    /**
     * @dev Executes a candidate query micro-transaction with automated 60/40 fee split.
     * 60% is routed to Platform Treasury.
     * 40% is routed directly to Sovereign Regional Node Host.
     */
    function executeQueryWithSplit(string calldata regionalNodeId) external payable {
        bytes32 nodeHash = keccak256(abi.encodePacked(regionalNodeId));
        require(activeNodes[nodeHash], "SabiSplitter: inactive or unregistered sovereign node");
        require(msg.value >= standardQueryFee, "SabiSplitter: insufficient query fee sent");

        address regionalHost = regionalNodeHosts[nodeHash];

        // 60% Platform, 40% Sovereign Host
        uint256 platformFee = (msg.value * 60) / 100;
        uint256 sovereignHostFee = msg.value - platformFee; // Remaining 40%

        (bool successPlatform, ) = payable(platformTreasury).call{value: platformFee}("");
        require(successPlatform, "SabiSplitter: platform fee transfer failed");

        (bool successHost, ) = payable(regionalHost).call{value: sovereignHostFee}("");
        require(successHost, "SabiSplitter: sovereign host fee transfer failed");

        emit QueryExecuted(regionalNodeId, msg.sender, platformFee, sovereignHostFee);
    }

    function setPlatformTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        platformTreasury = _newTreasury;
        emit PlatformTreasuryUpdated(_newTreasury);
    }

    function setStandardQueryFee(uint256 _newFee) external onlyOwner {
        standardQueryFee = _newFee;
        emit StandardFeeUpdated(_newFee);
    }
}

