// src/components/BatchQR.tsx
import React, { useState } from "react";
import QRCode from "qrcode";
import { MedInput, MedButton, SectionTitle } from "./ui";

export default function BatchQR({ apiBase = "http://localhost:4000" }: { apiBase?: string }) {
  const [batchId, setBatchId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    if (!batchId) { setError("Enter batch ID."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/signBatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchId }),
      });

      if (!res.ok) throw new Error("Sign API failed: " + await res.text());

      const { token } = await res.json();
      const url = `${window.location.origin}/scan?data=${encodeURIComponent(token)}`;

      const dataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 6,
        color: { dark: "#0a1628", light: "#ffffff" },
      });

      setQrDataUrl(dataUrl);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `batch-${batchId || "qr"}.png`;
    a.click();
  }

  return (
    <div className="animate-fadeIn">
      <SectionTitle>Generate Batch QR</SectionTitle>

      <p className="text-slate-500 text-sm mb-6">
        Generate a signed QR code for batch authenticity verification.
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-slate-500 font-mono mb-1.5 block tracking-wider uppercase">Batch ID</label>
          <MedInput
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter Batch ID"
          />
        </div>
        <MedButton loading={loading} onClick={generate}>
          {!loading && "Generate QR"}
        </MedButton>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/30 rounded-lg px-4 py-3 font-mono">
          {error}
        </div>
      )}

      {qrDataUrl && (
        <div className="mt-6 flex flex-col items-center bg-[#050d1a] border border-cyan-900/30 rounded-xl p-8">
          {/* QR frame */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-xl border border-cyan-500/20 animate-pulse" />
            <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 rounded-lg" />
          </div>

          <p className="text-xs text-slate-500 font-mono mt-4 mb-4">
            Batch: <span className="text-cyan-400">{batchId}</span>
          </p>

          <button
            onClick={download}
            className="px-5 py-2 text-xs rounded-lg border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition font-mono"
          >
            ↓ Download PNG
          </button>
        </div>
      )}
    </div>
  );
}