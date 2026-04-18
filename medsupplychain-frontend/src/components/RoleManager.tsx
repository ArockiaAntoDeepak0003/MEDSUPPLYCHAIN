// src/components/RoleManager.tsx
import React, { useEffect, useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { MedInput, MedButton, SectionTitle } from "./ui";

export default function RoleManager(): JSX.Element {
  const { contract, address } = useWallet();

  const [adminTarget, setAdminTarget] = useState("");
  const [manufacturerTarget, setManufacturerTarget] = useState("");
  const [distributorTarget, setDistributorTarget] = useState("");
  const [regulatorTarget, setRegulatorTarget] = useState("");

  const [DEFAULT_ADMIN_ROLE, setDEFAULT_ADMIN_ROLE] = useState<string | null>(null);
  const [MANUFACTURER_ROLE, setMANUFACTURER_ROLE] = useState<string | null>(null);
  const [DISTRIBUTOR_ROLE, setDISTRIBUTOR_ROLE] = useState<string | null>(null);
  const [REGULATOR_ROLE, setREGULATOR_ROLE] = useState<string | null>(null);

  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [hasManufacturer, setHasManufacturer] = useState<boolean | null>(null);
  const [hasDistributor, setHasDistributor] = useState<boolean | null>(null);
  const [hasRegulator, setHasRegulator] = useState<boolean | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      if (!contract) return;
      try {
        if (contract.DEFAULT_ADMIN_ROLE) setDEFAULT_ADMIN_ROLE(await contract.DEFAULT_ADMIN_ROLE());
        if (contract.MANUFACTURER_ROLE) setMANUFACTURER_ROLE(await contract.MANUFACTURER_ROLE());
        if (contract.DISTRIBUTOR_ROLE) setDISTRIBUTOR_ROLE(await contract.DISTRIBUTOR_ROLE());
        if (contract.REGULATOR_ROLE) setREGULATOR_ROLE(await contract.REGULATOR_ROLE());
      } catch (e) { console.warn(e); }
    }
    loadRoles();
  }, [contract]);

  useEffect(() => {
    async function checkRoles() {
      if (!contract || !address) return;
      try {
        if (DEFAULT_ADMIN_ROLE) setHasAdmin(await contract.hasRole(DEFAULT_ADMIN_ROLE, address));
        if (MANUFACTURER_ROLE) setHasManufacturer(await contract.hasRole(MANUFACTURER_ROLE, address));
        if (DISTRIBUTOR_ROLE) setHasDistributor(await contract.hasRole(DISTRIBUTOR_ROLE, address));
        if (REGULATOR_ROLE) setHasRegulator(await contract.hasRole(REGULATOR_ROLE, address));
      } catch (e) { console.warn(e); }
    }
    checkRoles();
  }, [contract, address, DEFAULT_ADMIN_ROLE, MANUFACTURER_ROLE, DISTRIBUTOR_ROLE, REGULATOR_ROLE]);

  async function grant(roleId: string | null, target: string) {
    if (!contract) return setMsg("Connect wallet first");
    if (!roleId) return setMsg("Role ID not loaded");
    if (!target.startsWith("0x") || target.length < 42) return setMsg("Invalid address");

    try {
      setBusy(true);
      setMsg("Sending transaction...");
      const tx = await contract.grantRole(roleId, target);
      await tx.wait();
      setMsg("Role granted successfully ✔");
    } catch (e: any) {
      setMsg("Grant failed: " + (e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  function RoleCard({ title, roleId, hasRole, target, setTarget }: any) {
    const roleColors: Record<string, string> = {
      DEFAULT_ADMIN:  "cyan",
      MANUFACTURER:   "blue",
      DISTRIBUTOR:    "indigo",
      REGULATOR:      "sky",
    };
    const color = roleColors[title] ?? "cyan";

    return (
      <div className="bg-[#050d1a] border border-cyan-900/20 rounded-xl p-5 space-y-3 hover:border-cyan-900/40 transition">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white font-mono">{title}</h4>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5 break-all">
              {roleId ? roleId.slice(0, 20) + "…" : "Loading…"}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
            hasRole === true
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
              : hasRole === false
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : "bg-slate-800 text-slate-500 border-slate-700"
          }`}>
            {hasRole === true ? "GRANTED" : hasRole === false ? "NO ROLE" : "—"}
          </span>
        </div>

        <MedInput
          value={target}
          onChange={(e: any) => setTarget(e.target.value)}
          placeholder="Target address (0x...)"
        />

        <MedButton disabled={busy} onClick={() => grant(roleId, target)}>
          Grant {title}
        </MedButton>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <SectionTitle>Role Management</SectionTitle>

      <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 font-mono bg-[#050d1a] border border-cyan-900/20 rounded-lg px-4 py-2.5">
        <span className="text-slate-600">Connected:</span>
        <span className="text-cyan-400">{address ?? "Not connected"}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RoleCard title="DEFAULT_ADMIN" roleId={DEFAULT_ADMIN_ROLE} hasRole={hasAdmin} target={adminTarget} setTarget={setAdminTarget} />
        <RoleCard title="MANUFACTURER" roleId={MANUFACTURER_ROLE} hasRole={hasManufacturer} target={manufacturerTarget} setTarget={setManufacturerTarget} />
        <RoleCard title="DISTRIBUTOR" roleId={DISTRIBUTOR_ROLE} hasRole={hasDistributor} target={distributorTarget} setTarget={setDistributorTarget} />
        <RoleCard title="REGULATOR" roleId={REGULATOR_ROLE} hasRole={hasRegulator} target={regulatorTarget} setTarget={setRegulatorTarget} />
      </div>

      {msg && (
        <div className={`mt-5 text-xs px-4 py-3 rounded-lg border font-mono ${
          msg.includes("✔")
            ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/5"
            : msg.includes("failed")
            ? "border-red-500/40 text-red-400 bg-red-500/5"
            : "border-blue-500/40 text-blue-400 bg-blue-500/5"
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}