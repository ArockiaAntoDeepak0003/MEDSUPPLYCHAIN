// src/utils/contractConfig.ts
import medArtifact from "../contracts/MedSupplyChain.json";

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace if redeployed
export const CONTRACT_ABI = (medArtifact as any).abi ?? medArtifact;