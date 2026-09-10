"use client";

import { useState } from "react";
import { FileCheck2, TriangleAlert } from "lucide-react";
import { MultiPhotoCapture, type CapturedPhoto } from "@/components/multi-photo-capture";
import { RequiredAiScreening } from "@/components/required-ai-screening";

export function EvidenceUploader({ onSubmit }: { onSubmit: (description: string, photos: CapturedPhoto[], aiSummary: string) => void }) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [description, setDescription] = useState("Accessible ramp installed with continuous handrail and level landing. Work completed and inspected by the facilities team.");
  const [aiReady, setAiReady] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [error, setError] = useState("");
  const ready = photos.length > 0 && photos.every((photo) => photo.quality === "CLEAR") && description.trim().length >= 10 && aiReady;

  const submit = () => {
    if (!photos.length) return setError("Capture at least one after photo before submitting.");
    if (photos.some((photo) => photo.quality !== "CLEAR")) return setError("Remove or retake every photo that did not pass the clarity check.");
    if (description.trim().length < 10) return setError("Add a clear description of the completed work.");
    if (!aiReady) return setError("Wait for the required AI comparison to finish.");
    setError("");
    onSubmit(description.trim(), photos, aiSummary);
  };

  return (
    <section className="rounded-2xl border border-[#dfe6e1] bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[.16em] text-[#0b5d45]">Completion proof</p>
      <h2 className="mt-1 text-xl font-black">Upload work evidence</h2>
      <p className="mt-2 text-sm leading-6 text-[#6b7870]">Clear after photos and AI preliminary comparison are required. An auditor—not AI—makes the final decision.</p>
      <div className="mt-5"><MultiPhotoCapture photos={photos} onChange={(next) => { setPhotos(next); setError(""); }} label="After photos" /></div>
      <label className="mt-5 block text-sm font-bold">Work completed and notes <span className="text-[#c44b23]">*</span><textarea value={description} onChange={(event) => { setDescription(event.target.value); setError(""); }} rows={4} className="mt-2 w-full rounded-xl border border-[#cad5cf] px-4 py-3 font-normal outline-none focus:border-[#0b5d45] focus:ring-4 focus:ring-[#0b5d45]/10" /></label>
      <div className="mt-4"><RequiredAiScreening photos={photos} category="RAMP" mode="BEFORE_AFTER" onComplete={(complete, summary) => { setAiReady(complete); setAiSummary(summary); }} /></div>
      {error && <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800" role="alert"><TriangleAlert size={16} className="mt-0.5 shrink-0" />{error}</p>}
      <button type="button" onClick={submit} disabled={!ready} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-5 py-4 font-extrabold text-white hover:bg-[#084a37] disabled:bg-[#a9b9b1] disabled:text-white"><FileCheck2 size={18} />{aiReady ? `Submit ${photos.length} photo${photos.length === 1 ? "" : "s"} for verification` : "Complete required checks"}</button>
    </section>
  );
}
