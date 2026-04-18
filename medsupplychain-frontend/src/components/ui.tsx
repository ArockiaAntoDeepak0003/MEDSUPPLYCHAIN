// src/components/ui.tsx — shared input/button primitives
import React from "react";

export function MedInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#050d1a] border border-cyan-900/40 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:border-cyan-500/60 focus:outline-none transition text-sm font-mono ${props.className ?? ""}`}
    />
  );
}

export function MedButton({
  loading,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border ${
        loading || props.disabled
          ? "bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed"
          : "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(34,211,238,0.15)]"
      } ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Processing…
        </span>
      ) : children}
    </button>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-5 rounded-full bg-cyan-400" />
      <h3 className="text-base font-semibold text-white tracking-tight">{children}</h3>
    </div>
  );
}

export function StatusBadge({ msg }: { msg: string | null }) {
  if (!msg) return null;
  const isSuccess = msg.toLowerCase().includes("confirm") || msg.toLowerCase().includes("success");
  const isPending = msg.toLowerCase().includes("sent") || msg.toLowerCase().includes("sending") || msg.toLowerCase().includes("processing");
  const isError   = !isSuccess && !isPending;

  return (
    <div className={`mt-4 text-xs px-4 py-3 rounded-lg border font-mono ${
      isSuccess ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/5" :
      isPending ? "border-blue-500/40 text-blue-400 bg-blue-500/5" :
                  "border-red-500/40 text-red-400 bg-red-500/5"
    }`}>
      {msg}
    </div>
  );
}