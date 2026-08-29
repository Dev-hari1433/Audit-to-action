import type { IssueStatus, Severity } from "@/types";

const styles: Record<string, string> = {
  CLOSED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  VERIFIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  IN_PROGRESS: "bg-amber-100 text-amber-900 border-amber-200",
  VERIFICATION_PENDING: "bg-sky-100 text-sky-900 border-sky-200",
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  REWORK_REQUIRED: "bg-orange-100 text-orange-900 border-orange-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
  ESCALATED: "bg-red-100 text-red-800 border-red-200",
  COMPLETED: "bg-teal-100 text-teal-800 border-teal-200",
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-amber-100 text-amber-900 border-amber-200",
  HIGH: "bg-orange-100 text-orange-900 border-orange-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({ value }: { value: IssueStatus | Severity | string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold tracking-wide ${styles[value] ?? styles.PENDING}`}>{value.replaceAll("_", " ")}</span>;
}
