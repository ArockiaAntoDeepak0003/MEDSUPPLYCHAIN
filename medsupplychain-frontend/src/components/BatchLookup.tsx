// src/components/BatchLookup.tsx
import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/contractConfig";
import { ethers } from "ethers";
import { MedInput, MedButton, SectionTitle } from "./ui";

export default function BatchLookup() {
  const { provider } = useWallet();

  const [batchId, setBatchId] = useState("");
  const [history, setHistory] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function lookup() {
    if (!batchId) return setMsg("Enter a batch ID.");
    if (!provider) return setMsg("Connect wallet first.");

    try {
      setLoading(true);
      setMsg(null);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI as any, provider);
      const result = await contract.getBatchHistory(batchId);
      setHistory(result.map((a: any) => a.toString()));
    } catch (err: any) {
      setMsg("Lookup failed: " + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <SectionTitle>Lookup Batch</SectionTitle>

      <p className="text-slate-500 text-sm mb-6">
        Retrieve the full on-chain custody history for any registered batch.
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">Batch ID</label>
          <MedInput
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter Batch ID"
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
        </div>
        <MedButton loading={loading} onClick={lookup}>
          {!loading && "Search"}
        </MedButton>
      </div>

      {msg && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-3 font-mono">
          {msg}
        </div>
      )}

      {history && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-mono tracking-wider uppercase">Custody History</span>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full px-2 py-0.5">
              {history.length} record{history.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-2">
            {history.map((addr, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#050d1a] border border-cyan-900/20 rounded-lg px-4 py-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-500 font-mono">
                  {i + 1}
                </div>
                <span className="text-xs text-slate-300 font-mono break-all">{addr}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}