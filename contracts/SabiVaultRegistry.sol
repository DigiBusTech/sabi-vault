// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SabiVaultRegistry
 * @dev Sovereign On-Chain Cryptographic Registry for Sabi Vault.
 * Provides immutable proof of document existence and notary attestations on EVM L2s.
 */
contract SabiVaultRegistry {
    enum VerificationTier {
        NONE,
        TIER_1_STANDARD_HASHED,
        TIER_2_AUTHENTICATED_LEGALIZED
    }

    struct VaultRecord {
        bytes32 categoryHash;       // SHA-256 hash of structured JSON or raw document
        VerificationTier tier;     // Tier 1 vs Tier 2
        uint256 timestamp;         // Block timestamp of attestation
        address committer;         // Address submitting record
        address notary;            // Accredited notary/registrar (for Tier 2)
        bytes notarySealSignature; // Cryptographic seal signature (for Tier 2)
        bool exists;
    }

    address public owner;
    
    // Mapping from vaultId + category key hash => VaultRecord
    mapping(bytes32 => VaultRecord) private records;

    // Authorized notaries / institutional registrars mapping
    mapping(address => bool) public authorizedNotaries;
    mapping(address => string) public notaryJurisdictions;

    event HashCommitted(
        bytes32 indexed recordKey,
        bytes32 indexed categoryHash,
        VerificationTier tier,
        address indexed committer,
        uint256 timestamp
    );

    event NotaryStatusUpdated(
        address indexed notary,
        bool isAuthorized,
        string jurisdiction
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "SabiRegistry: caller is not the owner");
        _;
    }

    modifier onlyAuthorizedNotary() {
        require(authorizedNotaries[msg.sender], "SabiRegistry: caller is not an authorized notary");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Calculates unique storage key for a vault and category.
     */
    function computeRecordKey(string memory vaultId, string memory category) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(vaultId, ":", category));
    }

    /**
     * @dev Commits a Tier 1 (Standard Hashed) record.
     * Proves document existence and mathematical immutability upon cloud sync.
     */
    function commitTier1Hash(
        string calldata vaultId,
        string calldata category,
        bytes32 categoryHash
    ) external returns (bytes32 recordKey) {
        recordKey = computeRecordKey(vaultId, category);

        records[recordKey] = VaultRecord({
            categoryHash: categoryHash,
            tier: VerificationTier.TIER_1_STANDARD_HASHED,
            timestamp: block.timestamp,
            committer: msg.sender,
            notary: address(0),
            notarySealSignature: "",
            exists: true
        });

        emit HashCommitted(
            recordKey,
            categoryHash,
            VerificationTier.TIER_1_STANDARD_HASHED,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Commits a Tier 2 (Authenticated / Legalized) record by an authorized notary.
     * Binds notary seal, accredited identity, and hash on-chain.
     */
    function commitTier2NotarizedHash(
        string calldata vaultId,
        string calldata category,
        bytes32 categoryHash,
        bytes calldata notarySealSignature
    ) external onlyAuthorizedNotary returns (bytes32 recordKey) {
        recordKey = computeRecordKey(vaultId, category);

        records[recordKey] = VaultRecord({
            categoryHash: categoryHash,
            tier: VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED,
            timestamp: block.timestamp,
            committer: msg.sender,
            notary: msg.sender,
            notarySealSignature: notarySealSignature,
            exists: true
        });

        emit HashCommitted(
            recordKey,
            categoryHash,
            VerificationTier.TIER_2_AUTHENTICATED_LEGALIZED,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Verifies if a given hash matches the on-chain recorded hash for a vault category.
     * Used by the Multi-Agent Screening Engine to detect database tampering.
     */
    function verifyHash(
        string calldata vaultId,
        string calldata category,
        bytes32 expectedHash
    ) external view returns (bool isMatch, VerificationTier tier, uint256 timestamp) {
        bytes32 recordKey = computeRecordKey(vaultId, category);
        VaultRecord memory record = records[recordKey];

        if (!record.exists) {
            return (false, VerificationTier.NONE, 0);
        }

        isMatch = (record.categoryHash == expectedHash);
        return (isMatch, record.tier, record.timestamp);
    }

    /**
     * @dev Fetches complete record details.
     */
    function getRecord(
        string calldata vaultId,
        string calldata category
    ) external view returns (VaultRecord memory) {
        bytes32 recordKey = computeRecordKey(vaultId, category);
        require(records[recordKey].exists, "SabiRegistry: record does not exist");
        return records[recordKey];
    }

    /**
     * @dev Registers or revokes an accredited notary or institutional registrar.
     */
    function setNotaryAuthorization(
        address notary,
        bool isAuthorized,
        string calldata jurisdiction
    ) external onlyOwner {
        authorizedNotaries[notary] = isAuthorized;
        if (isAuthorized) {
            notaryJurisdictions[notary] = jurisdiction;
        }
        emit NotaryStatusUpdated(notary, isAuthorized, jurisdiction);
    }
}
