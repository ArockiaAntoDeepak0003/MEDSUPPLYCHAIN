// src/components/ConnectWallet.tsx
import React from "react";
import { useWallet } from "../contexts/WalletContext";

export default function ConnectWallet() {
  const { address, chainId } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {address ? (
        <div className="flex items-center gap-3 bg-[#0a1628] border border-cyan-900/40 rounded-lg px-4 py-2">
          {/* Live indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <div>
            <div className="text-xs text-cyan-400 font-mono">
              {address.slice(0, 6)}…{address.slice(-4)}
            </div>
            <div className="text-[10px] text-slate-600">
              Chain {chainId} · Hardhat
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-red-400 text-xs font-mono">Not connected</span>
        </div>
      )}
    </div>
  );
}