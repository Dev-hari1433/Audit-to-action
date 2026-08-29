import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { Issue } from "@/types";

export function IssueCard({ issue, href }: { issue: Issue; href: string }) {
  return (
    <Link href={href} className="group block rounded-2xl border border-[#dfe6e1] bg-white p-5 shadow-[0_8px_26px_rgba(20,45,34,.035)] hover:-translate-y-0.5 hover:border-[#0b5d45]/35 hover:shadow-[0_14px_30px_rgba(20,45,34,.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-wider text-[#78847d]">{issue.id} · {issue.category}</p><h3 className="mt-1 truncate text-base font-extrabold text-[#17231d]">{issue.title}</h3></div>
        <ChevronRight className="mt-1 shrink-0 text-[#91a098] group-hover:translate-x-1 group-hover:text-[#0b5d45]" size={20} aria-hidden="true" />
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-[#66736c]"><MapPin size={15} aria-hidden="true" />{issue.buildingName}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2"><StatusBadge value={issue.status} /><StatusBadge value={issue.severity} /><span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#69766f]"><CalendarDays size={14} />{issue.deadline}</span></div>
    </Link>
  );
}
