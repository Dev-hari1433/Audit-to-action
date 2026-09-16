"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Building2,
  CheckCircle2,
  Calendar,
  Send,
  AlertTriangle,
  History,
  ShieldCheck,
  TrendingUp,
  Download
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import type { AuditorReport } from "@/types";

const initialAuditorReports: AuditorReport[] = [
  {
    id: "REP-2026-Q2",
    auditorId: "aud-01",
    auditorName: "Arun Selvan",
    reportingPeriod: "Q2 2026 (Apr - Jun)",
    buildingsVisited: 14,
    complaintsReviewed: 25,
    issuesIdentified: 32,
    issuesSolved: 24,
    issuesPending: 8,
    overdueIssues: 2,
    majorBarriers: "Predominance of step-only public entrances in legacy healthcare buildings and non-compliant toilet door clearances.",
    recommendations: "Prioritize standardized modular ramp construction and enforce auditory/tactile feedback on public lift installations.",
    notes: "Follow-up required with Hospital Engineering on ACC-1024.",
    createdAt: "2026-07-02"
  },
  {
    id: "REP-2026-Q1",
    auditorId: "aud-01",
    auditorName: "Arun Selvan",
    reportingPeriod: "Q1 2026 (Jan - Mar)",
    buildingsVisited: 12,
    complaintsReviewed: 19,
    issuesIdentified: 28,
    issuesSolved: 21,
    issuesPending: 7,
    overdueIssues: 1,
    majorBarriers: "Missing tactile guiding paths along bus terminal corridors and hospital outpatient wings.",
    recommendations: "Implement continuous 300mm warning tactile tiles at all stair heads and ramp transitions.",
    notes: "All government colleges surveyed achieved over 60% compliance.",
    createdAt: "2026-04-05"
  }
];

