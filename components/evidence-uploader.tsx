"use client";

import { useState } from "react";
import { FileCheck2, TriangleAlert, FileText, Upload, CheckCircle2 } from "lucide-react";
import { MultiPhotoCapture, type CapturedPhoto } from "@/components/multi-photo-capture";
import { RequiredAiScreening } from "@/components/required-ai-screening";

interface EvidenceUploaderProps {
  category?: string;
  beforePhotoUrl?: string;
  beforeDescription?: string;
  onSubmit: (
    description: string,
    photos: CapturedPhoto[],
    aiSummary: string,
    documentName?: string,
    aiAnalysis?: import("@/types").AiPhotoAnalysis
  ) => void;
}

export function EvidenceUploader({
  category = "RAMP",
  beforePhotoUrl,
  beforeDescription,
  onSubmit
}: EvidenceUploaderProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [description, setDescription] = useState(
    "Accessible ramp constructed with anti-slip surface, 1:12 gentle slope, and continuous steel safety handrails on both perimeters."
  );
  const [documentName, setDocumentName] = useState<string>("");
  const [aiReady, setAiReady] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<import("@/types").AiPhotoAnalysis | undefined>();
  const [error, setError] = useState("");

  const hasPhotos = photos.length > 0;
  const allClear = hasPhotos && photos.every((photo) => photo.quality === "CLEAR");
  const ready = allClear && description.trim().length >= 10 && aiReady;

  const handleStageSelect = (stage: 30 | 70 | 100) => {
    if (stage === 30) {
      setDescription(
        "Preliminary work in progress: Site cleared, concrete foundation excavated, and structural reinforcement prepared for accessible ramp."
      );
    } else if (stage === 70) {
      setDescription(
        "Substantial construction completed: Main ramp structure and slope (1:12) poured; curing in progress and handrail mountings installed."
      );
    } else {
      setDescription(
        "Accessible ramp constructed with anti-slip surface, 1:12 gentle slope, continuous dual-height steel safety handrails on both perimeters, and tactile landing tiles."
      );
    }
  };

  const submit = () => {
    if (!photos.length) return setError("Capture or upload at least one AFTER photo before submitting.");
    if (photos.some((photo) => photo.quality !== "CLEAR"))
      return setError("Remove or retake photos marked 'Retake needed'. Photos must be clear.");
    if (description.trim().length < 10)
      return setError("Please add a clear description of the completed construction or repair work.");
    if (!aiReady) return setError("Wait for the required AI evidence preliminary check to complete.");

    setError("");
    onSubmit(description.trim(), photos, aiSummary, documentName || undefined, aiAnalysis);
  };

  return (
    <section className="rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#0b5d45]">Department Proof of Work</p>
          <h2 className="mt-1 text-2xl font-black text-[#12382d]">Upload Remediation Evidence</h2>
        </div>
        <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-800">
          Auditor Verification Required
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-[#576961]">
        Compare the original barrier finding with your remediation progress. Upload clear after-photos to trigger AI progress scoring (<strong>30%</strong>, <strong>70%</strong>, or <strong>100%</strong>). Only certified human auditors can verify and close the issue.
      </p>

      {/* Side-by-Side: Before Photo Reference vs After Photo Uploader */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Left: Original Finding (Before Photo) */}
        <div className="rounded-xl border border-[#dfe6e1] bg-[#f8faf9] p-4 flex flex-col justify-between">
          <div>
            <span className="inline-block rounded-md bg-[#e2ece6] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#0b5d45]">
              Original Finding (Before)
            </span>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#cbd8d1] bg-white aspect-[4/3] flex items-center justify-center relative">
              {beforePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={beforePhotoUrl}
                  alt="Original barrier finding"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="p-4 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-700 text-lg font-black">
                    !
                  </span>
                  <p className="mt-2 text-xs font-black text-[#1c2e26] uppercase tracking-wider">
                    {category} Barrier
                  </p>
                  <p className="mt-1 text-xs text-[#62746b]">
                    {beforeDescription || "Entrance steps present without independent wheelchair ramp."}
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-[#71847a]">
            Reference requirement: Universal accessibility under National Building Code 2016.
          </p>
        </div>

        {/* Right: Mandatory After Photos (Proof of Work) */}
        <div className="rounded-xl border border-[#b8ddca] bg-[#f4faf7] p-4">
          <span className="inline-block rounded-md bg-[#0b5d45] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
            Remediation Proof (After)
          </span>
          <div className="mt-3">
            <MultiPhotoCapture
              photos={photos}
              onChange={(next) => {
                setPhotos(next);
                setAiReady(false);
                setError("");
              }}
              label="Mandatory After Photos (Upload or Live Camera)"
              maxPhotos={6}
            />
          </div>
        </div>
      </div>

      {/* Quick Stage Selection Presets */}
      <div className="mt-5 rounded-xl border border-[#e1eae5] bg-[#fafcfb] p-4">
        <label className="block text-xs font-black uppercase tracking-wider text-[#495f54] mb-2">
          Select Remediation Work Stage (Autofills Technical Details):
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleStageSelect(30)}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 hover:bg-blue-100 transition"
          >
            30% — Preliminary / Site Prep
          </button>
          <button
            type="button"
            onClick={() => handleStageSelect(70)}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800 hover:bg-amber-100 transition"
          >
            70% — Substantial Construction
          </button>
          <button
            type="button"
            onClick={() => handleStageSelect(100)}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition"
          >
            100% — Fully Compliant Completion
          </button>
        </div>
      </div>

      {/* Work Description */}
      <label className="mt-5 block text-sm font-bold text-[#1a2d24]">
        Work Description &amp; Dimensions <span className="text-[#c44b23]">*</span>
        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setError("");
          }}
          rows={3}
          placeholder="Describe the exact modifications made, materials used, slope gradient, handrail height, and compliance dimensions…"
          className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white p-3.5 text-sm font-normal outline-none focus:border-[#0b5d45] focus:ring-4 focus:ring-[#0b5d45]/10"
        />
      </label>

      {/* Optional Completion Document */}
      <div className="mt-4 rounded-xl border border-[#dfe6e1] bg-[#f8faf9] p-4">
        <label className="block text-xs font-black uppercase tracking-wider text-[#576860] mb-2">
          Optional Document (Work Order / Civil Contractor Certificate)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#cbd8d1] bg-white px-4 py-2.5 text-xs font-bold text-[#0b5d45] hover:bg-[#f2f7f4]">
            <Upload size={14} /> Choose PDF / Document
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setDocumentName(f.name);
              }}
            />
          </label>
          {documentName ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 size={14} /> {documentName} attached
            </span>
          ) : (
            <span className="text-xs text-[#788a81]">No document attached (optional)</span>
          )}
        </div>
      </div>

      {/* AI Comparison Screening */}
      <div className="mt-5">
        <RequiredAiScreening
          photos={photos}
          category={category}
          description={description}
          mode="BEFORE_AFTER"
          onComplete={(complete, summary, analysis) => {
            setAiReady(complete);
            setAiSummary(summary);
            setAiAnalysis(analysis);
          }}
        />
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 text-sm font-bold text-red-800" role="alert">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={submit}
        disabled={!ready}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-6 py-4 font-black text-white shadow-[0_10px_25px_rgba(11,93,69,.2)] hover:bg-[#084a37] disabled:bg-[#a9b9b1] disabled:shadow-none transition"
      >
        <FileCheck2 size={19} />
        {ready
          ? `Submit ${photos.length} Proof Photo${photos.length === 1 ? "" : "s"} for Auditor Verification`
          : "Upload Clear After-Photos & Complete AI Screening to Submit"}
      </button>

      <p className="mt-2 text-center text-xs text-[#6e7f77]">
        Status will change to <strong>VERIFICATION_PENDING</strong>. A certified human auditor will physically inspect and certify closure.
      </p>
    </section>
  );
}
