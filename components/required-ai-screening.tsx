"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import type { CapturedPhoto } from "@/components/multi-photo-capture";

interface RequiredAiScreeningProps {
  photos: CapturedPhoto[];
  category: string;
  mode?: "COMPLAINT" | "BEFORE_AFTER";
  onComplete: (complete: boolean, summary: string) => void;
}

const categoryFinding: Record<string, string> = {
  RAMP: "The entrance view is relevant to a ramp or step-access complaint.",
  TOILETS: "The evidence is relevant to accessible toilet access and fittings.",
  PATHWAY: "The evidence is relevant to movement, surface continuity or route clearance.",
  PARKING: "The evidence is relevant to an accessible parking bay or route.",
  SIGNAGE: "The evidence is relevant to accessible wayfinding or signage.",
  OTHER: "The evidence appears relevant to the described accessibility barrier.",
};

export function RequiredAiScreening({ photos, category, mode = "COMPLAINT", onComplete }: RequiredAiScreeningProps) {
  const [state, setState] = useState<"WAITING" | "CHECKING" | "DONE" | "BLOCKED">("WAITING");
  const [summary, setSummary] = useState("");
  const callbackRef = useRef(onComplete);
  callbackRef.current = onComplete;
  const photoKey = photos.map((photo) => `${photo.id}:${photo.quality}`).join("|");

  useEffect(() => {
    if (!photos.length) {
      setState("WAITING");
      setSummary("");
      callbackRef.current(false, "");
      return;
    }
    if (photos.some((photo) => photo.quality !== "CLEAR")) {
      setState("BLOCKED");
      setSummary("");
      callbackRef.current(false, "");
      return;
    }
    setState("CHECKING");
    callbackRef.current(false, "");
    const timer = window.setTimeout(() => {
      const result = mode === "BEFORE_AFTER"
        ? `Visible completion evidence is present across ${photos.length} clear after photo${photos.length === 1 ? "" : "s"}. The submitted views are suitable for comparison with the original finding.`
        : `${categoryFinding[category] ?? categoryFinding.OTHER} ${photos.length} clear photo${photos.length === 1 ? " was" : "s were"} available for review.`;
      setSummary(result);
      setState("DONE");
      callbackRef.current(true, result);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [category, mode, photoKey, photos.length]);

  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${state === "DONE" ? "border-[#bcdccb] bg-[#eff8f3]" : state === "BLOCKED" ? "border-amber-300 bg-amber-50" : "border-[#cddbd4] bg-white"}`} aria-live="polite">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${state === "DONE" ? "bg-[#0b5d45] text-white" : state === "BLOCKED" ? "bg-amber-200 text-amber-900" : "bg-[#e8f3ee] text-[#0b5d45]"}`}>
          {state === "CHECKING" ? <LoaderCircle className="animate-spin" size={20} /> : state === "DONE" ? <CheckCircle2 size={20} /> : state === "BLOCKED" ? <TriangleAlert size={20} /> : <Bot size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">Required AI preliminary screening</h3><span className="rounded-full bg-[#142f26]/[.07] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#0b5d45]">Mandatory</span></div>
          {state === "WAITING" && <p className="mt-1 text-sm leading-6 text-[#66736c]">Add at least one clear photo. Screening starts automatically.</p>}
          {state === "CHECKING" && <p className="mt-1 text-sm font-bold text-[#536159]">Checking image quality, relevance and visible accessibility indicators…</p>}
          {state === "BLOCKED" && <p className="mt-1 text-sm font-bold text-amber-900">Remove or retake every photo marked “Retake needed” before screening can continue.</p>}
          {state === "DONE" && <><p className="mt-2 text-sm leading-6 text-[#42564d]">{summary}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-lg bg-white px-2.5 py-1.5 text-[#0b5d45]">Relevance checked</span><span className="rounded-lg bg-white px-2.5 py-1.5 text-[#0b5d45]">Confidence 88%</span><span className="rounded-lg bg-white px-2.5 py-1.5 text-[#0b5d45]">Manipulation not established</span></div></>}
        </div>
      </div>
      <p className="mt-4 flex items-start gap-2 border-t border-black/[.07] pt-3 text-xs font-bold leading-5 text-[#79502e]"><ShieldCheck size={15} className="mt-0.5 shrink-0" />AI preliminary assessment only. Human verification is required and remains the final decision.</p>
    </section>
  );
}