export function AuditorReportsView() {
  const { role } = useStore();
  const [reportsList, setReportsList] = useState<AuditorReport[]>(initialAuditorReports);
  const [creating, setCreating] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");

  // Form states
  const [reportingPeriod, setReportingPeriod] = useState("Q3 2026 (Jul - Sep)");
  const [buildingsVisited, setBuildingsVisited] = useState(16);
  const [complaintsReviewed, setComplaintsReviewed] = useState(28);
  const [issuesIdentified, setIssuesIdentified] = useState(36);
  const [issuesSolved, setIssuesSolved] = useState(29);
  const [issuesPending, setIssuesPending] = useState(7);
  const [overdueIssues, setOverdueIssues] = useState(3);
  const [majorBarriers, setMajorBarriers] = useState("Entrance step barriers without gradient-compliant wheelchair ramps, grab bars missing in outpatient washrooms.");
  const [recommendations, setRecommendations] = useState("Execute targeted ramp construction across top 5 high-traffic government hospitals with dedicated engineering teams.");
  const [notes, setNotes] = useState("Hospital facilities lead notified; verification pending on two site improvements.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReport: AuditorReport = {
      id: `REP-2026-0${reportsList.length + 1}`,
      auditorId: "aud-01",
      auditorName: "Arun Selvan",
      reportingPeriod,
      buildingsVisited: Number(buildingsVisited),
      complaintsReviewed: Number(complaintsReviewed),
      issuesIdentified: Number(issuesIdentified),
      issuesSolved: Number(issuesSolved),
      issuesPending: Number(issuesPending),
      overdueIssues: Number(overdueIssues),
      majorBarriers,
      recommendations,
      notes,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setReportsList([newReport, ...reportsList]);
    setCreating(false);
    setSubmittedMessage(`Auditor Report ${newReport.id} successfully submitted to the Administrator!`);
  };

  return (
    <AppShell
      title="Auditor Periodic Reports"
      eyebrow="Auditor → Admin Reporting"
      action={
        role === "AUDITOR" ? (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#0b5d45] px-4 py-2 text-sm font-bold text-white hover:bg-[#074634]"
          >
            <Plus size={16} /> New Periodic Report
          </button>
        ) : undefined
      }
    >
      {/* Header Info */}
      <section className="rounded-2xl bg-[#12382d] p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9fc8b9]">Supervisory Channel</p>
            <h2 className="mt-1 text-2xl font-black">Official Auditor Field Summary Reports</h2>
            <p className="mt-1 text-sm text-[#c9ddd5]">
              Auditors submit periodic compliance assessments directly to system administrators for city-wide planning and resource allocation.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center sm:text-right shrink-0">
            <span className="block text-2xl font-black">{reportsList.length}</span>
            <span className="text-xs text-[#b8d8cb]">Submitted Reports</span>
          </div>
        </div>
      </section>

      {submittedMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Report creation modal / section */}
      {creating && (
        <section className="mt-6 rounded-2xl border-2 border-[#0b5d45] bg-white p-6 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-[#e5ebe7] pb-4">
            <div>
              <h3 className="text-xl font-black text-[#12382d]">Submit Periodic Audit Report to Admin</h3>
              <p className="text-xs text-[#66736c]">
                Summarize inspection findings, solved barriers, and major recommendations.
              </p>
            </div>
            <button
              onClick={() => setCreating(false)}
              className="rounded-lg p-2 text-[#71827a] hover:bg-[#eef2f0]"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block font-bold text-[#1f332a]">
                Reporting Period
                <input
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
                />
              </label>

              <label className="block font-bold text-[#1f332a]">
                Buildings Visited
                <input
                  type="number"
                  value={buildingsVisited}
                  onChange={(e) => setBuildingsVisited(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block font-bold text-[#1f332a]">
                Complaints Reviewed
                <input
                  type="number"
                  value={complaintsReviewed}
                  onChange={(e) => setComplaintsReviewed(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-2.5 font-normal"
                />
              </label>

              <label className="block font-bold text-[#1f332a]">
                Issues Identified
                <input
                  type="number"
                  value={issuesIdentified}
                  onChange={(e) => setIssuesIdentified(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-2.5 font-normal"
                />
              </label>

              <label className="block font-bold text-[#1f332a]">
                Issues Solved
                <input
                  type="number"
                  value={issuesSolved}
                  onChange={(e) => setIssuesSolved(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-2.5 font-normal"
                />
              </label>

              <label className="block font-bold text-[#1f332a]">
                Overdue Issues
                <input
                  type="number"
                  value={overdueIssues}
                  onChange={(e) => setOverdueIssues(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-2.5 font-normal"
                />
              </label>
            </div>

            <label className="block font-bold text-[#1f332a]">
              Major Accessibility Barriers Observed
              <textarea
                value={majorBarriers}
                onChange={(e) => setMajorBarriers(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
              />
            </label>

            <label className="block font-bold text-[#1f332a]">
              Recommendations for Administration
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
              />
            </label>

            <label className="block font-bold text-[#1f332a]">
              Auditor Field Notes
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#cbd5cf] p-3 font-normal"
              />
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#0b5d45] px-6 py-3.5 font-black text-white hover:bg-[#074634]"
              >
                <Send size={16} /> Submit Official Report to Admin
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl border border-[#ccd6d0] bg-white px-5 py-3.5 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Reports History */}
      <div className="mt-6 space-y-5">
        {reportsList.map((rep) => (
          <article
            key={rep.id}
            className="rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm hover:border-[#0b5d45] transition"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-[#eaf0ec] pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">{rep.id}</span>
                <h3 className="mt-1 text-xl font-black text-[#12382d]">{rep.reportingPeriod}</h3>
                <p className="text-xs text-[#6e7f77]">Auditor: {rep.auditorName} · Submitted: {rep.createdAt}</p>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 self-start sm:self-auto">
                <ShieldCheck size={14} /> Official Supervisory Record
              </span>
            </div>

            {/* Metrics grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6 bg-[#f8faf9] p-4 rounded-xl text-center">
              <div>
                <span className="block text-xl font-black text-[#12382d]">{rep.buildingsVisited}</span>
                <span className="text-[10px] font-bold uppercase text-[#73827a]">Buildings Visited</span>
              </div>
              <div>
                <span className="block text-xl font-black text-[#12382d]">{rep.complaintsReviewed}</span>
                <span className="text-[10px] font-bold uppercase text-[#73827a]">Complaints Reviewed</span>
              </div>
              <div>
                <span className="block text-xl font-black text-[#12382d]">{rep.issuesIdentified}</span>
                <span className="text-[10px] font-bold uppercase text-[#73827a]">Issues Found</span>
              </div>
              <div>
                <span className="block text-xl font-black text-emerald-700">{rep.issuesSolved}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-700">Issues Solved</span>
              </div>
              <div>
                <span className="block text-xl font-black text-amber-700">{rep.issuesPending}</span>
                <span className="text-[10px] font-bold uppercase text-amber-700">Pending</span>
              </div>
              <div>
                <span className="block text-xl font-black text-red-700">{rep.overdueIssues}</span>
                <span className="text-[10px] font-bold uppercase text-red-700">Overdue</span>
              </div>
            </div>

            {/* Qualitative sections */}
            <div className="mt-5 space-y-3 text-sm">
              <div className="rounded-xl border border-[#dfe8e3] p-4 bg-white">
                <strong className="block text-xs uppercase tracking-wider text-[#b44820]">
                  Major Accessibility Barriers Observed:
                </strong>
                <p className="mt-1 text-[#33463e] leading-6">{rep.majorBarriers}</p>
              </div>

              <div className="rounded-xl border border-[#dfe8e3] p-4 bg-white">
                <strong className="block text-xs uppercase tracking-wider text-[#0b5d45]">
                  Strategic Recommendations:
                </strong>
                <p className="mt-1 text-[#33463e] leading-6">{rep.recommendations}</p>
              </div>

              {rep.notes && (
                <p className="text-xs text-[#6e7f77] italic">
                  <strong>Notes:</strong> {rep.notes}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
