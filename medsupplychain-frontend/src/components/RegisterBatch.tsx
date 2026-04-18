// src/components/RegisterBatch.tsx
import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/contractConfig";
import { ethers } from "ethers";
import { MedInput, MedButton, SectionTitle, StatusBadge } from "./ui";

export default function RegisterBatch(): JSX.Element {
  const { provider } = useWallet();

  const [batchId, setBatchId] = useState("");
  const [productId, setProductId] = useState("");
  const [productHash, setProductHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!provider) { setMsg("Connect wallet first."); return; }
    if (!batchId || !productId || !productHash) { setMsg("Fill all fields."); return; }

    setLoading(true);
    setMsg(null);
    try {
      const signer = await provider.getSigner();
      const signerAddr = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI as any, signer);

      let manufacturerRole: string | null = null;
      try {
        if (typeof contract.MANUFACTURER_ROLE === "function") {
          manufacturerRole = await contract.MANUFACTURER_ROLE();
        }
      } catch {}

      if (manufacturerRole) {
        const has = await contract.hasRole(manufacturerRole, signerAddr);
        if (!has) { setLoading(false); setMsg("You do not have MANUFACTURER_ROLE."); return; }
      }

      const tx = await contract.registerBatch(batchId, productId, productHash);
      setMsg("Transaction sent: " + tx.hash);
      await tx.wait();
      setMsg("Batch registered successfully ✔");
      setBatchId(""); setProductId(""); setProductHash("");
    } catch (err: any) {
      setMsg("Register failed: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <SectionTitle>Register New Batch</SectionTitle>

      <p className="text-slate-500 text-sm mb-6">
        Register a new pharmaceutical batch on-chain with manufacturer verification.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">Batch ID</label>
          <MedInput value={batchId} onChange={(e) => setBatchId(e.target.value)} placeholder="e.g. BATCH-2024-001" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">Product ID</label>
          <MedInput value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="e.g. PROD-AMOX-500" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">Product Hash</label>
          <MedInput value={productHash} onChange={(e) => setProductHash(e.target.value)} placeholder="0x..." />
        </div>

        <div className="pt-2">
          <MedButton loading={loading} onClick={submit}>
            Register Batch
          </MedButton>
        </div>

        <StatusBadge msg={msg} />
      </div>
    </div>
  );
}