import type { LucideIcon } from "lucide-react";

export function DashboardMetric({ label, value, detail, icon: Icon, tone = "green" }: { label: string; value: string | number; detail: string; icon: LucideIcon; tone?: "green" | "orange" | "red" | "blue" }) {
  const tones = { green: "bg-emerald-50 text-emerald-700", orange: "bg-orange-50 text-orange-700", red: "bg-red-50 text-red-700", blue: "bg-sky-50 text-sky-700" };
  return (
    <article className="rounded-2xl border border-[#dfe6e1] bg-white p-5 shadow-[0_8px_30px_rgba(20,45,34,.04)]">
      <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-[#65736b]">{label}</p><span className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon size={19} aria-hidden="true" /></span></div>
      <p className="mt-3 text-3xl font-black tracking-tight text-[#17231d]">{value}</p>
      <p className="mt-1 text-xs text-[#78847d]">{detail}</p>
    </article>
  );
}
