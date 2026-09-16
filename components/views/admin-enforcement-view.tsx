"use client";

import { useState } from "react";
import {
  Award,
  AlertOctagon,
  ShieldCheck,
  Plus,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import type { Reward, Penalty } from "@/types";

export function AdminEnforcementView() {
  const { buildings, rewards, penalties, addReward, addPenalty } = useStore();
  const [activeTab, setActiveTab] = useState<"REWARDS" | "PENALTIES">("REWARDS");
  const [creatingReward, setCreatingReward] = useState(false);
  const [creatingPenalty, setCreatingPenalty] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Reward form fields
  const [rewardBuildingId, setRewardBuildingId] = useState("bld-01");
  const [rewardType, setRewardType] = useState<Reward["rewardType"]>("Accessibility Improvement Badge");
  const [rewardDescription, setRewardDescription] = useState("Outstanding resolution of main entrance step barrier and installation of compliant ramp with continuous handrail.");

  // Penalty form fields
  const [penaltyBuildingId, setPenaltyBuildingId] = useState("bld-01");
  const [penaltyDepartment, setPenaltyDepartment] = useState("Hospital Engineering");
  const [penaltyType, setPenaltyType] = useState<Penalty["penaltyType"]>("Notice");
  const [penaltyAmount, setPenaltyAmount] = useState<string>("50000");
  const [penaltyReason, setPenaltyReason] = useState("Repeatedly overdue wheelchair ramp installation exceeding 30-day statutory notice period.");
  const [authorityNote, setAuthorityNote] = useState("Notice issued pursuant to Tamil Nadu Rights of Persons with Disabilities Rules. Final 14-day compliance window granted.");

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === rewardBuildingId);
    if (!bld) return;

    addReward({
      buildingId: bld.id,
      buildingName: bld.name,
      rewardType,
      description: rewardDescription,
      date: new Date().toISOString().slice(0, 10)
    });

    setCreatingReward(false);
    setNotificationMsg(`Reward "${rewardType}" awarded to ${bld.name} and published to public profile.`);
  };

  const handlePenaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bld = buildings.find((b) => b.id === penaltyBuildingId);
    if (!bld) return;

    addPenalty({
      buildingId: bld.id,
      buildingName: bld.name,
      responsibleDepartment: penaltyDepartment,
      penaltyType,
      amount: penaltyAmount ? Number(penaltyAmount) : undefined,
      reason: penaltyReason,
      authorityNote,
      date: new Date().toISOString().slice(0, 10),
      status: "ISSUED"
    });

    setCreatingPenalty(false);
    setNotificationMsg(`Enforcement ${penaltyType} issued against ${penaltyDepartment} for ${bld.name}.`);
  };

  return (
    <AppShell title="Rewards & Enforcement" eyebrow="Administrator Compliance Authority">
      {/* Header */}
      <section className="rounded-2xl bg-[#12382d] p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9fc8b9]">Supervisory Powers</p>
            <h2 className="mt-1 text-2xl font-black">Accountability: Recognition &amp; Corrective Action</h2>
            <p className="mt-1 text-sm text-[#c9ddd5]">
              Award compliance recognition to proactive facilities or issue formal administrative notices for overdue barriers.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("REWARDS")}
              className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "REWARDS" ? "bg-white text-[#12382d]" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Rewards &amp; Badges ({rewards.length})
            </button>
            <button
              onClick={() => setActiveTab("PENALTIES")}
              className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "PENALTIES" ? "bg-white text-[#12382d]" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Enforcement Actions ({penalties.length})
            </button>
          </div>
        </div>
      </section>

      {notificationMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-[#142a20]">
            {activeTab === "REWARDS" ? "Facility Recognition & Rewards" : "Enforcement & Corrective Penalties"}
          </h3>
          <p className="text-xs text-[#6e7f77]">
            {activeTab === "REWARDS"
              ? "Rewards display prominently on public building profiles to encourage civic compliance."
              : "Administrative actions model statutory oversight. Subject to applicable law and authority."}
          </p>
        </div>

        {activeTab === "REWARDS" ? (
          <button
            onClick={() => setCreatingReward(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0b5d45] px-4 py-2.5 text-sm font-black text-white hover:bg-[#074634]"
          >
            <Plus size={16} /> Record Reward
          </button>
        ) : (
          <button
            onClick={() => setCreatingPenalty(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#d95425] px-4 py-2.5 text-sm font-black text-white hover:bg-[#b8431b]"
          >
            <Plus size={16} /> Record Enforcement Notice
          </button>
        )}
      </div>

      {/* New Reward Modal */}
      {creatingReward && (
        <form onSubmit={handleRewardSubmit} className="mt-6 rounded-2xl border-2 border-[#0b5d45] bg-white p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5ebe7] pb-3">
            <h3 className="text-lg font-black text-[#12382d]">Issue Facility Recognition / Reward</h3>
            <button type="button" onClick={() => setCreatingReward(false)} className="rounded-lg p-1.5 text-[#73827a] hover:bg-[#f0f4f2]">✕</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#1f332a]">
              Select Building
              <select
                value={rewardBuildingId}
                onChange={(e) => setRewardBuildingId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] bg-white p-3 font-normal"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Score: {b.score}/100)
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold text-[#1f332a]">
              Recognition Type
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as Reward["rewardType"])}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] bg-white p-3 font-normal"
              >
                <option>Accessibility Improvement Badge</option>
                <option>Compliance Recognition</option>
                <option>Certificate</option>
                <option>Performance Recognition</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-bold text-[#1f332a]">
            Description &amp; Achievement Details
            <textarea
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="rounded-xl bg-[#0b5d45] px-6 py-3 font-black text-white hover:bg-[#074634]">
              Publish Reward to Building Profile
            </button>
            <button type="button" onClick={() => setCreatingReward(false)} className="rounded-xl border border-[#cbd5cf] px-5 py-3 font-bold">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* New Penalty Modal */}
      {creatingPenalty && (
        <form onSubmit={handlePenaltySubmit} className="mt-6 rounded-2xl border-2 border-[#d95425] bg-white p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5ebe7] pb-3">
            <h3 className="text-lg font-black text-[#d95425]">Record Enforcement Action / Notice</h3>
            <button type="button" onClick={() => setCreatingPenalty(false)} className="rounded-lg p-1.5 text-[#73827a] hover:bg-[#f0f4f2]">✕</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-bold text-[#1f332a]">
              Select Building
              <select
                value={penaltyBuildingId}
                onChange={(e) => setPenaltyBuildingId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] bg-white p-3 font-normal"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold text-[#1f332a]">
              Responsible Department
              <input
                value={penaltyDepartment}
                onChange={(e) => setPenaltyDepartment(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
              />
            </label>

            <label className="block text-sm font-bold text-[#1f332a]">
              Enforcement Type
              <select
                value={penaltyType}
                onChange={(e) => setPenaltyType(e.target.value as Penalty["penaltyType"])}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] bg-white p-3 font-normal"
              >
                <option>Notice</option>
                <option>Warning</option>
                <option>Administrative action</option>
                <option>Fine / Penalty</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#1f332a]">
              Fine / Penalty Amount (₹ Optional)
              <input
                type="number"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
                placeholder="50000"
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
              />
            </label>

            <label className="block text-sm font-bold text-[#1f332a]">
              Reason for Enforcement
              <input
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
              />
            </label>
          </div>

          <label className="block text-sm font-bold text-[#1f332a]">
            Authority Directives &amp; Legal Note
            <textarea
              value={authorityNote}
              onChange={(e) => setAuthorityNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
            />
          </label>

          <p className="text-xs text-[#71827a] italic">
            * Note: Subject to applicable statutory law and administrative authority. Modeled for accountability tracking.
          </p>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="rounded-xl bg-[#d95425] px-6 py-3 font-black text-white hover:bg-[#b8431b]">
              Issue Enforcement Action
            </button>
            <button type="button" onClick={() => setCreatingPenalty(false)} className="rounded-xl border border-[#cbd5cf] px-5 py-3 font-bold">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tab 1: REWARDS LIST */}
      {activeTab === "REWARDS" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <article
              key={reward.id}
              className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                  <Award size={14} /> {reward.rewardType}
                </span>
                <span className="text-xs text-[#71827a]">{reward.date}</span>
              </div>

              <h4 className="text-lg font-black text-[#12382d]">{reward.buildingName}</h4>
              <p className="text-xs leading-5 text-[#506359]">{reward.description}</p>

              <div className="border-t border-[#e8f1ec] pt-3 text-[11px] font-bold text-emerald-700">
                ✓ Public badge active on building profile
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tab 2: PENALTIES LIST */}
      {activeTab === "PENALTIES" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950 flex items-start gap-2.5">
            <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Statutory Disclosure:</strong> Administrative warnings and penalty records are registered by certified supervising authorities pursuant to universal accessibility guidelines. Subject to applicable law and administrative authority.
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {penalties.map((penalty) => (
              <article
                key={penalty.id}
                className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">
                    <AlertOctagon size={14} /> {penalty.penaltyType}
                  </span>
                  <span className="text-xs text-[#71827a]">{penalty.date}</span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-[#17231d]">{penalty.buildingName}</h4>
                  <p className="text-xs text-[#6e8077]">Target: {penalty.responsibleDepartment}</p>
                </div>

                <div className="rounded-xl bg-[#fff5f2] p-3 text-xs text-[#3b241c] space-y-1">
                  <p><strong>Reason:</strong> {penalty.reason}</p>
                  {penalty.amount && (
                    <p className="font-black text-red-700">Financial Fine: ₹{penalty.amount.toLocaleString("en-IN")}</p>
                  )}
                  <p className="text-[11px] text-[#71827a]"><strong>Authority Note:</strong> {penalty.authorityNote}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f0e6e4]">
                  <span className="font-bold text-red-800">Status: {penalty.status}</span>
                  <span className="text-[#71827a] text-[11px]">Subject to administrative law</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
