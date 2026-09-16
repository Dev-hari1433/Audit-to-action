"use client";

import { useState } from "react";
import {
  Bot,
  Camera,
  CheckCircle2,
  Clock3,
  MessageSquarePlus,
  Phone,
  ShieldCheck,
  TriangleAlert,
  Calendar,
  Building2,
  MapPin,
  FileCheck,
  AlertCircle,
  Eye,
  Sparkles,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MultiPhotoCapture, type CapturedPhoto } from "@/components/multi-photo-capture";
import { RequiredAiScreening } from "@/components/required-ai-screening";
import { SiteLink as Link } from "@/components/site-link";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";

const timelineStages = [
  "Issue Created",
  "Under Review",
  "Assigned",
  "In Progress",
  "Evidence Uploaded",
  "AI Preliminary Analysis",
  "Auditor Verification",
  "Closed"
];

const statusToIndex: Record<string, number> = {
  SUBMITTED: 0,
  UNDER_REVIEW: 1,
  ACCEPTED: 1,
  ASSIGNED: 2,
  IN_PROGRESS: 3,
  EVIDENCE_UPLOADED: 4,
  VERIFICATION_PENDING: 5,
  REWORK_REQUIRED: 4,
  VERIFIED: 6,
  CLOSED: 7,
  RESOLVED: 7
};

