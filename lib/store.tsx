"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildings, initialNotifications, initialReports, seededIssues } from "@/lib/mock-data";
import type { CitizenReport, Issue, Notification, Role } from "@/types";

interface ReportInput {
  buildingId: string;
  category: string;
  description: string;
  location: string;
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
  createAuditIssue: (buildingId: string) => Issue;
  assignIssue: (id: string, responsible: string, department: string, deadline: string) => void;
  startWork: (id: string) => void;
  submitEvidence: (id: string, description: string, fileName: string) => void;
  verifyIssue: (id: string, approved: boolean, comment: string) => void;
  markNotificationsRead: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const storageKey = "accesstrack-demo-v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [issues, setIssues] = useState<Issue[]>(seededIssues);
  const [reports, setReports] = useState<CitizenReport[]>(initialReports);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
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
    window.localStorage.setItem(storageKey, JSON.stringify({ role, issues, reports, notifications }));
  }, [role, issues, reports, notifications, hydrated]);

  const notify = useCallback((title: string, message: string, type: Notification["type"] = "INFO") => {
    setNotifications((items) => [{ id: crypto.randomUUID(), title, message, type, read: false, createdAt: "Just now" }, ...items]);
  }, []);

  const login = useCallback((nextRole: Role) => setRole(nextRole), []);
  const logout = useCallback(() => setRole(null), []);

  const resetDemo = useCallback(() => {
    setIssues(seededIssues);
    setReports(initialReports);
    setNotifications(initialNotifications);
    window.localStorage.removeItem(storageKey);
  }, []);

  const submitReport = useCallback((input: ReportInput) => {
    const building = buildings.find((item) => item.id === input.buildingId) ?? buildings[0];
    const report: CitizenReport = {
      id: `ACC-2026-${String(125 + reports.length).padStart(5, "0")}`,
      buildingId: building.id,
      buildingName: building.name,
      category: input.category,
      description: input.description,
      location: input.location,
      status: "SUBMITTED",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setReports((items) => [report, ...items]);
    notify("Report submitted", `${report.id} has been sent for accessibility review.`, "SUCCESS");
    return report;
  }, [notify, reports.length]);

  const createAuditIssue = useCallback((buildingId: string) => {
    const building = buildings.find((item) => item.id === buildingId) ?? buildings[0];
    const id = `ACC-${1200 + issues.length}`;
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
    setIssues((items) => [issue, ...items]);
    notify("Audit finding created", `${id} requires assignment and a deadline.`, "WARNING");
    return issue;
  }, [issues.length, notify]);

  const assignIssue = useCallback((id: string, responsible: string, department: string, deadline: string) => {
    setIssues((items) => items.map((issue) => issue.id === id ? { ...issue, responsible, department, deadline, status: "PENDING", progress: 20 } : issue));
    notify("New issue assigned", `${id} was assigned to ${responsible}.`, "INFO");
  }, [notify]);

  const startWork = useCallback((id: string) => {
    setIssues((items) => items.map((issue) => issue.id === id ? { ...issue, status: "IN_PROGRESS", progress: 45 } : issue));
    notify("Work started", `${id} is now in progress.`, "INFO");
  }, [notify]);

  const submitEvidence = useCallback((id: string, description: string, fileName: string) => {
    setIssues((items) => items.map((issue) => issue.id === id ? {
      ...issue,
      status: "VERIFICATION_PENDING",
      progress: 80,
      evidence: [...issue.evidence, {
        id: crypto.randomUUID(),
        description,
        fileName: fileName || "ramp-completion-photo.jpg",
        createdAt: new Date().toISOString(),
        type: "AFTER",
      }],
    } : issue));
    notify("Evidence submitted", `${id} is ready for human verification.`, "SUCCESS");
  }, [notify]);

  const verifyIssue = useCallback((id: string, approved: boolean, comment: string) => {
    setIssues((items) => items.map((issue) => issue.id === id ? {
      ...issue,
      status: approved ? "CLOSED" : "REWORK_REQUIRED",
      progress: approved ? 100 : 70,
      verifierComment: comment,
    } : issue));
    notify(approved ? "Issue verified" : "Rework required", approved ? `${id} was verified and closed.` : `${id} was returned for more work.`, approved ? "SUCCESS" : "WARNING");
  }, [notify]);

  const markNotificationsRead = useCallback(() => setNotifications((items) => items.map((item) => ({ ...item, read: true }))), []);

  const value = useMemo(() => ({ role, demoMode: true, issues, reports, notifications, login, logout, resetDemo, submitReport, createAuditIssue, assignIssue, startWork, submitEvidence, verifyIssue, markNotificationsRead }), [role, issues, reports, notifications, login, logout, resetDemo, submitReport, createAuditIssue, assignIssue, startWork, submitEvidence, verifyIssue, markNotificationsRead]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}
