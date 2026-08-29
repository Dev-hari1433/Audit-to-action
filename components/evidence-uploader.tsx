"use client";

import { useState } from "react";
import { FileCheck2, ImagePlus, Sparkles } from "lucide-react";

export function EvidenceUploader({ onSubmit }: { onSubmit: (description: string, fileName: string) => void }) {
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("Accessible ramp installed with continuous handrail and level landing. Work completed and inspected by the facilities team.");
  const [compared, setCompared] = useState(false);
  return (
    <section className="rounded-2xl border border-[#dfe6e1] bg-white p-5">
      <h2 className="text-lg font-black">Upload completion evidence</h2>
      <p className="mt-1 text-sm text-[#6b7870]">Provide clear before/after evidence. A verifier—not AI—makes the final decision.</p>
      <label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#bbd3c7] bg-[#f4faf7] p-6 text-sm font-bold text-[#0b5d45] hover:border-[#0b5d45]">
        <ImagePlus size={22} />{fileName || "Choose after photo or document"}
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
      </label>
      <label className="mt-4 block text-sm font-bold">Work completed and notes<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-[#cad5cf] px-4 py-3 font-normal outline-none focus:border-[#0b5d45] focus:ring-4 focus:ring-[#0b5d45]/10" /></label>
      <button type="button" onClick={() => setCompared(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c8d8d0] px-4 py-3 text-sm font-bold text-[#0b5d45] hover:bg-[#f3f8f5]"><Sparkles size={17} />Compare before & after with AI</button>
      {compared && <div className="mt-3 rounded-xl border border-[#c9dfd4] bg-[#eff8f3] p-4 text-sm"><p className="font-black text-[#0b5d45]">AI preliminary comparison</p><p className="mt-1 text-[#526159]">Visible structural change detected. A ramp-like surface and handrail appear in the after image.</p><p className="mt-2 text-xs font-bold text-[#7a4c22]">Advisory only — human verification required.</p></div>}
      <button type="button" onClick={() => onSubmit(description, fileName)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-5 py-3.5 font-extrabold text-white hover:bg-[#084a37]"><FileCheck2 size={18} />Ready for verification</button>
    </section>
  );
}
