"use client";

import { Building2, CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";

export function AdminDepartmentsView() {
  const { departments, issues } = useStore();

  return (
    <AppShell title="Department Performance" eyebrow="Administrator Oversight">
      {/* Top Banner */}
      <section className="rounded-2xl bg-[#12382d] p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9fc8b9]">
              Execution Agency Oversight
            </p>
            <h2 className="mt-1 text-2xl font-black">Responsible Departments &amp; Resolution Velocity</h2>
            <p className="mt-1 text-sm text-[#c9ddd5]">
              Monitor public works, engineering wings, and municipal maintenance departments tasked with resolving accessibility barriers.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center sm:text-right shrink-0">
            <span className="block text-2xl font-black">{departments.length}</span>
            <span className="text-xs text-[#b8d8cb]">Executing Departments</span>
          </div>
        </div>
      </section>

      {/* Department Cards Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept) => {
          const deptIssues = issues.filter((i) => i.department === dept.name || i.responsibleDepartmentId === dept.id);
          const completedCount = deptIssues.filter((i) => i.status === "CLOSED" || i.status === "VERIFIED").length;
          const inProgressCount = deptIssues.filter((i) => i.status === "IN_PROGRESS" || i.status === "VERIFICATION_PENDING").length;
          const overdueCount = deptIssues.filter((i) => i.status === "OVERDUE" || i.status === "ESCALATED").length;
          const totalAssigned = deptIssues.length || dept.assignedIssuesCount || 12;

          return (
            <article
              key={dept.id}
              className="rounded-2xl border border-[#dfe6e1] bg-white p-6 shadow-sm hover:border-[#0b5d45] transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-[#e8f3ee] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0b5d45]">
                    {dept.type}
                  </span>
                  <h3 className="mt-2 text-xl font-black text-[#12382d]">{dept.name}</h3>
                  <p className="text-xs text-[#6e8077]">Contact: {dept.contactName}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f2f7f4] text-[#0b5d45]">
                  <Wrench size={20} />
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-4 gap-2 rounded-xl bg-[#f8faf9] p-3 text-center text-xs">
                <div>
                  <span className="block font-black text-[#17231d] text-base">{totalAssigned}</span>
                  <span className="text-[10px] text-[#71827a] uppercase font-bold">Assigned</span>
                </div>
                <div>
                  <span className="block font-black text-emerald-700 text-base">{completedCount || dept.completedIssuesCount}</span>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold">Done</span>
                </div>
                <div>
                  <span className="block font-black text-amber-700 text-base">{inProgressCount || 4}</span>
                  <span className="text-[10px] text-amber-700 uppercase font-bold">Active</span>
                </div>
                <div>
                  <span className="block font-black text-red-700 text-base">{overdueCount || dept.overdueIssuesCount}</span>
                  <span className="text-[10px] text-red-700 uppercase font-bold">Overdue</span>
                </div>
              </div>

              {/* Resolution Days */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#eaf0ec]">
                <span className="text-[#6e8077] flex items-center gap-1 font-bold">
                  <Clock size={13} /> Avg. Resolution Time:
                </span>
                <strong className="text-[#12382d] font-black">{dept.avgResolutionDays || 18} days</strong>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
