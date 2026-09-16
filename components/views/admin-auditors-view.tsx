"use client";

import { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Clock,
  Briefcase,
  History,
  TrendingUp,
  Search
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import type { AuditorPerformance } from "@/types";

export function AdminAuditorsView() {
  const { buildings, auditorList, reassignAuditor, adminLogs } = useStore();
  const [selectedAuditor, setSelectedAuditor] = useState<AuditorPerformance | null>(null);
  const [reassignModal, setReassignModal] = useState<{ fromAuditorId: string; fromAuditorName: string } | null>(null);
  const [targetAuditorId, setTargetAuditorId] = useState("aud-02");
  const [reassignReason, setReassignReason] = useState("Workload rebalancing due to delayed hospital inspections");
  const [actionSuccess, setActionSuccess] = useState("");
  const [query, setQuery] = useState("");

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModal) return;

    const targetAuditor = auditorList.find((a) => a.id === targetAuditorId);
    if (!targetAuditor) return;

    reassignAuditor(reassignModal.fromAuditorId, targetAuditorId, reassignReason);
    setActionSuccess(
      `All buildings from ${reassignModal.fromAuditorName} have been successfully reassigned to ${targetAuditor.name}. Admin activity log recorded.`
    );
    setReassignModal(null);
  };

  const filtered = auditorList.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell title="Auditor Management & Performance" eyebrow="Administrator Oversight">
      {/* Top Banner */}
      <section className="rounded-2xl bg-[#12382d] p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9fc8b9]">
              Field Staff Governance
            </p>
            <h2 className="mt-1 text-2xl font-black">Certified Auditor Monitoring &amp; Reassignment</h2>
            <p className="mt-1 text-sm text-[#c9ddd5]">
              Track inspection velocity, verification times, and active workloads. Reassign buildings seamlessly when audits stall.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
              <span className="block text-2xl font-black">{auditorList.length}</span>
              <span className="text-xs text-[#b8d8cb]">Active Auditors</span>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
              <span className="block text-2xl font-black">2.1d</span>
              <span className="text-xs text-[#b8d8cb]">Avg Verify Time</span>
            </div>
          </div>
        </div>
      </section>

      {actionSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#dfe6e1] bg-white p-3">
        <Search size={18} className="text-[#71827a] ml-2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search auditor by name or email…"
          className="w-full py-1 text-sm outline-none"
        />
      </div>

      {/* Auditor Performance Table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-[#dfe6e1] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left">
            <thead className="bg-[#f2f6f4] text-xs font-black uppercase tracking-wider text-[#52645a]">
              <tr>
                <th className="p-4">Auditor</th>
                <th className="p-4">Assigned Buildings</th>
                <th className="p-4">Visits</th>
                <th className="p-4">Complaints Reviewed</th>
                <th className="p-4">Issues Verified</th>
                <th className="p-4">Avg Verify Time</th>
                <th className="p-4">Workload</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9f0ec] text-sm">
              {filtered.map((auditor) => (
                <tr key={auditor.id} className="hover:bg-[#fafcfb] transition">
                  <td className="p-4">
                    <p className="font-extrabold text-[#12382d]">{auditor.name}</p>
                    <p className="text-xs text-[#6e8077]">{auditor.email}</p>
                  </td>
                  <td className="p-4 font-black">{auditor.assignedBuildings}</td>
                  <td className="p-4 font-bold">{auditor.visits}</td>
                  <td className="p-4 font-bold">{auditor.complaintsReviewed}</td>
                  <td className="p-4 font-black text-[#0b5d45]">{auditor.issuesVerified}</td>
                  <td className="p-4 font-bold">{auditor.avgVerificationDays} days</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                        auditor.currentWorkload === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : auditor.currentWorkload === "HIGH"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {auditor.currentWorkload}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        setReassignModal({
                          fromAuditorId: auditor.id,
                          fromAuditorName: auditor.name
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-[#c5d6cc] bg-white px-3 py-2 text-xs font-black text-[#0b5d45] hover:bg-[#eff7f3]"
                    >
                      <RotateCw size={13} /> Reassign Buildings
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black text-[#12382d]">Reassign Buildings from {reassignModal.fromAuditorName}</h3>
            <p className="mt-1 text-xs text-[#66736c]">
              Transfer all monitored facilities to another qualified certified auditor.
            </p>

            <form onSubmit={handleReassignSubmit} className="mt-5 space-y-4 text-sm">
              <label className="block font-bold text-[#1f332a]">
                Transfer All Buildings To:
                <select
                  value={targetAuditorId}
                  onChange={(e) => setTargetAuditorId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white p-3 font-normal outline-none focus:border-[#0b5d45]"
                >
                  {auditorList
                    .filter((a) => a.id !== reassignModal.fromAuditorId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currentWorkload} workload — {a.assignedBuildings} buildings)
                      </option>
                    ))}
                </select>
              </label>

              <label className="block font-bold text-[#1f332a]">
                Reason for Reassignment (Logged in Admin Audit Trail)
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-[#cad5cf] p-3 font-normal outline-none focus:border-[#0b5d45]"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#0b5d45] py-3.5 font-black text-white hover:bg-[#074634]"
                >
                  Confirm Reassignment
                </button>
                <button
                  type="button"
                  onClick={() => setReassignModal(null)}
                  className="rounded-xl border border-[#ccd6d0] px-4 py-3.5 font-bold hover:bg-[#f3f7f5]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Activity Log Section */}
      <section className="mt-8 rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-[#12382d] flex items-center gap-2">
          <History size={18} className="text-[#0b5d45]" />
          Admin Activity &amp; Audit Trail
        </h3>
        <p className="text-xs text-[#6e8077] mt-0.5">
          Chronological log of administrative actions, auditor reassignments, and enforcement measures.
        </p>

        <div className="mt-4 space-y-3">
          {adminLogs.map((log) => (
            <article key={log.id} className="rounded-xl border border-[#e2eae5] bg-[#fafcfb] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#0b5d45] uppercase tracking-wider">{log.action}</span>
                <span className="text-[#73857c]">{log.createdAt}</span>
              </div>
              <p className="mt-1.5 text-sm text-[#273a31] font-medium leading-5">{log.description}</p>
              <span className="mt-2 block text-[11px] text-[#71827a]">Authorized by: {log.adminName}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
