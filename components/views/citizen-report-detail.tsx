"use client";

import { useState } from "react";
import { Bot, Camera, CheckCircle2, Clock3, MessageSquarePlus, Phone, ShieldCheck, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MultiPhotoCapture, type CapturedPhoto } from "@/components/multi-photo-capture";
import { RequiredAiScreening } from "@/components/required-ai-screening";
import { SiteLink as Link } from "@/components/site-link";
import { StatusBadge } from "@/components/status-badge";
import { useStore } from "@/lib/store";

const steps = ["Submitted", "Review", "Assigned", "In progress", "Evidence", "AI check", "Verification", "Closed"];
const statusIndex: Record<string, number> = { SUBMITTED: 0, UNDER_REVIEW: 1, ACCEPTED: 1, ASSIGNED: 2, IN_PROGRESS: 3, EVIDENCE_UPLOADED: 4, VERIFICATION_PENDING: 6, REWORK_REQUIRED: 5, VERIFIED: 6, RESOLVED: 7 };

export function CitizenReportDetailView({ reportId }: { reportId: string }) {
  const { reports, issues, addFollowUp } = useStore();
  const report = reports.find((item) => item.id === reportId);
  const issue = issues.find((item) => item.reportId === reportId || item.id === reportId);
  const [adding, setAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [aiReady, setAiReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!report) return <AppShell title="Report not found" eyebrow="Citizen workspace"><Link href="/citizen/reports" className="font-bold text-[#0b5d45]">← Back to my reports</Link></AppShell>;
  const active = statusIndex[report.status] ?? 0;
  const afterEvidence = issue?.evidence.filter((item) => item.type === "AFTER") ?? [];
  const submitFollowUp = () => {
    if (description.trim().length < 5) return setError("Add a short follow-up message.");
    if (!photos.length) return setError("Capture at least one additional photo.");
    if (photos.some((photo) => photo.quality !== "CLEAR")) return setError("Retake or remove photos that did not pass the clarity check.");
    if (!aiReady) return setError("Wait for the required AI screening to finish.");
    addFollowUp(report.id, description.trim(), photos.length);
    setDescription("");
    setPhotos([]);
    setAdding(false);
    setSaved(true);
    setError("");
  };

  return (
    <AppShell title={report.id} eyebrow="Live complaint tracking">
      <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/citizen/reports" className="text-sm font-bold text-[#0b5d45]">← All reports</Link><div className="flex gap-2"><span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800"><Phone size={13} />Phone verified</span><StatusBadge value={report.status} /></div></div>
      {saved && <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><CheckCircle2 size={17} />Follow-up saved under {report.id}.</p>}
      <section className="mt-5 rounded-2xl border border-[#dfe6e1] bg-white p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><p className="text-xs font-black uppercase tracking-wider text-[#748078]">{report.category}</p><h2 className="mt-1 text-2xl font-black">{report.buildingName}</h2><p className="mt-2 max-w-3xl leading-7 text-[#66736c]">{report.description}</p><p className="mt-3 text-sm font-bold text-[#506058]">Location: {report.location}</p></div><div className="shrink-0 rounded-xl bg-[#f3f6f4] p-4 text-sm"><p className="font-black">{report.photos?.length ?? 1} proof photo{(report.photos?.length ?? 1) === 1 ? "" : "s"}</p><p className="mt-1 text-xs text-[#66736c]">Submitted {report.createdAt}</p></div></div><div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">{steps.map((step,index) => <div key={step} className={`rounded-xl p-3 text-center text-xs font-bold ${index <= active ? "bg-[#0b5d45] text-white" : "bg-[#edf1ee] text-[#748078]"}`}><span className="mx-auto mb-2 grid h-6 w-6 place-items-center rounded-full bg-white/20">{index <= active ? "✓" : index + 1}</span>{step}</div>)}</div>{report.status === "REWORK_REQUIRED" && <p className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900"><TriangleAlert size={17} />The auditor requested rework. The manager must submit new clear evidence.</p>}</section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#dfe6e1] bg-white p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f3ee] text-[#0b5d45]"><Bot size={20} /></span><div><p className="font-black">Required AI preliminary assessment</p><p className="mt-1 text-sm leading-6 text-[#66736c]">{report.aiSummary ?? "Evidence was screened for clarity and relevance before submission."}</p><p className="mt-2 text-xs font-bold text-[#7a4c22]">Human verification is required. AI is not the final authority.</p></div></div></section>
          <section className="rounded-2xl border border-[#dfe6e1] bg-white p-5"><h2 className="font-black">Department proof and auditor decision</h2>{afterEvidence.length ? <div className="mt-4 space-y-3">{afterEvidence.map((item) => <article key={item.id} className="rounded-xl bg-[#f3f7f5] p-4"><p className="flex items-center gap-2 font-black"><Camera size={17} className="text-[#0b5d45]" />{item.photoCount ?? 1} clear completion photo{(item.photoCount ?? 1) === 1 ? "" : "s"}</p><p className="mt-2 text-sm text-[#66736c]">{item.description}</p>{item.aiSummary && <p className="mt-3 rounded-lg bg-white p-3 text-xs leading-5 text-[#526159]">AI preliminary comparison: {item.aiSummary}</p>}</article>)}{issue?.status === "CLOSED" && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-black text-emerald-800"><ShieldCheck size={17} />Approved and closed by a human auditor.</p>}</div> : <div className="mt-4 rounded-xl border-2 border-dashed border-[#d5ddd8] p-6 text-center"><Clock3 className="mx-auto text-[#8d9b93]" /><p className="mt-2 text-sm font-bold">Completion evidence has not been submitted yet.</p></div>}</section>
          {(report.followUps?.length ?? 0) > 0 && <section className="rounded-2xl border border-[#dfe6e1] bg-white p-5"><h2 className="font-black">Follow-up history</h2><div className="mt-4 space-y-3">{report.followUps?.map((followUp) => <article key={followUp.id} className="rounded-xl border border-[#e1e8e4] p-4"><p className="text-sm leading-6">{followUp.description}</p><p className="mt-2 text-xs font-bold text-[#718078]">{followUp.photoCount} photo{followUp.photoCount === 1 ? "" : "s"} · {followUp.createdAt}</p></article>)}</div></section>}
          {adding && <section className="rounded-2xl border border-[#bcd4c8] bg-white p-5"><h2 className="text-lg font-black">Add follow-up to {report.id}</h2><p className="mt-1 text-sm text-[#66736c]">This stays inside the same complaint and alerts the review team.</p><label className="mt-4 block text-sm font-bold">What changed?<textarea value={description} onChange={(event) => { setDescription(event.target.value); setError(""); }} rows={4} className="mt-2 w-full rounded-xl border border-[#cad5cf] px-4 py-3 font-normal outline-none focus:border-[#0b5d45]" placeholder="Example: Construction started, but the ramp is still incomplete." /></label><div className="mt-4"><MultiPhotoCapture photos={photos} onChange={(next) => { setPhotos(next); setAiReady(false); }} label="Follow-up photos" maxPhotos={4} /></div><div className="mt-4"><RequiredAiScreening photos={photos} category={report.category} onComplete={(complete) => setAiReady(complete)} /></div>{error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}<div className="mt-4 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={submitFollowUp} disabled={!aiReady} className="flex-1 rounded-xl bg-[#0b5d45] px-5 py-3.5 font-black text-white disabled:bg-[#a9b9b1]">Save follow-up</button><button type="button" onClick={() => setAdding(false)} className="rounded-xl border border-[#ccd6d0] px-5 py-3.5 font-bold">Cancel</button></div></section>}
        </div>
        <aside><button type="button" onClick={() => { setAdding(true); setSaved(false); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e56532] px-5 py-4 font-black text-white"><MessageSquarePlus size={18} />Add follow-up</button><div className="mt-4 rounded-2xl bg-[#12382d] p-5 text-white"><p className="font-black">Your report stays connected</p><p className="mt-2 text-sm leading-6 text-[#c9ddd5]">New messages and photos remain under {report.id}; you never need to create a second complaint for the same barrier.</p></div></aside>
      </div>
    </AppShell>
  );
}
