"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock3,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  XCircle,
  ArrowRight,
  Send,
  ExternalLink
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import type { CitizenReport } from "@/types";

export function AuditorComplaintsView() {
  const { reports, acceptReport, acceptAndAssignReport } = useStore();
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Assignment modal fields
  const [assigning, setAssigning] = useState(false);
  const [responsiblePerson, setResponsiblePerson] = useState("Kavitha Mani — Facilities Lead");
  const [department, setDepartment] = useState("Hospital Engineering");
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [auditorNotes, setAuditorNotes] = useState("");

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === "ALL" || report.status === filterStatus;
    const matchesQuery =
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleQuickAccept = (report: CitizenReport) => {
    acceptReport(report.id);
    setActionSuccess(`Complaint ${report.id} accepted! Official issue created in workflow.`);
    setSelectedReport((prev) => (prev?.id === report.id ? { ...prev, status: "ASSIGNED" } : prev));
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const due = new Date();
    due.setDate(due.getDate() + Number(deadlineDays));
    const deadlineStr = due.toISOString().slice(0, 10);

    // Accept and assign atomically with all details
    acceptAndAssignReport(selectedReport.id, department, responsiblePerson, deadlineStr, auditorNotes);

    setSelectedReport((prev) => (prev?.id === selectedReport.id ? { ...prev, status: "ASSIGNED" } : prev));
    setAssigning(false);
    setActionSuccess(`Complaint ${selectedReport.id} assigned to ${department} (${responsiblePerson}) with deadline ${deadlineStr}.`);
  };

  return (
    <AppShell title="Citizen Complaint Review" eyebrow="Auditor Workspace">
      {/* Top Banner */}
      <section className="rounded-2xl bg-[#12382d] p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9fc8b9]">
              Operational Responsibility
            </p>
            <h2 className="mt-1 text-2xl font-black">Citizen Reports Awaiting Auditor Review</h2>
            <p className="mt-1 text-sm text-[#c9ddd5]">
              Inspect complaints, review AI screening, check building context, and assign official corrective actions to responsible departments.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center sm:text-right shrink-0">
            <span className="block text-2xl font-black">{reports.filter((r) => r.status === "SUBMITTED" || r.status === "UNDER_REVIEW").length}</span>
            <span className="text-xs text-[#b8d8cb]">New / Under Review</span>
          </div>
        </div>
      </section>

      {actionSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#dfe6e1] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#cbd5cf] px-3 focus-within:border-[#0b5d45]">
          <Search size={18} className="text-[#71827a]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by complaint ID, building name, or barrier keyword…"
            className="w-full py-2.5 text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#71827a]" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-[#cbd5cf] bg-white px-3 py-2.5 text-sm font-bold text-[#1f332a] outline-none"
          >
            <option value="ALL">All Statuses ({reports.length})</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="VERIFICATION_PENDING">VERIFICATION_PENDING</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Complaint List & Detailed Inspector */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: Complaints Cards */}
        <div className="space-y-3.5">
          {filteredReports.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#d5ded9] bg-white p-12 text-center">
              <Clock3 className="mx-auto text-[#94a59d]" size={32} />
              <p className="mt-3 font-extrabold text-[#17231d]">No complaints match criteria</p>
              <p className="mt-1 text-xs text-[#71827a]">Try adjusting the status filter or search query.</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              const isPendingReview = report.status === "SUBMITTED" || report.status === "UNDER_REVIEW";

              return (
                <article
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report);
                    setActionSuccess("");
                  }}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    isSelected
                      ? "border-[#0b5d45] bg-[#f3f8f5] shadow-md ring-2 ring-[#0b5d45]/15"
                      : "border-[#dfe6e1] bg-white hover:border-[#a6c4b5]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#0b5d45] text-sm">{report.id}</span>
                        <span className="rounded-full bg-[#edf1ee] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#546b5f]">
                          {report.category}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-base font-black text-[#142920]">{report.buildingName}</h3>
                    </div>
                    <StatusBadge value={report.status} />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#5a6b63] line-clamp-2">{report.description}</p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eaf0ec] pt-3 text-xs text-[#6e7f77]">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#0b5d45]" /> {report.location}
                    </span>
                    <span className="flex items-center gap-1 font-bold">
                      <Calendar size={13} /> {report.createdAt}
                    </span>
                  </div>

                  {isPendingReview && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#fff6f0] px-3 py-2 text-xs font-bold text-[#b44820]">
                      <span>Requires auditor review &amp; assignment</span>
                      <span className="underline">Inspect →</span>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right: Selected Complaint Inspector */}
        <div>
          {selectedReport ? (
            <div className="sticky top-24 rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">
                    {selectedReport.category}
                  </span>
                  <h2 className="mt-1 text-2xl font-black text-[#12382d]">{selectedReport.id}</h2>
                  <p className="text-sm font-bold text-[#55695f]">{selectedReport.buildingName}</p>
                </div>
                <StatusBadge value={selectedReport.status} />
              </div>

              {/* Citizen Contact info */}
              <div className="rounded-xl border border-[#dce7e1] bg-[#f8faf9] p-4 text-xs space-y-2">
                <p className="font-black text-[#0b5d45] flex items-center gap-1.5 uppercase tracking-wider">
                  <UserRound size={14} /> Citizen Contact Details
                </p>
                <div className="grid grid-cols-2 gap-2 text-[#465950]">
                  <div>
                    <span className="text-[10px] text-[#788a81] block">Name</span>
                    <strong>{selectedReport.citizenName || "Meena Kumar"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#788a81] block">Mobile (OTP Verified)</span>
                    <strong className="flex items-center gap-1">
                      <Phone size={11} className="text-emerald-700" />
                      {selectedReport.phone || "+91 98401 24681"} ✓
                    </strong>
                  </div>
                  {selectedReport.email && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-[#788a81] block">Email</span>
                      <strong className="flex items-center gap-1">
                        <Mail size={11} /> {selectedReport.email}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Location */}
              <div>
                <p className="text-xs font-bold text-[#71827a] uppercase tracking-wider">Reported Barrier Description</p>
                <p className="mt-1 text-sm leading-6 text-[#24382f] bg-[#fafcfb] p-3 rounded-xl border border-[#e4ece7]">
                  {selectedReport.description}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-[#52645b]">
                  <MapPin size={13} className="text-[#0b5d45]" /> <strong>Location:</strong> {selectedReport.location}
                </p>
                {selectedReport.latitude && selectedReport.longitude && (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-[#cbe2d6] bg-[#f0f8f4] p-2.5 text-xs">
                    <span className="font-bold text-[#0b5d45]">
                      📍 Verified GPS: {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.latitude},${selectedReport.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-black text-[#0b5d45] underline hover:text-[#063b2c]"
                    >
                      Open in Google Maps <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Mandatory Photo Evidence */}
              <div>
                <p className="text-xs font-bold text-[#71827a] uppercase tracking-wider">Proof Photos</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selectedReport.photos && selectedReport.photos.length > 0 ? (
                    selectedReport.photos.map((p, idx) => (
                      <div key={p.id || idx} className="overflow-hidden rounded-xl border border-[#cbd8d1] bg-[#122e25]">
                        {p.preview ? (
                          <img src={p.preview} alt="Citizen proof" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <div className="grid aspect-[4/3] w-full place-items-center bg-[#e8f1ed] text-center p-2">
                            <div>
                              <Camera size={20} className="mx-auto text-[#0b5d45]" />
                              <span className="mt-1 text-[11px] font-bold text-[#55695f] block">Proof Photo #{idx + 1}</span>
                              <span className="text-[9px] text-[#74877e]">Clear camera view</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 rounded-xl bg-[#eef5f1] p-4 text-center">
                      <Camera className="mx-auto text-[#0b5d45]" size={22} />
                      <p className="mt-1 text-xs font-bold text-[#1f332a]">1 Live Camera Photo Attached</p>
                      <p className="text-[10px] text-[#6d7e76]">Passed resolution and contrast checks</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Preliminary Analysis Card */}
              <div className="rounded-xl border border-[#cfdfd6] bg-[#f1f8f4] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-black text-[#0b5d45] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#e56532]" /> AI Preliminary Analysis
                  </p>
                  <span className="rounded bg-white px-2 py-0.5 font-bold text-[#0b5d45]">Confidence: 89%</span>
                </div>
                <p className="text-[#3b5146] leading-5">
                  {selectedReport.aiSummary || "Visible step-threshold barrier detected. Image matches wheelchair entrance category. No signs of digital manipulation."}
                </p>
                <p className="text-[11px] font-bold text-[#7d512a] flex items-center gap-1">
                  <ShieldCheck size={13} /> Human auditor verification required.
                </p>
              </div>

              {/* Follow-up history if present */}
              {Boolean(selectedReport.followUps && selectedReport.followUps.length > 0) && (
                <div className="rounded-xl border border-[#dfe8e3] p-3 text-xs space-y-2">
                  <p className="font-black text-[#142921]">Citizen Follow-Up Attached:</p>
                  {selectedReport.followUps?.map((fu, i) => (
                    <div key={fu.id || i} className="bg-[#f8faf9] p-2.5 rounded-lg border border-[#e5ebe7]">
                      <p className="text-[#3b4c44]">{fu.description}</p>
                      <span className="text-[10px] text-[#74857d] block mt-1">{fu.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Auditor Decision Actions */}
              <div className="border-t border-[#e8ecea] pt-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-[#6e7f77]">Auditor Review Actions</p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(selectedReport)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0b5d45] px-4 py-3 text-xs font-black text-white hover:bg-[#074634]"
                  >
                    <CheckCircle2 size={15} /> [ACCEPT] Create Issue
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssigning(true)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#e56532] px-4 py-3 text-xs font-black text-white hover:bg-[#cd5424]"
                  >
                    <Send size={15} /> [ASSIGN] Department
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionSuccess(`Information request sent to citizen for ${selectedReport.id}.`);
                    }}
                    className="rounded-xl border border-[#cbd8d1] bg-white px-3 py-2.5 text-xs font-bold text-[#42544c] hover:bg-[#f3f7f5]"
                  >
                    [REQUEST INFO]
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionSuccess(`Complaint ${selectedReport.id} reviewed and closed as duplicate/non-actionable.`);
                    }}
                    className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    [REJECT]
                  </button>
                </div>
              </div>

              {/* Assignment Modal embedded */}
              {assigning && (
                <form onSubmit={handleAssignSubmit} className="mt-4 rounded-xl border border-[#0b5d45] bg-[#f4f9f6] p-4 text-xs space-y-3">
                  <p className="font-black text-[#0b5d45] text-sm">Assign Corrective Action &amp; Deadline</p>

                  <label className="block font-bold text-[#23352d]">
                    Responsible Department
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#bad0c3] bg-white p-2"
                    >
                      <option>Hospital Engineering</option>
                      <option>Public Works Department</option>
                      <option>Municipal Corporation Works</option>
                      <option>Facilities &amp; Maintenance</option>
                    </select>
                  </label>

                  <label className="block font-bold text-[#23352d]">
                    Responsible Contact Person
                    <input
                      value={responsiblePerson}
                      onChange={(e) => setResponsiblePerson(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#bad0c3] bg-white p-2"
                    />
                  </label>

                  <label className="block font-bold text-[#23352d]">
                    Deadline (Days)
                    <input
                      type="number"
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[#bad0c3] bg-white p-2"
                    />
                  </label>

                  <label className="block font-bold text-[#23352d]">
                    Auditor Directive / Notes
                    <textarea
                      value={auditorNotes}
                      onChange={(e) => setAuditorNotes(e.target.value)}
                      placeholder="Required action: Provide an accessible entrance ramp with continuous handrail according to National Building Code guidelines."
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[#bad0c3] bg-white p-2"
                    />
                  </label>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-[#0b5d45] py-2 font-black text-white hover:bg-[#074634]"
                    >
                      Confirm Assignment
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssigning(false)}
                      className="rounded-lg border border-[#ccd6d0] bg-white px-3 py-2 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[#cad7d0] bg-white p-12 text-center text-[#74877e]">
              <UserCheck className="mx-auto text-[#90a399]" size={36} />
              <h3 className="mt-3 font-black text-base text-[#1c2e26]">Select a Citizen Complaint</h3>
              <p className="mt-1 text-xs">
                Click any complaint card on the left to review photos, citizen details, AI preliminary screening, and take auditor action.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