export function CitizenReportDetailView({ reportId }: { reportId: string }) {
  const { reports, issues, addFollowUp } = useStore();
  const report = reports.find((item) => item.id === reportId);
  const linkedIssue = issues.find((item) => item.reportId === reportId || item.id === reportId);

  const [addingFollowUp, setAddingFollowUp] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [aiReady, setAiReady] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!report) {
    return (
      <AppShell title="Complaint Not Found" eyebrow="Citizen Tracking">
        <div className="rounded-2xl border border-[#dfe6e1] bg-white p-8 text-center">
          <AlertCircle className="mx-auto text-[#d95425]" size={36} />
          <h2 className="mt-3 text-xl font-black">Complaint record {reportId} could not be found.</h2>
          <p className="mt-1 text-sm text-[#66736c]">It may have been removed or entered incorrectly.</p>
          <Link href="/citizen/reports" className="mt-5 inline-block rounded-xl bg-[#0b5d45] px-5 py-3 font-bold text-white">
            ← Back to My Complaints
          </Link>
        </div>
      </AppShell>
    );
  }

  const currentStageIndex = statusToIndex[report.status] ?? 0;
  const isRework = report.status === "REWORK_REQUIRED";
  const isClosed = report.status === "CLOSED" || report.status === "RESOLVED";
  const afterEvidences = linkedIssue?.evidence?.filter((item) => item.type === "AFTER") ?? [];

  const handleSaveFollowUp = () => {
    if (description.trim().length < 5) {
      setError("Please enter a short description of the follow-up update.");
      return;
    }
    if (!photos.length) {
      setError("Please attach at least one follow-up photo to document the current site condition.");
      return;
    }
    if (photos.some((p) => p.quality !== "CLEAR")) {
      setError("Please retake or remove photos marked 'Retake needed'.");
      return;
    }
    if (!aiReady) {
      setError("Please wait for the required AI preliminary screening to finish.");
      return;
    }

    addFollowUp(report.id, description.trim(), photos.length);
    setDescription("");
    setPhotos([]);
    setAddingFollowUp(false);
    setSavedSuccess(true);
    setError("");
  };

  return (
    <AppShell title={report.id} eyebrow="Live Citizen Complaint Tracking">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/citizen/reports" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b5d45] hover:underline">
          <ArrowLeft size={16} /> All My Complaints
        </Link>
        <div className="flex items-center gap-2">
          {report.phone && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
              <Phone size={13} /> Phone OTP Verified
            </span>
          )}
          <StatusBadge value={report.status} />
        </div>
      </div>

      {savedSuccess && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
          <span>Follow-up successfully attached under <strong>{report.id}</strong>. Reviewers and building owners will be notified.</span>
        </div>
      )}

      {/* Main card */}
      <section className="mt-5 rounded-2xl border border-[#dfe6e1] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,45,34,.04)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <span className="rounded-full bg-[#e8f3ee] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0b5d45]">
              {report.category}
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#12382d]">{report.buildingName}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-[#526159]">{report.description}</p>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-[#576961]">
              <MapPin size={16} className="text-[#0b5d45]" /> Location: {report.location}
            </p>
            {report.latitude && report.longitude && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#e8f3ee] px-2.5 py-1 text-xs font-bold text-[#0b5d45]">
                  📍 GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-black text-[#0b5d45] underline hover:text-[#073f2f]"
                >
                  View on Google Maps <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          <div className="shrink-0 rounded-2xl border border-[#dce5e0] bg-[#f8faf9] p-5 text-sm">
            <p className="text-xs font-black uppercase tracking-wider text-[#75847d]">Citizen Proof</p>
            <p className="mt-1 text-base font-black text-[#12382d]">
              {report.photos?.length ?? 1} Clear Photo{(report.photos?.length ?? 1) === 1 ? "" : "s"}
            </p>
            <p className="mt-2 text-xs text-[#71827a] flex items-center gap-1">
              <Calendar size={13} /> Reported: {report.createdAt}
            </p>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="mt-8 border-t border-[#e8eeea] pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">End-to-End Progress Timeline</h3>
            <span className="text-xs font-bold text-[#687a71]">
              Stage {currentStageIndex + 1} of {timelineStages.length}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {timelineStages.map((stage, index) => {
              const isPast = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <div
                  key={stage}
                  className={`rounded-xl p-3 text-center transition-all ${
                    isCurrent
                      ? "bg-[#e56532] text-white shadow-md ring-2 ring-[#e56532]/20"
                      : isPast
                      ? "bg-[#0b5d45] text-white"
                      : "bg-[#edf1ee] text-[#748078]"
                  }`}
                >
                  <span
                    className={`mx-auto mb-1.5 grid h-6 w-6 place-items-center rounded-full text-xs font-black ${
                      isCurrent ? "bg-white text-[#e56532]" : isPast ? "bg-white/20 text-white" : "bg-[#dfe5e1] text-[#71827a]"
                    }`}
                  >
                    {isPast ? "✓" : index + 1}
                  </span>
                  <p className="text-[11px] font-extrabold leading-tight">{stage}</p>
                </div>
              );
            })}
          </div>

          {/* Rework alert banner if applicable */}
          {isRework && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
              <TriangleAlert size={19} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-black">Auditor Verification Requested Rework</p>
                <p className="mt-0.5 font-normal leading-5">
                  The initial work proof did not fully meet standard accessibility criteria. The building department has been notified to complete adjustments and submit new proof.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid: Left content + Right sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* AI Preliminary Photo Assessment */}
          <section className="rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f3ee] text-[#0b5d45]">
                <Bot size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[#12382d]">AI Preliminary Photo Assessment</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                    Confidence: 89%
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4a5e54]">
                  {report.aiSummary || "Photo evidence was screened for barrier indicators, lighting clarity and category consistency."}
                </p>

                {report.aiAnalysis && (
                  <div className="mt-3 rounded-xl border border-[#d8e6df] bg-[#f7faf8] p-3 text-xs space-y-1 text-[#43574d]">
                    <p><strong>Detected Issue:</strong> {report.aiAnalysis.possibleIssue}</p>
                    <p><strong>Signs of Manipulation:</strong> {report.aiAnalysis.signsOfManipulation}</p>
                  </div>
                )}

                <p className="mt-3 text-xs font-bold text-[#87552a] flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Human auditor verification required. AI assessment is advisory.
                </p>
              </div>
            </div>
          </section>

          {/* Department Proof of Work & Auditor Verification */}
          <section className="rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-[#12382d] flex items-center gap-2">
              <FileCheck size={20} className="text-[#0b5d45]" />
              Work Evidence &amp; Verification
            </h3>

            {afterEvidences.length > 0 ? (
              <div className="mt-4 space-y-4">
                {afterEvidences.map((evidence) => (
                  <article key={evidence.id} className="rounded-2xl border border-[#dce6e1] bg-[#f8faf9] p-5">
                    <div className="flex items-center justify-between">
                      <p className="flex items-center gap-2 font-black text-[#12382d]">
                        <Camera size={18} className="text-[#0b5d45]" />
                        Work Proof Uploaded ({evidence.photoCount ?? 1} Completion Photo{(evidence.photoCount ?? 1) === 1 ? "" : "s"})
                      </p>
                      <span className="text-xs text-[#71827a] font-bold">{evidence.createdAt?.slice(0, 10)}</span>
                    </div>

                    <p className="mt-3 text-sm text-[#47574f] font-medium leading-6">
                      <strong>Department Note:</strong> &ldquo;{evidence.description}&rdquo;
                    </p>

                    {evidence.aiSummary && (
                      <div className="mt-3 rounded-xl border border-[#cfe1d7] bg-white p-3 text-xs leading-5 text-[#3b5247]">
                        <p className="font-black text-[#0b5d45] flex items-center gap-1">
                          <Sparkles size={14} /> AI Evidence Screening:
                        </p>
                        <p className="mt-1">{evidence.aiSummary}</p>
                      </div>
                    )}
                  </article>
                ))}

                {isClosed && (
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-black text-emerald-900">
                    <ShieldCheck size={20} className="text-emerald-700 shrink-0" />
                    <div>
                      <p>Verified &amp; Closed by Certified Auditor</p>
                      {linkedIssue?.verifierComment && (
                        <p className="mt-1 text-xs font-normal text-emerald-800">
                          Auditor Verdict: &ldquo;{linkedIssue.verifierComment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border-2 border-dashed border-[#d5ded9] p-7 text-center">
                <Clock3 className="mx-auto text-[#8e9f96]" size={28} />
                <p className="mt-2 text-sm font-bold text-[#1f332a]">Work Evidence Pending</p>
                <p className="mt-1 text-xs text-[#71827a]">
                  The responsible building department has been assigned and is working on the barrier. Completion photos will be displayed here once submitted.
                </p>
              </div>
            )}
          </section>

          {/* Follow-Up History Under SAME Complaint ID */}
          {Boolean(report.followUps && report.followUps.length > 0) && (
            <section className="rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-[#12382d] flex items-center gap-2">
                <MessageSquarePlus size={20} className="text-[#e56532]" />
                Follow-Up History (Under {report.id})
              </h3>
              <p className="mt-1 text-xs text-[#6e7f77]">
                Chronological updates submitted by citizen under this complaint ID.
              </p>

              <div className="mt-4 space-y-3">
                {report.followUps?.map((fu, idx) => (
                  <article key={fu.id || idx} className="rounded-xl border border-[#e2eae6] bg-[#fcfdfc] p-4">
                    <div className="flex items-center justify-between text-xs text-[#6e7f77]">
                      <span className="font-bold text-[#0b5d45]">Update #{idx + 1}</span>
                      <span>{fu.createdAt}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#273830] leading-6">{fu.description}</p>
                    {fu.photoCount > 0 && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#546b5f]">
                        <Camera size={13} /> {fu.photoCount} additional photo{fu.photoCount === 1 ? "" : "s"} attached
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Add Follow-up Form */}
          {addingFollowUp && (
            <section className="rounded-2xl border-2 border-[#a4c9b8] bg-white p-6 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#12382d]">Add Follow-Up to {report.id}</h3>
                  <p className="text-xs text-[#66736c]">
                    Attach new observations or photos directly to this complaint without creating a duplicate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddingFollowUp(false)}
                  className="rounded-lg p-1.5 text-[#73827a] hover:bg-[#f0f4f2]"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <label className="block text-sm font-bold text-[#1f332a]">
                  What is the latest status or update? <span className="text-[#c44b23]">*</span>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setError("");
                    }}
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-[#cad5cf] p-3 text-sm outline-none focus:border-[#0b5d45]"
                    placeholder="e.g., The department started construction, but the ramp gradient appears too steep and handrails are missing."
                  />
                </label>

                <MultiPhotoCapture
                  photos={photos}
                  onChange={(next) => {
                    setPhotos(next);
                    setAiReady(false);
                    setError("");
                  }}
                  label="Additional Follow-Up Photos"
                  maxPhotos={4}
                />

                <RequiredAiScreening
                  photos={photos}
                  category={report.category}
                  description={description}
                  onComplete={(complete) => setAiReady(complete)}
                />

                {error && (
                  <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row pt-2">
                  <button
                    type="button"
                    onClick={handleSaveFollowUp}
                    disabled={!aiReady}
                    className="flex-1 rounded-xl bg-[#0b5d45] px-5 py-3.5 font-black text-white hover:bg-[#074634] disabled:bg-[#a9b9b1]"
                  >
                    Save Follow-Up to {report.id}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingFollowUp(false)}
                    className="rounded-xl border border-[#ccd6d0] px-5 py-3.5 font-bold hover:bg-[#f3f7f5]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setAddingFollowUp(true);
              setSavedSuccess(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e56532] px-5 py-4 font-black text-white shadow-[0_8px_20px_rgba(229,101,50,.2)] hover:bg-[#cd5221] transition"
          >
            <MessageSquarePlus size={19} />
            Add Follow-Up
          </button>

          <div className="rounded-2xl bg-[#12382d] p-6 text-white">
            <h4 className="font-black text-base">Same Complaint ID Guarantee</h4>
            <p className="mt-2 text-sm leading-6 text-[#cce2d9]">
              In AccessTrack, all messages, citizen updates, contractor work proofs and auditor verification decisions stay attached to <strong>{report.id}</strong>.
            </p>
            <p className="mt-3 text-xs text-[#a2c9bb]">
              You never need to submit a duplicate complaint for the same building barrier.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe6e1] bg-white p-5 text-sm text-[#5a6b63]">
            <p className="font-black text-[#17231d] flex items-center gap-1.5">
              <Eye size={17} className="text-[#0b5d45]" /> Public Transparency
            </p>
            <p className="mt-2 leading-6">
              You can review the after-photos uploaded by the building department and verify whether the problem has actually been resolved to your satisfaction.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
