"use client";

import { SiteLink as Link } from "@/components/site-link";
import { usePathname, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AdminBuildingDetailView, AuditDetailView, IssueDetailView, NewAuditView, VerificationView } from "@/components/views/workflow-views";
import { AdminBuildingsView, AdminDashboardView, AdminReportsView, AuditListView, AuditorDashboardView, CitizenDashboardView, CitizenReportsView, EscalationsView, IssueListView, ManagerDashboardView, UsersView } from "@/components/views/dashboard-views";
import { BuildingDetailView, BuildingsView, LoginView } from "@/components/views/public-views";
import { RegisterView, ReportProblemView } from "@/components/views/verified-citizen-views";
import { CitizenReportDetailView } from "@/components/views/citizen-report-detail";
import { AuditorComplaintsView } from "@/components/views/auditor-complaints-view";
import { AuditorReportsView } from "@/components/views/auditor-reports-view";
import { AdminAuditorsView } from "@/components/views/admin-auditors-view";
import { AdminDepartmentsView } from "@/components/views/admin-departments-view";
import { AdminEnforcementView } from "@/components/views/admin-enforcement-view";

export function RouteView() {
  const pathname = usePathname();
  const search = useSearchParams();
  const parts = pathname.split("/").filter(Boolean);

  if (pathname === "/login") return <LoginView />;
  if (pathname === "/register") return <RegisterView />;
  if (pathname === "/report") return <ReportProblemView />;
  if (pathname === "/buildings") return <BuildingsView />;
  if (parts[0] === "buildings" && parts[1]) return <BuildingDetailView id={parts[1]} />;

  if (pathname === "/citizen/dashboard") return <CitizenDashboardView />;
  if (pathname === "/citizen/reports") return <CitizenReportsView />;
  if (parts[0] === "citizen" && parts[1] === "reports" && parts[2]) return <CitizenReportDetailView reportId={parts[2]} />;

  if (pathname === "/auditor/dashboard") return <AuditorDashboardView />;
  if (pathname === "/auditor/complaints") return <AuditorComplaintsView />;
  if (pathname === "/auditor/reports") return <AuditorReportsView />;
  if (pathname === "/auditor/buildings") return <AdminBuildingsView auditor />;
  if (pathname === "/auditor/audits") return <AuditListView />;
  if (pathname === "/auditor/audits/new") return <NewAuditView />;
  if (parts[0] === "auditor" && parts[1] === "audits" && parts[2]) return <AuditDetailView id={parts[2]} />;
  if (pathname === "/auditor/issues") return <IssueListView mode="auditor" />;
  if (parts[0] === "auditor" && parts[1] === "issues" && parts[2]) return <IssueDetailView id={parts[2]} mode="auditor" />;
  if (pathname === "/auditor/verification") return <VerificationView issueId={search.get("issue") ?? undefined} />;

  if (pathname === "/manager/dashboard") return <ManagerDashboardView />;
  if (pathname === "/manager/issues") return <IssueListView mode="manager" />;
  if (parts[0] === "manager" && parts[1] === "issues" && parts[2]) return <IssueDetailView id={parts[2]} mode="manager" />;

  if (pathname === "/admin/dashboard") return <AdminDashboardView />;
  if (pathname === "/admin/auditors") return <AdminAuditorsView />;
  if (pathname === "/admin/departments") return <AdminDepartmentsView />;
  if (pathname === "/admin/enforcement") return <AdminEnforcementView />;
  if (pathname === "/admin/buildings") return <AdminBuildingsView />;
  if (parts[0] === "admin" && parts[1] === "buildings" && parts[2]) return <AdminBuildingDetailView id={parts[2]} />;
  if (pathname === "/admin/audits") return <AuditListView admin />;
  if (pathname === "/admin/issues") return <IssueListView mode="admin" />;
  if (parts[0] === "admin" && parts[1] === "issues" && parts[2]) return <IssueDetailView id={parts[2]} mode="admin" />;
  if (pathname === "/admin/escalations") return <EscalationsView />;
  if (pathname === "/admin/users") return <UsersView />;
  if (pathname === "/admin/reports") return <AdminReportsView />;

  return <AppShell title="Page not found"><section className="rounded-2xl border border-[#dfe6e1] bg-white p-10 text-center"><p className="text-5xl font-black text-[#d95425]">404</p><h1 className="mt-3 text-2xl font-black">This page isn’t in the prototype.</h1><Link href="/" className="mt-5 inline-block rounded-xl bg-[#0b5d45] px-5 py-3 font-bold text-white">Go to AccessTrack home</Link></section></AppShell>;
}
