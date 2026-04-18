// src/pages/About.tsx
import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#050d1a] text-slate-200 px-6 py-16">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Hero */}
        <div className="mb-16 animate-fadeInUp">
          <div className="flex items-center gap-2 text-xs text-cyan-500/60 font-mono mb-4 tracking-widest uppercase">
            <span className="w-6 h-px bg-cyan-500/40 inline-block" />
            Final Year Project
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Med<span className="text-cyan-400">Supply</span>Chain
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            A blockchain-based pharmaceutical tracking system designed to ensure
            transparency, authenticity, and security throughout the drug supply lifecycle.
          </p>
        </div>

        {/* Problem / Solution */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#0a1628] border border-cyan-900/30 rounded-xl p-8 animate-fadeInUp">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl mb-5">⚠</div>
            <h2 className="text-lg font-semibold text-white mb-3">The Problem</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Counterfeit drugs, lack of traceability, and manual verification processes
              create serious risks in pharmaceutical supply chains. Traditional systems
              are centralized, vulnerable to tampering, and lack transparency.
            </p>
          </div>

          <div className="bg-[#0a1628] border border-cyan-900/30 rounded-xl p-8 animate-fadeInUp">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl mb-5">⛓</div>
            <h2 className="text-lg font-semibold text-white mb-3">Our Solution</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Using blockchain technology, MedSupplyChain provides tamper-proof tracking
              of drug batches from manufacturer to distributor to regulator, ensuring
              secure and verifiable transfer of ownership.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Solidity Smart Contracts", icon: "◈" },
              { label: "Hardhat Blockchain",       icon: "⬡" },
              { label: "React + Tailwind UI",      icon: "◻" },
              { label: "MetaMask Integration",     icon: "⬢" },
              { label: "Ethers.js",                icon: "◎" },
              { label: "QR Code Verification",     icon: "⊞" },
            ].map((tech) => (
              <div
                key={tech.label}
                className="bg-[#0a1628] border border-cyan-900/20 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-cyan-500/30 transition"
              >
                <span className="text-cyan-500/60 text-lg">{tech.icon}</span>
                <span className="text-slate-400 text-sm">{tech.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-5 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Key Features</h2>
          </div>
          <div className="space-y-2">
            {[
              "Batch registration with manufacturer verification",
              "Secure transfer between supply chain participants",
              "Role-based access control system",
              "Real-time contract event monitoring",
              "QR-based batch authenticity validation",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-cyan-900/20 last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                <span className="text-slate-400 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Future Scope */}
        <div className="bg-[#0a1628] border border-cyan-900/30 rounded-xl p-8 animate-fadeInUp">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Future Scope</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            Future enhancements include deployment on public blockchain networks,
            integration with IoT-based tracking systems, advanced analytics dashboards,
            and regulatory compliance modules for large-scale pharmaceutical operations.
          </p>
        </div>

      </div>
    </div>
  );
}