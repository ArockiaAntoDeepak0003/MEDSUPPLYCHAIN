// src/contexts/WalletContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contractConfig";

type WalletState = {
  provider: any | null;
  contract: any | null;
  address: string | null;
  signer: any | null;
  chainId: number | null;
};

const WalletContext = createContext<WalletState | undefined>(undefined);

// 🔐 Hardhat local configuration
const RPC_URL = "http://127.0.0.1:8545";
const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<any | null>(null);
  const [contract, setContract] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // 1️⃣ Create provider
        const p = new ethers.JsonRpcProvider(RPC_URL);
        setProvider(p);

        // 2️⃣ Create signer from private key
        const s = new ethers.Wallet(PRIVATE_KEY, p);
        setSigner(s);

        // 3️⃣ Get address
        const addr = await s.getAddress();
        setAddress(addr);

        // 4️⃣ Network info
        const net = await p.getNetwork();
        setChainId(Number(net.chainId));

        // 5️⃣ Create contract attached to signer
        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI as any, s);
        setContract(c);

        console.log("✅ Hardhat auto-connected");
        console.log("Address:", addr);
        console.log("Chain ID:", net.chainId);
      } catch (err) {
        console.error("Wallet init failed:", err);
      }
    }

    init();
  }, []);

  return (
    <WalletContext.Provider
      value={{ provider, contract, address, signer, chainId }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}