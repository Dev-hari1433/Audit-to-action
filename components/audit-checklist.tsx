"use client";

import { useMemo, useState } from "react";
import { Camera, ClipboardCheck, Info, CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import type { AuditDraftItem, Severity } from "@/types";

export const comprehensiveChecklist: AuditDraftItem[] = [
  // ENTRANCE
  { id: "ent-1", category: "ENTRANCE", requirement: "Accessible entrance (step-free threshold)", result: "COMPLIANT", severity: "HIGH", notes: "", correctiveAction: "Provide step-free entrance." },
  { id: "ent-2", category: "ENTRANCE", requirement: "Ramp (1:12 slope, non-slip surface)", result: "NOT_COMPLIANT", severity: "HIGH", notes: "3 concrete steps at main entrance with no wheelchair ramp.", correctiveAction: "Construct accessible ramp with 1:12 slope and level landing." },
  { id: "ent-3", category: "ENTRANCE", requirement: "Entrance width (minimum 900mm clear)", result: "COMPLIANT", severity: "MEDIUM", notes: "", correctiveAction: "Widen doorway to minimum 900mm clear opening." },
  { id: "ent-4", category: "ENTRANCE", requirement: "Steps (uniform risers and high-contrast nosing)", result: "PARTIALLY_COMPLIANT", severity: "MEDIUM", notes: "Steps lack high-contrast warning strips.", correctiveAction: "Apply 50mm yellow visual warning nosing to all step edges." },
  { id: "ent-5", category: "ENTRANCE", requirement: "Handrail (continuous on both sides)", result: "NOT_COMPLIANT", severity: "HIGH", notes: "No handrails installed on outer entrance stairs.", correctiveAction: "Install 38mm circular handrails extending 300mm beyond top and bottom steps." },

  // MOVEMENT
  { id: "mov-1", category: "MOVEMENT", requirement: "Corridor access (minimum 1200mm obstacle-free)", result: "COMPLIANT", severity: "MEDIUM", notes: "", correctiveAction: "Clear corridor obstructions." },
  { id: "mov-2", category: "MOVEMENT", requirement: "Lift (accessible door opening and braille controls)", result: "COMPLIANT", severity: "HIGH", notes: "", correctiveAction: "Install tactile braille button plates and voice announcement." },
  { id: "mov-3", category: "MOVEMENT", requirement: "Tactile pathway (continuous guiding tiles to counters)", result: "PARTIALLY_COMPLIANT", severity: "MEDIUM", notes: "Tactile paving terminates 5 metres before the enquiry desk.", correctiveAction: "Extend tactile guiding path directly to reception counter." },

  // TOILET
  { id: "toi-1", category: "TOILET", requirement: "Accessible toilet (designated unisex accessible cubicle)", result: "COMPLIANT", severity: "HIGH", notes: "", correctiveAction: "Designate and unlock dedicated accessible toilet stall." },
  { id: "toi-2", category: "TOILET", requirement: "Grab bars (horizontal and fold-up support rails)", result: "PARTIALLY_COMPLIANT", severity: "HIGH", notes: "Fold-down grab bar is loose on left side of WC.", correctiveAction: "Re-anchor 35mm stainless steel grab rail at 750mm height." },
  { id: "toi-3", category: "TOILET", requirement: "Space (minimum 1500mm wheelchair turning radius)", result: "COMPLIANT", severity: "MEDIUM", notes: "", correctiveAction: "Reconfigure stall to allow 1500mm turning diameter." },

  // PARKING
  { id: "prk-1", category: "PARKING", requirement: "Accessible parking (marked with International Symbol of Access)", result: "PARTIALLY_COMPLIANT", severity: "MEDIUM", notes: "Symbol faded and obscured by visitor motorbikes.", correctiveAction: "Repaint blue ISA ground marking and install vertical signpost." },
  { id: "prk-2", category: "PARKING", requirement: "Accessible route (step-free route from parking to entrance)", result: "COMPLIANT", severity: "HIGH", notes: "", correctiveAction: "Provide dropped kerb and level path to entrance." },

  // SIGNAGE
  { id: "sgn-1", category: "SIGNAGE", requirement: "Accessible signage (high-contrast with embossed tactile/Braille)", result: "NOT_COMPLIANT", severity: "MEDIUM", notes: "Directory board lacks Braille and contrasting background.", correctiveAction: "Install accessible wayfinding signage with Braille and 70% contrast." },
  { id: "sgn-2", category: "SIGNAGE", requirement: "Directional information (clear indicators for accessible features)", result: "COMPLIANT", severity: "LOW", notes: "", correctiveAction: "Add directional arrows to accessible lifts and toilets." }
];

export function AuditChecklist({
  onSubmit
}: {
  onSubmit: (findingsItems: AuditDraftItem[]) => void;
}) {
  const [items, setItems] = useState<AuditDraftItem[]>(comprehensiveChecklist);

  const findings = useMemo(
    () => items.filter((item) => item.result === "NOT_COMPLIANT" || item.result === "PARTIALLY_COMPLIANT"),
    [items]
  );

  const update = (id: string, field: keyof AuditDraftItem, value: string) =>
    setItems((list) =>
      list.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(findings);
  };

  const categories = ["ENTRANCE", "MOVEMENT", "TOILET", "PARKING", "SIGNAGE"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-[#c8ddd2] bg-[#eff8f3] p-4 text-sm text-[#255241]">
        <div className="flex gap-3">
          <Info className="mt-0.5 shrink-0 text-[#0b5d45]" size={20} />
          <div>
            <p className="font-extrabold text-[#12382d]">Digital Accessibility Audit Checklist</p>
            <p className="mt-0.5 text-xs leading-5 text-[#456154]">
              Every <strong>NOT COMPLIANT</strong> and <strong>PARTIALLY COMPLIANT</strong> item automatically generates an official corrective action issue in the accountability workflow. Human auditor verification remains mandatory.
            </p>
          </div>
        </div>
      </div>

      {categories.map((cat) => {
        const catItems = items.filter((item) => item.category === cat);
        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5ebe7] pb-2">
              <h3 className="text-xs font-black uppercase tracking-[.18em] text-[#0b5d45]">{cat} Requirements</h3>
              <span className="text-xs font-bold text-[#71827a]">{catItems.length} checks</span>
            </div>

            <div className="space-y-3">
              {catItems.map((item) => {
                const isNonCompliant = item.result === "NOT_COMPLIANT" || item.result === "PARTIALLY_COMPLIANT";

                return (
                  <fieldset
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      item.result === "NOT_COMPLIANT"
                        ? "border-red-200 bg-red-50/20"
                        : item.result === "PARTIALLY_COMPLIANT"
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-[#dfe6e1] bg-white"
                    }`}
                  >
                    <legend className="sr-only">{item.requirement}</legend>

                    <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#6b7c73]">
                          {item.category} · {item.id}
                        </span>
                        <h4 className="mt-1 font-extrabold text-base text-[#152b21]">{item.requirement}</h4>
                      </div>

                      <label className="text-xs font-bold text-[#55695f]">
                        Assessment Result
                        <select
                          value={item.result}
                          onChange={(event) => update(item.id, "result", event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white px-3 py-2.5 text-sm font-bold text-[#17231d] outline-none focus:border-[#0b5d45]"
                        >
                          <option value="COMPLIANT">COMPLIANT</option>
                          <option value="PARTIALLY_COMPLIANT">PARTIALLY COMPLIANT</option>
                          <option value="NOT_COMPLIANT">NOT COMPLIANT</option>
                          <option value="NOT_APPLICABLE">NOT APPLICABLE</option>
                        </select>
                      </label>
                    </div>

                    {isNonCompliant && (
                      <div className="mt-4 grid gap-3 lg:grid-cols-2 border-t border-black/[.06] pt-4">
                        <label className="text-xs font-bold text-[#55695f]">
                          Auditor Inspection Notes
                          <textarea
                            value={item.notes}
                            onChange={(event) => update(item.id, "notes", event.target.value)}
                            rows={2}
                            placeholder="Detail the specific architectural deficiency observed on site..."
                            className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white p-3 text-sm outline-none focus:border-[#0b5d45]"
                          />
                        </label>

                        <label className="text-xs font-bold text-[#55695f]">
                          Mandatory Corrective Action
                          <textarea
                            value={item.correctiveAction}
                            onChange={(event) => update(item.id, "correctiveAction", event.target.value)}
                            rows={2}
                            placeholder="Specific required repair or installation needed to restore compliance..."
                            className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white p-3 text-sm outline-none focus:border-[#0b5d45]"
                          />
                        </label>

                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#afcbbb] bg-white p-3 text-xs font-bold text-[#0b5d45] hover:bg-[#f6faf8]">
                          <Camera size={16} /> Attach Finding Photo (Mandatory for non-compliance)
                          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" />
                        </label>

                        <label className="text-xs font-bold text-[#55695f]">
                          Severity Rating
                          <select
                            value={item.severity}
                            onChange={(event) => update(item.id, "severity", event.target.value as Severity)}
                            className="mt-1.5 w-full rounded-xl border border-[#cad5cf] bg-white px-3 py-2.5 text-sm font-bold outline-none"
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH (Standard)</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </label>
                      </div>
                    )}
                  </fieldset>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Floating Bottom Submit Bar */}
      <div className="sticky bottom-3 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#c8ddd2] bg-white/95 p-4 shadow-[0_16px_42px_rgba(20,45,34,.14)] backdrop-blur sm:flex-row">
        <div>
          <p className="font-black text-[#12382d]">
            {findings.length} Issue{findings.length === 1 ? "" : "s"} Will Be Automatically Created
          </p>
          <p className="text-xs text-[#66736c]">
            Non-compliant findings are automatically converted into tracked corrective actions assigned to the building department.
          </p>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-6 py-3.5 font-black text-white hover:bg-[#074634] sm:w-auto shadow-md"
        >
          <ClipboardCheck size={18} /> Submit Official Audit
        </button>
      </div>
    </form>
  );
}
