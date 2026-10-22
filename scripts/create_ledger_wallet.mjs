import { ethers } from "ethers";

const wallet = ethers.Wallet.createRandom();

console.log("\n=======================================================");
console.log("       SabiProfile Dedicated Ledger Signer Wallet");
console.log("=======================================================\n");
console.log("Public Address (Paste into Faucet):");
console.log("👉", wallet.address);
console.log("\nPrivate Key (Paste into SabiProfile Dashboard):");
console.log("👉", wallet.privateKey);
console.log("\n=======================================================\n");

