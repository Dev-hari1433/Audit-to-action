import { AppShell } from "@/components/app-shell";
import { SiteLink } from "@/components/site-link";
import { AdminBuildingDetailView, AuditDetailView, IssueDetailView, NewAuditView, VerificationView } from "@/components/views/workflow-views";
import { AdminBuildingsView, AdminDashboardView, AdminReportsView, AuditListView, AuditorDashboardView, CitizenDashboardView, CitizenReportsView, EscalationsView, IssueListView, ManagerDashboardView, UsersView } from "@/components/views/dashboard-views";
import { BuildingDetailView, BuildingsView, LoginView, RegisterView, ReportProblemView } from "@/components/views/public-views";

interface CatchAllProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatchAllPage({ params, searchParams }: CatchAllProps) {
  const { slug } = await params;
  const query = await searchParams;
  const [section, area, id] = slug;
  const path = `/${slug.join("/")}`;

  if (path === "/login") return <LoginView />;
  if (path === "/register") return <RegisterView />;
  if (path === "/report") return <ReportProblemView />;
  if (path === "/buildings") return <BuildingsView />;
  if (section === "buildings" && area) return <BuildingDetailView id={area} />;

  if (path === "/citizen/dashboard") return <CitizenDashboardView />;
  if (path === "/citizen/reports") return <CitizenReportsView />;
  if (section === "citizen" && area === "reports" && id) return <CitizenReportsView reportId={id} />;

  if (path === "/auditor/dashboard") return <AuditorDashboardView />;
  if (path === "/auditor/buildings") return <AdminBuildingsView auditor />;
  if (path === "/auditor/audits") return <AuditListView />;
  if (path === "/auditor/audits/new") return <NewAuditView />;
  if (section === "auditor" && area === "audits" && id) return <AuditDetailView id={id} />;
  if (path === "/auditor/issues") return <IssueListView mode="auditor" />;
  if (section === "auditor" && area === "issues" && id) return <IssueDetailView id={id} mode="auditor" />;
  if (path === "/auditor/verification") return <VerificationView issueId={typeof query.issue === "string" ? query.issue : undefined} />;

  if (path === "/manager/dashboard") return <ManagerDashboardView />;
  if (path === "/manager/issues") return <IssueListView mode="manager" />;
  if (section === "manager" && area === "issues" && id) return <IssueDetailView id={id} mode="manager" />;

  if (path === "/admin/dashboard") return <AdminDashboardView />;
  if (path === "/admin/buildings") return <AdminBuildingsView />;
  if (section === "admin" && area === "buildings" && id) return <AdminBuildingDetailView id={id} />;
  if (path === "/admin/audits") return <AuditListView admin />;
  if (path === "/admin/issues") return <IssueListView mode="admin" />;
  if (section === "admin" && area === "issues" && id) return <IssueDetailView id={id} mode="admin" />;
  if (path === "/admin/escalations") return <EscalationsView />;
  if (path === "/admin/users") return <UsersView />;
  if (path === "/admin/reports") return <AdminReportsView />;

  return <AppShell title="Page not found"><section className="rounded-2xl border border-[#dfe6e1] bg-white p-10 text-center"><p className="text-5xl font-black text-[#d95425]">404</p><h1 className="mt-3 text-2xl font-black">This page is not available.</h1><SiteLink href="/" className="mt-5 inline-block rounded-xl bg-[#0b5d45] px-5 py-3 font-bold text-white">Go to AccessTrack home</SiteLink></section></AppShell>;
}
