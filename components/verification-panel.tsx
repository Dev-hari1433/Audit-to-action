"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";

export function VerificationPanel({ onDecision }: { onDecision: (approved: boolean, comment: string) => void }) {
  const [comment, setComment] = useState("Ramp gradient, landing and continuous handrail checked against the audit requirement.");
  return (
    <section className="rounded-2xl border border-[#c8ddd2] bg-[#f4faf7] p-5">
      <p className="text-xs font-black uppercase tracking-wider text-[#0b5d45]">Human verification</p>
      <h2 className="mt-1 text-lg font-black">Record the final decision</h2>
      <p className="mt-1 text-sm text-[#66736c]">Review the original finding, required action and uploaded evidence first.</p>
      <label className="mt-4 block text-sm font-bold">Verifier comment <span className="text-red-700">*</span><textarea required value={comment} onChange={(event) => setComment(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-[#bdcfc6] bg-white px-4 py-3 font-normal outline-none focus:border-[#0b5d45] focus:ring-4 focus:ring-[#0b5d45]/10" /></label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><button disabled={!comment.trim()} onClick={() => onDecision(true, comment)} className="flex items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-5 py-3.5 font-extrabold text-white disabled:opacity-40"><CheckCircle2 size={18} />Approve & close</button><button disabled={!comment.trim()} onClick={() => onDecision(false, comment)} className="flex items-center justify-center gap-2 rounded-xl border border-[#d37b5e] bg-white px-5 py-3.5 font-extrabold text-[#ac3e1c] disabled:opacity-40"><RotateCcw size={18} />Reject — rework required</button></div>
    </section>
  );
}
