"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildings, initialNotifications, initialReports, seededIssues } from "@/lib/mock-data";
import type { CitizenReport, Issue, Notification, PhotoEvidence, Role } from "@/types";

interface ReportInput {
  citizenName?: string;
  buildingId: string;
  category: string;
  description: string;
  location: string;
  phone?: string;
  photos?: PhotoEvidence[];
  aiSummary?: string;
  email?: string;
}

interface StoreValue {
  role: Role | null;
  demoMode: boolean;
  issues: Issue[];
  reports: CitizenReport[];
  notifications: Notification[];
  login: (role: Role) => void;
  logout: () => void;
  resetDemo: () => void;
  submitReport: (input: ReportInput) => CitizenReport;
  acceptReport: (id: string) => void;
  createAuditIssue: (buildingId: string) => Issue;
  assignIssue: (id: string, responsible: string, department: string, deadline: string) => void;
  startWork: (id: string) => void;
  submitEvidence: (id: string, description: string, photos: PhotoEvidence[], aiSummary?: string) => void;
  verifyIssue: (id: string, approved: boolean, comment: string) => void;
  addFollowUp: (reportId: string, description: string, photoCount: number) => void;
  markNotificationsRead: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const storageKey = "accesstrack-demo-v1";

function saveSnapshot(snapshot: { role: Role | null; issues: Issue[]; reports: CitizenReport[]; notifications: Notification[] }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    // The in-memory demo remains usable when browser storage is unavailable.
  }
}

