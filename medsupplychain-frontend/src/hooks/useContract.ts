// src/hooks/useContract.ts
import { Contract } from "ethers";
import { useMemo } from "react";
import { ethers } from "ethers";

export function useContract(abi: any, address: string | null) {
  return useMemo(() => {
    if (!abi || !address) return null;
    try {
      if (typeof window === "undefined") return null;
      const eth = (window as any).ethereum;
      const provider = eth ? new ethers.providers.Web3Provider(eth as any, "any") : ethers.getDefaultProvider();
      // use signer if available
      const signer = provider.getSigner?.();
      const signerOrProvider = signer ?? provider;
      return new Contract(address, abi, signerOrProvider as any);
    } catch (err) {
      console.error("useContract error", err);
      return null;
    }
  }, [abi, address]);
}
