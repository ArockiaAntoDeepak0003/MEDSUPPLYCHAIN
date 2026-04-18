// src/pages/Scan.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import medArtifact from "../contracts/MedSupplyChain.json";

const CONTRACT_ABI = (medArtifact as any).abi ?? medArtifact;

type BatchInfo = { batch: string; recoveredSigner: string; history: any[]; };

export default function ScanPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [statusMsg, setStatusMsg] = useState("Waiting for token...");
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const data = params.get("data");

      if (!data) { setStatus("error"); setStatusMsg("No token provided."); return; }

      try {
        setStatusMsg("Decoding token...");
        const decoded = JSON.parse(atob(data));
        const { contract, batch, ts, sig } = decoded;

        if (!contract || !batch || !ts || !sig) { setStatus("error"); setStatusMsg("Invalid token structure."); return; }

        const now = Math.floor(Date.now() / 1000);
        if (now - ts > 86400) { setStatus("error"); setStatusMsg("Token expired."); return; }

        setStatusMsg("Verifying signature...");
        const payload = JSON.stringify({ contract, batch, ts });
        const recovered = ethers.verifyMessage(payload, sig);

        setStatusMsg("Loading batch from chain...");
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const c = new ethers.Contract(contract, CONTRACT_ABI, provider);
        const history = await c.getBatchHistory(batch);

        setBatchInfo({ batch, recoveredSigner: recovered, history });
        setStatus("success");
        setStatusMsg("Batch verified successfully.");
      } catch (err: any) {
        setStatus("error");
        setStatusMsg("Error: " + err.message);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#050d1a] text-slate-200 flex items-center justify-center px-6 py-16">

      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
            ⊞
          </div>
          <h2 className="text-2xl font-bold text-white">Batch Verification</h2>
          <p className="text-slate-500 text-sm mt-1">QR code authentication result</p>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-3 rounded-xl px-5 py-4 mb-6 border font-mono text-sm ${
          status === "success" ? "bg-cyan-500/5 border-cyan-500/30 text-cyan-400" :
          status === "error"   ? "bg-red-500/5 border-red-500/30 text-red-400" :
                                 "bg-blue-500/5 border-blue-500/30 text-blue-400"
        }`}>
          {status === "loading" && (
            <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          )}
          {status === "success" && <span className="text-base">✓</span>}
          {status === "error"   && <span className="text-base">✕</span>}
          {statusMsg}
        </div>

        {/* Batch Info */}
        {batchInfo && (
          <div className="bg-[#0a1628] border border-cyan-900/30 rounded-xl p-6 animate-fadeIn">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full bg-cyan-400" />
              <h3 className="text-base font-semibold text-white">Batch Details</h3>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-cyan-900/20">
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Batch ID</span>
                <span className="text-sm text-cyan-400 font-mono">{batchInfo.batch}</span>
              </div>
              <div className="flex items-start justify-between py-3 border-b border-cyan-900/20">
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Signed By</span>
                <span className="text-xs text-slate-300 font-mono break-all max-w-xs text-right">{batchInfo.recoveredSigner}</span>
              </div>
            </div>

            {/* History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Custody History</span>
                <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full px-2 py-0.5">
                  {batchInfo.history.length} record{batchInfo.history.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {batchInfo.history.map((h: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-[#050d1a] border border-cyan-900/20 rounded-lg px-4 py-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-500 font-mono">
                      {i + 1}
                    </div>
                    <span className="text-xs text-slate-300 font-mono break-all">{String(h)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}