function loadSnapshot(): { role: Role | null; issues: Issue[]; reports: CitizenReport[]; notifications: Notification[] } | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [issues, setIssues] = useState<Issue[]>(seededIssues);
  const [reports, setReports] = useState<CitizenReport[]>(initialReports);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const parsed = loadSnapshot();
        if (parsed) {
          setRole(parsed.role ?? null);
          setIssues(parsed.issues ?? seededIssues);
          setReports(parsed.reports ?? initialReports);
          setNotifications(parsed.notifications ?? initialNotifications);
        }
      } catch {
        // Demo mode remains usable even if storage is blocked.
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSnapshot({ role, issues, reports, notifications });
  }, [role, issues, reports, notifications, hydrated]);

  const login = useCallback((nextRole: Role) => {
    const current = loadSnapshot();
    setRole(nextRole);
    saveSnapshot({ role: nextRole, issues: current?.issues ?? issues, reports: current?.reports ?? reports, notifications: current?.notifications ?? notifications });
  }, [issues, reports, notifications]);
  const logout = useCallback(() => {
    const current = loadSnapshot();
    setRole(null);
    saveSnapshot({ role: null, issues: current?.issues ?? issues, reports: current?.reports ?? reports, notifications: current?.notifications ?? notifications });
  }, [issues, reports, notifications]);

  const resetDemo = useCallback(() => {
    setIssues(seededIssues);
    setReports(initialReports);
    setNotifications(initialNotifications);
    saveSnapshot({ role, issues: seededIssues, reports: initialReports, notifications: initialNotifications });
  }, [role]);

  const submitReport = useCallback((input: ReportInput) => {
    const current = loadSnapshot();
    const currentReports = current?.reports ?? reports;
    const building = buildings.find((item) => item.id === input.buildingId) ?? buildings[0];
    const report: CitizenReport = {
      id: `ACC-2026-${String(125 + currentReports.length).padStart(5, "0")}`,
      buildingId: building.id,
      buildingName: building.name,
      category: input.category,
      description: input.description,
      location: input.location,
      status: "SUBMITTED",
      createdAt: new Date().toISOString().slice(0, 10),
      citizenName: input.citizenName ?? "Citizen",
      email: input.email,
      phone: input.phone,
      phoneVerified: Boolean(input.phone),
      photos: input.photos ?? [],
      aiSummary: input.aiSummary ?? "Required AI screening completed.",
      followUps: [],
    };
    const notification: Notification = { id: crypto.randomUUID(), title: "Report submitted", message: `${report.id} has been sent for accessibility review.`, type: "SUCCESS", read: false, createdAt: "Just now" };
    const nextReports = [report, ...currentReports];
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setReports(nextReports);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: current?.issues ?? issues, reports: nextReports, notifications: nextNotifications });
    return report;
  }, [issues, notifications, reports, role]);

  const acceptReport = useCallback((id: string) => {
    const current = loadSnapshot();
    const currentReports = current?.reports ?? reports;
    const report = currentReports.find((item) => item.id === id);
    const currentIssues = current?.issues ?? issues;
    const nextReports = currentReports.map((item) => item.id === id ? { ...item, status: "ASSIGNED" as const } : item);
    const due = new Date();
    due.setDate(due.getDate() + 30);
    const linkedIssue: Issue | null = report && !currentIssues.some((issue) => issue.reportId === id || issue.id === id) ? {
      id: report.id,
      reportId: report.id,
      buildingId: report.buildingId,
      buildingName: report.buildingName,
      category: report.category,
      title: report.description.length > 72 ? `${report.description.slice(0, 69)}…` : report.description,
      description: report.description,
      severity: "HIGH",
      status: "PENDING",
      responsible: "Kavitha Mani — Hospital Facilities Manager",
      department: "Hospital Engineering",
      deadline: due.toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      actionRequired: report.category === "RAMP" ? "Provide an accessible entrance ramp with a continuous handrail and safe landing." : "Remove the reported accessibility barrier and submit clear completion evidence.",
      evidence: report.photos?.length ? [{ id: crypto.randomUUID(), description: "Citizen complaint proof", fileName: report.photos[0].fileName, createdAt: report.createdAt, type: "BEFORE", photoCount: report.photos.length, aiSummary: report.aiSummary }] : [],
      escalationLevel: 0,
      progress: 20,
    } : null;
    const nextIssues = linkedIssue ? [linkedIssue, ...currentIssues] : currentIssues;
    const notification: Notification = { id: crypto.randomUUID(), title: "Citizen report assigned", message: `${id} is assigned to Hospital Engineering for action.`, type: "SUCCESS", read: false, createdAt: "Just now" };
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setReports(nextReports);
    setIssues(nextIssues);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: nextIssues, reports: nextReports, notifications: nextNotifications });
  }, [issues, notifications, reports, role]);

  const createAuditIssue = useCallback((buildingId: string) => {
    const current = loadSnapshot();
    const currentIssues = current?.issues ?? issues;
    const building = buildings.find((item) => item.id === buildingId) ?? buildings[0];
    const nextIssueNumber = currentIssues.reduce((highest, issue) => {
      const numericId = Number(issue.id.match(/\d+/)?.[0] ?? 0);
      return Math.max(highest, numericId);
    }, 1200) + 1;
    const id = `ACC-${nextIssueNumber}`;
    const issue: Issue = {
      id,
      buildingId: building.id,
      buildingName: building.name,
      category: "ENTRANCE",
      title: "Accessible ramp is not provided",
      description: "The main public entrance has steps and no independently usable wheelchair ramp.",
      severity: "HIGH",
      status: "PENDING",
      responsible: "Unassigned",
      department: "Unassigned",
      deadline: "Not set",
      createdAt: new Date().toISOString().slice(0, 10),
      actionRequired: "Provide an accessible entrance ramp with a continuous handrail and safe landing.",
      evidence: [],
      escalationLevel: 0,
      progress: 10,
    };
    const notification: Notification = { id: crypto.randomUUID(), title: "Audit finding created", message: `${id} requires assignment and a deadline.`, type: "WARNING", read: false, createdAt: "Just now" };
    const nextIssues = [issue, ...currentIssues];
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setIssues(nextIssues);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: nextIssues, reports: current?.reports ?? reports, notifications: nextNotifications });
    return issue;
  }, [issues, notifications, reports, role]);

  const assignIssue = useCallback((id: string, responsible: string, department: string, deadline: string) => {
    const current = loadSnapshot();
    const nextIssues: Issue[] = (current?.issues ?? issues).map((issue) => issue.id === id ? { ...issue, responsible, department, deadline, status: "PENDING", progress: 20 } : issue);
    const nextReports = (current?.reports ?? reports).map((report) => report.id === id ? { ...report, status: "ASSIGNED" as const } : report);
    const notification: Notification = { id: crypto.randomUUID(), title: "New issue assigned", message: `${id} was assigned to ${responsible}.`, type: "INFO", read: false, createdAt: "Just now" };
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setIssues(nextIssues);
    setReports(nextReports);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: nextIssues, reports: nextReports, notifications: nextNotifications });
  }, [issues, notifications, reports, role]);

  const startWork = useCallback((id: string) => {
    const current = loadSnapshot();
    const nextIssues: Issue[] = (current?.issues ?? issues).map((issue) => issue.id === id ? { ...issue, status: "IN_PROGRESS", progress: 45 } : issue);
    const nextReports = (current?.reports ?? reports).map((report) => report.id === id ? { ...report, status: "IN_PROGRESS" as const } : report);
    const notification: Notification = { id: crypto.randomUUID(), title: "Work started", message: `${id} is now in progress.`, type: "INFO", read: false, createdAt: "Just now" };
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setIssues(nextIssues);
    setReports(nextReports);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: nextIssues, reports: nextReports, notifications: nextNotifications });
  }, [issues, notifications, reports, role]);

  const submitEvidence = useCallback((id: string, description: string, photos: PhotoEvidence[], aiSummary = "Required AI evidence screening completed.") => {
    const current = loadSnapshot();
    const nextIssues: Issue[] = (current?.issues ?? issues).map((issue) => issue.id === id ? {
      ...issue,
      status: "VERIFICATION_PENDING",
      progress: 80,
      evidence: [...issue.evidence, {
        id: crypto.randomUUID(),
        description,
        fileName: photos[0]?.fileName || "ramp-completion-photo.jpg",
        createdAt: new Date().toISOString(),
        type: "AFTER",
        photoCount: photos.length,
        aiSummary,
      }],
    } : issue);
    const nextReports = (current?.reports ?? reports).map((report) => report.id === id ? { ...report, status: "VERIFICATION_PENDING" as const } : report);
    const notification: Notification = { id: crypto.randomUUID(), title: "Evidence submitted", message: `${id} is ready for human verification.`, type: "SUCCESS", read: false, createdAt: "Just now" };
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setIssues(nextIssues);
    setReports(nextReports);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: nextIssues, reports: nextReports, notifications: nextNotifications });
  }, [issues, notifications, reports, role]);

  const verifyIssue = useCallback((id: string, approved: boolean, comment: string) => {
    const current = loadSnapshot();
    const nextIssues: Issue[] = (current?.issues ?? issues).map((issue) => issue.id === id ? {
      ...issue,
      status: approved ? "CLOSED" : "REWORK_REQUIRED",
      progress: approved ? 100 : 70,
      verifierComment: comment,
    } : issue);
    const nextReports = (current?.reports ?? reports).map((report) => report.id === id ? { ...report, status: approved ? "RESOLVED" as const : "REWORK_REQUIRED" as const } : report);
    const notification: Notification = { id: crypto.randomUUID(), title: approved ? "Issue verified" : "Rework required", message: approved ? `${id} was verified and closed.` : `${id} was returned for more work.`, type: approved ? "SUCCESS" : "WARNING", read: false, createdAt: "Just now" };
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setIssues(nextIssues);
    setReports(nextReports);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: nextIssues, reports: nextReports, notifications: nextNotifications });
  }, [issues, notifications, reports, role]);

  const addFollowUp = useCallback((reportId: string, description: string, photoCount: number) => {
    const current = loadSnapshot();
    const nextReports = (current?.reports ?? reports).map((report) => report.id === reportId ? {
      ...report,
      followUps: [...(report.followUps ?? []), { id: crypto.randomUUID(), description, photoCount, createdAt: new Date().toLocaleString("en-IN") }],
    } : report);
    const notification: Notification = { id: crypto.randomUUID(), title: "Follow-up added", message: `New information was added to ${reportId}.`, type: "INFO", read: false, createdAt: "Just now" };
    const nextNotifications = [notification, ...(current?.notifications ?? notifications)];
    setReports(nextReports);
    setNotifications(nextNotifications);
    saveSnapshot({ role: current?.role ?? role, issues: current?.issues ?? issues, reports: nextReports, notifications: nextNotifications });
  }, [issues, notifications, reports, role]);

  const markNotificationsRead = useCallback(() => setNotifications((items) => items.map((item) => ({ ...item, read: true }))), []);

  const value = useMemo(() => ({ role, demoMode: true, issues, reports, notifications, login, logout, resetDemo, submitReport, acceptReport, createAuditIssue, assignIssue, startWork, submitEvidence, verifyIssue, addFollowUp, markNotificationsRead }), [role, issues, reports, notifications, login, logout, resetDemo, submitReport, acceptReport, createAuditIssue, assignIssue, startWork, submitEvidence, verifyIssue, addFollowUp, markNotificationsRead]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}
