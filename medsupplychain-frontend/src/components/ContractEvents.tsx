// src/components/ContractEvents.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import medArtifact from "../contracts/MedSupplyChain.json";
import { SectionTitle } from "./ui";

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const CONTRACT_ABI = (medArtifact as any).abi ?? medArtifact;

type RawLog = ethers.providers.Log & { transactionHash: string; logIndex: number; blockNumber?: number };
type EvRow = { id: string; txHash?: string; blockNumber?: number; name: string; args: Record<string, any>; logIndex: number; };
type Group = { txHash?: string; blockNumber?: number; rows: EvRow[]; firstEventName?: string; };

const EVENT_COLORS: Record<string, string> = {
  BatchRegistered:  "cyan",
  BatchTransferred: "blue",
  BatchRecalled:    "red",
  RoleGranted:      "indigo",
};

const EVENT_ICONS: Record<string, string> = {
  BatchRegistered:  "＋",
  BatchTransferred: "⇄",
  BatchRecalled:    "⚠",
  RoleGranted:      "⚙",
};

export default function ContractEvents(): JSX.Element {
  const { provider: ctxProvider } = useWallet();
  const [listening, setListening] = useState(true);
  const [groupsMap, setGroupsMap] = useState<Map<string, Group>>(new Map());
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState<"all" | "registered" | "transferred" | "recalled">("all");
  const [expandedTx, setExpandedTx] = useState<Record<string, boolean>>({});

  function namedArgs(parsedArgs: any) {
    const out: Record<string, any> = {};
    if (!parsedArgs) return out;
    for (const k of Object.keys(parsedArgs)) {
      if (Number.isInteger(Number(k))) continue;
      out[k] = parsedArgs[k];
    }
    return out;
  }

  function pushRow(row: EvRow) {
    setGroupsMap(prev => {
      const next = new Map(prev);
      const key = row.txHash ?? row.id;
      let g = next.get(key);
      if (!g) { g = { txHash: row.txHash, blockNumber: row.blockNumber, rows: [], firstEventName: row.name }; next.set(key, g); }
      if (!g.rows.find(r => r.id === row.id)) {
        g.rows = [row, ...g.rows];
        if (!g.blockNumber && row.blockNumber) g.blockNumber = row.blockNumber;
      }
      return next;
    });
  }

  useEffect(() => {
    let mounted = true;
    let ethersProvider: ethers.providers.Provider | null = null;
    let contract: ethers.Contract | null = null;
    let iface = new ethers.Interface(CONTRACT_ABI as any);

    async function setup() {
      try {
        let p: any = ctxProvider ?? null;
        if (!p && (window as any).ethereum) {
          if ((ethers as any).BrowserProvider) { ethersProvider = new (ethers as any).BrowserProvider((window as any).ethereum) as any; }
          else if ((ethers as any).providers?.Web3Provider) { ethersProvider = new (ethers as any).providers.Web3Provider((window as any).ethereum) as any; }
          else { ethersProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); }
          p = ethersProvider;
        } else if (p) { ethersProvider = p; }
        if (!p) return;

        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI as any, p as any);
        if (mounted) setConnected(true);

        const onRegistered = (batchId: string, productId: string, manufacturer: string, event: any) => {
          if (!listening) return;
          pushRow({ id: `${event.transactionHash}-${event.logIndex}`, txHash: event.transactionHash, blockNumber: event.blockNumber, name: "BatchRegistered", args: { batchId, productId, manufacturer }, logIndex: event.logIndex });
        };
        const onTransferred = (batchId: string, from: string, to: string, event: any) => {
          if (!listening) return;
          pushRow({ id: `${event.transactionHash}-${event.logIndex}`, txHash: event.transactionHash, blockNumber: event.blockNumber, name: "BatchTransferred", args: { batchId, from, to }, logIndex: event.logIndex });
        };
        const onRecalled = (batchId: string, by: string, event: any) => {
          if (!listening) return;
          pushRow({ id: `${event.transactionHash}-${event.logIndex}`, txHash: event.transactionHash, blockNumber: event.blockNumber, name: "BatchRecalled", args: { batchId, by }, logIndex: event.logIndex });
        };

        try {
          contract.on?.("BatchRegistered", onRegistered);
          contract.on?.("BatchTransferred", onTransferred);
          contract.on?.("BatchRecalled", onRecalled);
          contract.on?.("RoleGranted", (...args: any[]) => {
            const event = args[args.length - 1];
            if (!listening) return;
            pushRow({ id: `${event.transactionHash}-${event.logIndex}`, txHash: event.transactionHash, blockNumber: event.blockNumber, name: "RoleGranted", args: namedArgs(event.args), logIndex: event.logIndex });
          });
        } catch (e) {}

        (async () => {
          try {
            const latest = await (p as any).getBlockNumber();
            const from = Math.max(0, latest - 2000);
            const filters: { topicFilter: any; name: string }[] = [];
            if ((contract as any).filters) {
              const fReg = (contract as any).filters.BatchRegistered?.();
              const fTrans = (contract as any).filters.BatchTransferred?.();
              const fRec = (contract as any).filters.BatchRecalled?.();
              const fRole = (contract as any).filters.RoleGranted?.();
              if (fReg) filters.push({ topicFilter: fReg, name: "BatchRegistered" });
              if (fTrans) filters.push({ topicFilter: fTrans, name: "BatchTransferred" });
              if (fRec) filters.push({ topicFilter: fRec, name: "BatchRecalled" });
              if (fRole) filters.push({ topicFilter: fRole, name: "RoleGranted" });
            }

            for (const item of filters) {
              try {
                const logs: RawLog[] = (await (p as any).getLogs({ ...(item.topicFilter as object), fromBlock: from, toBlock: latest })) as RawLog[];
                for (const log of logs.reverse()) {
                  try {
                    const parsed = iface.parseLog(log);
                    pushRow({ id: `${log.transactionHash}-${log.logIndex}`, txHash: log.transactionHash, blockNumber: log.blockNumber, name: parsed.name, args: namedArgs(parsed.args), logIndex: log.logIndex });
                  } catch (e) {}
                }
              } catch (err) {}
            }
          } catch (err) {}
        })();
      } catch (err) {}
    }

    setup();
    return () => {
      mounted = false;
      try { contract?.removeAllListeners?.(); } catch (e) {}
      setConnected(false);
    };
  }, [ctxProvider, listening]);

  const groups = useMemo(() => {
    const arr = Array.from(groupsMap.values());
    arr.sort((a, b) => {
      const ba = a.blockNumber ?? 0, bb = b.blockNumber ?? 0;
      if (ba !== bb) return bb - ba;
      return (b.txHash ?? "").localeCompare(a.txHash ?? "");
    });
    return arr;
  }, [groupsMap]);

  const filteredGroups = useMemo(() => {
    if (filter === "all") return groups;
    const wanted = filter === "registered" ? "BatchRegistered" : filter === "transferred" ? "BatchTransferred" : "BatchRecalled";
    return groups.map(g => { const rows = g.rows.filter(r => r.name === wanted); return rows.length ? { ...g, rows } : null; }).filter(Boolean) as Group[];
  }, [groups, filter]);

  function toggleExpand(tx?: string) {
    if (!tx) return;
    setExpandedTx(prev => ({ ...prev, [tx]: !prev[tx] }));
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch (e) {}
  }

  const FILTERS = ["all", "registered", "transferred", "recalled"] as const;

  return (
    <div className="animate-fadeIn">
      <SectionTitle>Contract Events</SectionTitle>

      {/* Controls */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                filter === f
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "bg-transparent text-slate-500 border-slate-800 hover:border-cyan-900/50 hover:text-slate-300"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!connected && (
            <span className="text-xs text-slate-600 font-mono">No provider</span>
          )}
          <button
            onClick={() => setListening(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border font-mono transition ${
              listening
                ? "bg-cyan-500/5 text-cyan-500 border-cyan-500/20 hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/20"
                : "bg-red-500/5 text-red-400 border-red-500/20 hover:bg-cyan-500/5 hover:text-cyan-400 hover:border-cyan-500/20"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${listening ? "bg-cyan-400 animate-pulse" : "bg-red-400"}`} />
            {listening ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 text-slate-600 font-mono text-sm">
          No events to display
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGroups.map((g) => {
            const tx = g.txHash ?? Math.random().toString();
            const eventName = g.firstEventName ?? g.rows[0]?.name;
            const color = EVENT_COLORS[eventName] ?? "cyan";
            const icon = EVENT_ICONS[eventName] ?? "◎";

            return (
              <div key={tx} className="bg-[#050d1a] border border-cyan-900/20 rounded-xl p-4 hover:border-cyan-900/40 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                      color === "red" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      color === "blue" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                      "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    }`}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{eventName}</div>
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                        Block {g.blockNumber ?? "—"} · {g.txHash?.slice(0, 10)}…
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleExpand(tx)}
                      className="px-3 py-1 text-xs rounded-lg border border-cyan-900/30 text-slate-500 hover:border-cyan-500/40 hover:text-cyan-400 transition font-mono"
                    >
                      {expandedTx[tx] ? "Hide" : "Details"}
                    </button>
                    {g.txHash && (
                      <button
                        onClick={() => copyToClipboard(g.txHash!)}
                        className="px-3 py-1 text-xs rounded-lg border border-cyan-900/30 text-slate-500 hover:border-cyan-500/40 hover:text-cyan-400 transition font-mono"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>

                {expandedTx[tx] && (
                  <div className="mt-4 space-y-2 border-t border-cyan-900/20 pt-4">
                    {g.rows.map((r) => (
                      <div key={r.id} className="bg-[#0a1628] border border-cyan-900/20 rounded-lg p-3">
                        <div className="text-xs text-cyan-400 font-mono font-semibold mb-2">{r.name}</div>
                        {Object.entries(r.args).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs py-1 border-b border-cyan-900/10 last:border-0">
                            <span className="text-slate-500 font-mono">{k}</span>
                            <span className="text-slate-300 font-mono break-all max-w-xs text-right">{String(v)}</span>
                          </div>
                        ))}
                        <div className="text-[10px] text-slate-600 font-mono mt-2">
                          Block {r.blockNumber ?? "—"} · LogIdx {r.logIndex}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}