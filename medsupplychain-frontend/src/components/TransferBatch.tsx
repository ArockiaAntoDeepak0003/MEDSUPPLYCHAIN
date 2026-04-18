// src/components/TransferBatch.tsx
import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contractConfig";
import { MedInput, MedButton, SectionTitle, StatusBadge } from "./ui";

function isHexAddress(a?: string) {
  return !!a && /^0x[a-fA-F0-9]{40}$/.test(a);
}

export default function TransferBatch() {
  const { contract, provider, signer, address } = useWallet();

  const [batchId, setBatchId] = useState("");
  const [newHolder, setNewHolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!batchId) return setMsg("Enter batch ID.");
    if (!isHexAddress(newHolder)) return setMsg("Enter valid 0x… address.");
    if (!provider && !signer && !contract) return setMsg("Connect wallet first.");

    let c = contract;
    try {
      if (!c || !c.transferBatch) {
        const s = signer ?? (provider ? await provider.getSigner() : null);
        if (!s) return setMsg("No signer available. Reconnect wallet.");
        c = new (ethers as any).Contract(CONTRACT_ADDRESS, CONTRACT_ABI as any, s);
      }

      setBusy(true);
      setMsg("Sending transaction...");
      const tx = await c.transferBatch(batchId, newHolder);
      setMsg("Transaction sent: " + tx.hash);
      await tx.wait();
      setMsg("Transfer confirmed ✔ " + tx.hash);
    } catch (err: any) {
      const reason = err?.reason || err?.error?.message || err?.message || String(err);
      setMsg("Transfer failed: " + reason);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <SectionTitle>Transfer Batch</SectionTitle>

      <p className="text-slate-500 text-sm mb-6">
        Transfer custody of a batch to a new holder address on-chain.
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">Batch ID</label>
          <MedInput value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="e.g. BATCH-2024-001" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">New Holder Address</label>
          <MedInput value={newHolder} onChange={(e) => setNewHolder(e.target.value)} placeholder="0x..." />
        </div>

        <div className="pt-2">
          <MedButton loading={busy} type="submit">
            Transfer Batch
          </MedButton>
        </div>

        <StatusBadge msg={msg} />
      </form>
    </div>
  );
}