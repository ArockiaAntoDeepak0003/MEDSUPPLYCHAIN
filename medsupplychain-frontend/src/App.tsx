import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import ConnectWallet from "./components/ConnectWallet";
import RegisterBatch from "./components/RegisterBatch";
import BatchLookup from "./components/BatchLookup";
import TransferBatch from "./components/TransferBatch";
import ContractEvents from "./components/ContractEvents";
import { WalletProvider } from "./contexts/WalletContext";
import RoleManager from "./components/RoleManager";
import BatchQR from "./components/BatchQR";
import About from "./pages/About";
import ScanPage from "./pages/Scan";

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="relative min-h-screen bg-[#050d1a] text-slate-200 overflow-hidden">

          {/* Ambient background glow */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-cyan-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-blue-900/20 rounded-full blur-[100px]" />
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="relative z-10">
            <header className="border-b border-cyan-900/40 bg-[#050d1a]/80 backdrop-blur-md px-8 py-4 flex justify-between items-center sticky top-0 z-50">
              <div className="flex items-center gap-10">

                <NavLink to="/" className="flex items-center gap-2.5">
                  {/* Logo mark */}
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v6M8 9v6M1 8h6M9 8h6" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="8" cy="8" r="2" fill="#22d3ee" fillOpacity="0.3" stroke="#22d3ee" strokeWidth="1"/>
                    </svg>
                  </div>
                  <span className="text-lg font-semibold tracking-wide text-white font-mono">
                    Med<span className="text-cyan-400">Supply</span>Chain
                  </span>
                </NavLink>

                <nav className="flex gap-1 text-sm">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "px-4 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium text-sm transition"
                        : "px-4 py-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition text-sm"
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/about"
                    className={({ isActive }) =>
                      isActive
                        ? "px-4 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium text-sm transition"
                        : "px-4 py-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition text-sm"
                    }
                  >
                    About
                  </NavLink>
                </nav>
              </div>

              <ConnectWallet />
            </header>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/scan" element={<ScanPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </WalletProvider>
  );
}

/* ---------------- TAB CONFIG ---------------- */

const TABS = [
  { id: "register", label: "Register Batch", icon: "＋" },
  { id: "lookup",   label: "Lookup Batch",   icon: "⌕" },
  { id: "transfer", label: "Transfer Batch", icon: "⇄" },
  { id: "qr",       label: "Generate QR",    icon: "⊞" },
  { id: "roles",    label: "Role Manager",   icon: "⚙" },
  { id: "events",   label: "Events",         icon: "◎" },
];

/* ---------------- HOME PAGE ---------------- */

function Home() {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-cyan-500/60 font-mono mb-2 tracking-widest uppercase">
          <span className="w-4 h-px bg-cyan-500/40 inline-block" />
          Blockchain Supply Dashboard
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Supply Chain Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage pharmaceutical batches on-chain with full traceability.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-[#0a1628] border border-cyan-900/30 rounded-xl p-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Panel>
        {activeTab === "register" && <RegisterBatch />}
        {activeTab === "lookup"   && <BatchLookup />}
        {activeTab === "transfer" && <TransferBatch />}
        {activeTab === "qr"       && <BatchQR />}
        {activeTab === "roles"    && <RoleManager />}
        {activeTab === "events"   && <ContractEvents />}
      </Panel>
    </main>
  );
}

/* ---------------- PANEL (replaces Card) ---------------- */

export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0a1628] border border-cyan-900/30 rounded-xl p-6 shadow-[0_0_40px_rgba(34,211,238,0.03)]">
      {children}
    </div>
  );
}