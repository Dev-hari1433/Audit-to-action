"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  buildings as initialBuildings,
  departments as initialDepartments,
  auditorList as initialAuditors,
  initialRewards,
  initialPenalties,
  initialAdminLogs,
  initialNotifications,
  initialReports,
  seededIssues
} from "@/lib/mock-data";
import type {
  AdminActivityLog,
  AuditorPerformance,
  AuditDraftItem,
  Building,
  CitizenReport,
  Department,
  Issue,
  Notification,
  Penalty,
  PhotoEvidence,
  Reward,
  Role,
  AiPhotoAnalysis
} from "@/types";

interface ReportInput {
  citizenName?: string;
  buildingId: string;
  category: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  photos?: PhotoEvidence[];
  aiSummary?: string;
  aiAnalysis?: AiPhotoAnalysis;
  email?: string;
}

interface StoreValue {
  role: Role | null;
  demoMode: boolean;
  buildings: Building[];
  departments: Department[];
  auditorList: AuditorPerformance[];
  issues: Issue[];
  reports: CitizenReport[];
  notifications: Notification[];
  rewards: Reward[];
  penalties: Penalty[];
  adminLogs: AdminActivityLog[];
  login: (role: Role) => void;
  logout: () => void;
  resetDemo: () => void;
  submitReport: (input: ReportInput) => CitizenReport;
  acceptReport: (id: string) => void;
  acceptAndAssignReport: (reportId: string, department: string, responsible: string, deadline: string, notes?: string) => void;
  createAuditIssue: (buildingId: string) => Issue;
  createAuditFindingsIssues: (buildingId: string, findings: AuditDraftItem[]) => Issue[];
  assignIssue: (id: string, responsible: string, department: string, deadline: string) => void;
  startWork: (id: string) => void;
  submitEvidence: (id: string, description: string, photos: PhotoEvidence[], aiSummary?: string, documentName?: string, aiAnalysis?: AiPhotoAnalysis) => void;
  verifyIssue: (id: string, approved: boolean, comment: string) => void;
  addFollowUp: (reportId: string, description: string, photoCount: number) => void;
  markNotificationsRead: () => void;
  addReward: (reward: Omit<Reward, "id">) => void;
  addPenalty: (penalty: Omit<Penalty, "id">) => void;
  reassignAuditor: (fromAuditorId: string, toAuditorId: string, reason: string) => void;
  escalateIssue: (issueId: string, reason: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const storageKey = "accesstrack-demo-v2";

interface StorageSnapshot {
  role: Role | null;
  buildings?: Building[];
  departments?: Department[];
  auditorList?: AuditorPerformance[];
  issues: Issue[];
  reports: CitizenReport[];
  notifications: Notification[];
  rewards?: Reward[];
  penalties?: Penalty[];
  adminLogs?: AdminActivityLog[];
}

function saveSnapshot(snapshot: StorageSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch {
    // Graceful in-memory fallback
  }
}

function loadSnapshot(): StorageSnapshot | null {
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
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [auditorList, setAuditorList] = useState<AuditorPerformance[]>(initialAuditors);
  const [issues, setIssues] = useState<Issue[]>(seededIssues);
  const [reports, setReports] = useState<CitizenReport[]>(initialReports);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [penalties, setPenalties] = useState<Penalty[]>(initialPenalties);
  const [adminLogs, setAdminLogs] = useState<AdminActivityLog[]>(initialAdminLogs);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const parsed = loadSnapshot();
        if (parsed) {
          setRole(parsed.role ?? null);
          if (parsed.buildings) setBuildings(parsed.buildings);
          if (parsed.departments) setDepartments(parsed.departments);
          if (parsed.auditorList) setAuditorList(parsed.auditorList);
          setIssues(parsed.issues ?? seededIssues);
          setReports(parsed.reports ?? initialReports);
          setNotifications(parsed.notifications ?? initialNotifications);
          if (parsed.rewards) setRewards(parsed.rewards);
          if (parsed.penalties) setPenalties(parsed.penalties);
          if (parsed.adminLogs) setAdminLogs(parsed.adminLogs);
        }
      } catch {
        // Fallback
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSnapshot({
      role,
      buildings,
      departments,
      auditorList,
      issues,
      reports,
      notifications,
      rewards,
      penalties,
      adminLogs
    });
  }, [role, buildings, departments, auditorList, issues, reports, notifications, rewards, penalties, adminLogs, hydrated]);

  const login = useCallback((nextRole: Role) => {
    setRole(nextRole);
  }, []);

  const logout = useCallback(() => {
    setRole(null);
  }, []);

  const resetDemo = useCallback(() => {
    setBuildings(initialBuildings);
    setDepartments(initialDepartments);
    setAuditorList(initialAuditors);
    setIssues(seededIssues);
    setReports(initialReports);
    setNotifications(initialNotifications);
    setRewards(initialRewards);
    setPenalties(initialPenalties);
    setAdminLogs(initialAdminLogs);
    saveSnapshot({
      role,
      buildings: initialBuildings,
      departments: initialDepartments,
      auditorList: initialAuditors,
      issues: seededIssues,
      reports: initialReports,
      notifications: initialNotifications,
      rewards: initialRewards,
      penalties: initialPenalties,
      adminLogs: initialAdminLogs
    });
  }, [role]);

  const submitReport = useCallback((input: ReportInput) => {
    const building = buildings.find((item) => item.id === input.buildingId) ?? buildings[0];
    const reportNumber = String(125 + reports.length).padStart(6, "0");
    const report: CitizenReport = {
      id: `ACC-2026-${reportNumber}`,
      complaintNumber: `ACC-2026-${reportNumber}`,
      buildingId: building.id,
      buildingName: building.name,
      category: input.category,
      description: input.description,
      location: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
      status: "SUBMITTED",
      createdAt: new Date().toISOString().slice(0, 10),
      citizenName: input.citizenName ?? "Citizen Reporter",
      email: input.email,
      phone: input.phone,
      phoneVerified: Boolean(input.phone),
      photos: input.photos ?? [],
      aiSummary: input.aiSummary ?? "AI preliminary assessment completed. Human verification required.",
      aiAnalysis: input.aiAnalysis,
      followUps: []
    };

    const notification: Notification = {
      id: crypto.randomUUID(),
      userRole: "AUDITOR",
      title: "New Citizen Complaint Submitted",
      message: `${report.id} at ${report.buildingName} requires auditor review.`,
      type: "INFO",
      read: false,
      createdAt: "Just now"
    };

    setReports((prev) => [report, ...prev]);
    setNotifications((prev) => [notification, ...prev]);
    return report;
  }, [buildings, reports.length]);

  const acceptReport = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: "ACCEPTED" as const };
        }
        return item;
      })
    );

    const report = reports.find((item) => item.id === id);
    if (report) {
      const due = new Date();
      due.setDate(due.getDate() + 30);

      const linkedIssue: Issue = {
        id: report.id,
        reportId: report.id,
        complaintId: report.id,
        buildingId: report.buildingId,
        buildingName: report.buildingName,
        category: report.category,
        title: report.description.length > 70 ? `${report.description.slice(0, 67)}…` : report.description,
        description: report.description,
        severity: "HIGH",
        status: "ASSIGNED",
        responsible: "Kavitha Mani — Hospital Facilities Lead",
        department: "Hospital Engineering",
        deadline: due.toISOString().slice(0, 10),
        createdAt: new Date().toISOString().slice(0, 10),
        actionRequired: `Provide barrier-free compliant ${report.category.toLowerCase()} and upload before/after proof.`,
        evidence: report.photos?.length
          ? [
              {
                id: crypto.randomUUID(),
                description: "Citizen complaint photo evidence",
                fileName: report.photos[0].fileName,
                createdAt: report.createdAt,
                type: "BEFORE",
                photoCount: report.photos.length,
                aiSummary: report.aiSummary
              }
            ]
          : [],
        escalationLevel: 0,
        progress: 25
      };

      setIssues((prev) => [linkedIssue, ...prev.filter((i) => i.id !== id && i.reportId !== id)]);

      const notif: Notification = {
        id: crypto.randomUUID(),
        userRole: "BUILDING_MANAGER",
        title: "Complaint Accepted & Assigned",
        message: `${id} assigned to Hospital Engineering. 30-day resolution window active.`,
        type: "WARNING",
        read: false,
        createdAt: "Just now"
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  }, [reports]);

  const acceptAndAssignReport = useCallback(
    (
      reportId: string,
      department: string,
      responsible: string,
      deadline: string,
      notes?: string
    ) => {
      setReports((prev) =>
        prev.map((item) =>
          item.id === reportId ? { ...item, status: "ASSIGNED" as const } : item
        )
      );

      const report = reports.find((item) => item.id === reportId);
      if (report) {
        const linkedIssue: Issue = {
          id: report.id,
          reportId: report.id,
          complaintId: report.id,
          buildingId: report.buildingId,
          buildingName: report.buildingName,
          category: report.category,
          title:
            report.description.length > 70
              ? `${report.description.slice(0, 67)}…`
              : report.description,
          description: report.description,
          severity: "HIGH",
          status: "ASSIGNED",
          responsible: responsible || "Hospital Facilities Lead",
          department: department || "Hospital Engineering",
          deadline:
            deadline ||
            new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          createdAt: new Date().toISOString().slice(0, 10),
          actionRequired:
            notes ||
            `Provide barrier-free compliant ${report.category.toLowerCase()} and upload before/after proof.`,
          auditorNotes: notes,
          evidence: report.photos?.length
            ? [
                {
                  id: crypto.randomUUID(),
                  description: "Citizen complaint photo evidence (Original Finding)",
                  fileName: report.photos[0].fileName,
                  createdAt: report.createdAt,
                  type: "BEFORE",
                  photoCount: report.photos.length,
                  aiSummary: report.aiSummary
                }
              ]
            : [],
          escalationLevel: 0,
          progress: 25
        };

        setIssues((prev) => [
          linkedIssue,
          ...prev.filter((i) => i.id !== reportId && i.reportId !== reportId)
        ]);

        const notif: Notification = {
          id: crypto.randomUUID(),
          userRole: "BUILDING_MANAGER",
          title: "New Corrective Action Assigned",
          message: `${reportId} assigned to ${responsible} (${department}). Deadline: ${deadline}.`,
          type: "WARNING",
          read: false,
          createdAt: "Just now"
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    },
    [reports]
  );

  const createAuditIssue = useCallback((buildingId: string) => {
    const building = buildings.find((item) => item.id === buildingId) ?? buildings[0];
    const nextNum = issues.reduce((highest, issue) => {
      const num = Number(issue.id.match(/\d+/)?.[0] ?? 0);
      return Math.max(highest, num);
    }, 1200) + 1;

    const id = `ACC-${nextNum}`;
    const due = new Date();
    due.setDate(due.getDate() + 30);

    const issue: Issue = {
      id,
      buildingId: building.id,
      buildingName: building.name,
      category: "ENTRANCE",
      title: "Accessible ramp is not provided at main entrance",
      description: `Comprehensive audit finding at ${building.name}. Route has steps and lacks independent ramp access.`,
      severity: "HIGH",
      status: "ASSIGNED",
      responsible: "Hospital Facilities Coordinator",
      department: building.departmentName || "Hospital Engineering",
      responsibleDepartmentId: building.departmentId,
      deadline: due.toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      actionRequired: "Construct accessible ramp with 1:12 slope, continuous handrails and tactile landing.",
      evidence: [],
      escalationLevel: 0,
      progress: 20
    };

    setIssues((prev) => [issue, ...prev]);
    const notif: Notification = {
      id: crypto.randomUUID(),
      userRole: "ADMIN",
      title: "Audit Finding Issue Created",
      message: `${id} generated from certified audit at ${building.name}.`,
      type: "INFO",
      read: false,
      createdAt: "Just now"
    };
    setNotifications((prev) => [notif, ...prev]);
    return issue;
  }, [buildings, issues]);

  const createAuditFindingsIssues = useCallback((buildingId: string, findings: AuditDraftItem[]) => {
    const building = buildings.find((item) => item.id === buildingId) ?? buildings[0];
    const createdIssues: Issue[] = [];

    findings.forEach((finding, idx) => {
      const nextNum = issues.reduce((highest, issue) => {
        const num = Number(issue.id.match(/\d+/)?.[0] ?? 0);
        return Math.max(highest, num);
      }, 1200) + 1 + idx;

      const due = new Date();
      due.setDate(due.getDate() + 30);

      const newIssue: Issue = {
        id: `ACC-${nextNum}`,
        buildingId: building.id,
        buildingName: building.name,
        category: finding.category,
        title: finding.requirement,
        description: finding.notes || `Finding observed during accessibility audit at ${building.name}.`,
        severity: finding.severity,
        status: "ASSIGNED",
        responsible: "Building Facilities Lead",
        department: building.departmentName || "Public Works Department",
        responsibleDepartmentId: building.departmentId,
        deadline: due.toISOString().slice(0, 10),
        createdAt: new Date().toISOString().slice(0, 10),
        actionRequired: finding.correctiveAction || "Remedy accessibility barrier to universal NBC standards.",
        evidence: [],
        escalationLevel: 0,
        progress: 20
      };
      createdIssues.push(newIssue);
    });

    setIssues((prev) => [...createdIssues, ...prev]);
    return createdIssues;
  }, [buildings, issues]);

  const assignIssue = useCallback((id: string, responsible: string, department: string, deadline: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, responsible, department, deadline, status: "ASSIGNED", progress: 25 }
          : i
      )
    );
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ASSIGNED" as const } : r))
    );

    const notif: Notification = {
      id: crypto.randomUUID(),
      userRole: "BUILDING_MANAGER",
      title: "Corrective Action Assigned",
      message: `${id} formally assigned to ${responsible} (${department}). Deadline: ${deadline}.`,
      type: "INFO",
      read: false,
      createdAt: "Just now"
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const startWork = useCallback((id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "IN_PROGRESS", progress: 50 } : i))
    );
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "IN_PROGRESS" as const } : r))
    );

    const notif: Notification = {
      id: crypto.randomUUID(),
      userRole: "AUDITOR",
      title: "Repair Work Started",
      message: `${id} is now actively in progress by the responsible department.`,
      type: "INFO",
      read: false,
      createdAt: "Just now"
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const submitEvidence = useCallback(
    (
      id: string,
      description: string,
      photos: PhotoEvidence[],
      aiSummary = "Required AI preliminary check completed.",
      documentName?: string,
      aiAnalysis?: AiPhotoAnalysis
    ) => {
      const progress = aiAnalysis?.progressScore ?? 80;
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id
            ? {
                ...issue,
                status: "VERIFICATION_PENDING",
                progress,
                evidence: [
                  ...issue.evidence,
                  {
                    id: crypto.randomUUID(),
                    description,
                    fileName: photos[0]?.fileName || "proof-after-photo.jpg",
                    createdAt: new Date().toISOString().slice(0, 10),
                    type: "AFTER",
                    photoCount: photos.length,
                    aiSummary,
                    aiAnalysis,
                    documentUrl: documentName
                  }
                ]
              }
            : issue
        )
      );

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "VERIFICATION_PENDING" as const } : r))
      );

      const notif: Notification = {
        id: crypto.randomUUID(),
        userRole: "AUDITOR",
        title: "Work Evidence Submitted",
        message: `${id} has completion proof attached. Certified auditor verification is required.`,
        type: "WARNING",
        read: false,
        createdAt: "Just now"
      };
      setNotifications((prev) => [notif, ...prev]);
    },
    []
  );

  const verifyIssue = useCallback((id: string, approved: boolean, comment: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === id) {
          return {
            ...issue,
            status: approved ? "CLOSED" : "REWORK_REQUIRED",
            progress: approved ? 100 : 65,
            verifierComment: comment,
            closedAt: approved ? new Date().toISOString().slice(0, 10) : undefined
          };
        }
        return issue;
      })
    );

    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: approved ? ("CLOSED" as const) : ("REWORK_REQUIRED" as const) } : r
      )
    );

    // If approved, update building score and accessibility features
    if (approved) {
      setBuildings((prev) =>
        prev.map((b) => {
          const matchedIssue = issues.find((i) => i.id === id);
          if (matchedIssue && matchedIssue.buildingId === b.id) {
            const nextScore = Math.min(100, b.score + 6);
            const features = { ...b.features };
            const cat = (matchedIssue.category || "").toUpperCase();
            if (cat.includes("RAMP")) features.ramp = "Available";
            if (cat.includes("ENTRANCE")) features.entrance = true;
            if (cat.includes("TOILET")) features.toilet = true;
            if (cat.includes("PARK")) features.parking = true;
            return { ...b, score: nextScore, features };
          }
          return b;
        })
      );
    }

    const notif: Notification = {
      id: crypto.randomUUID(),
      userRole: "CITIZEN",
      title: approved ? "Complaint Verified & Closed" : "Rework Required by Auditor",
      message: approved
        ? `${id} has been physically verified by a certified auditor and closed.`
        : `${id} work proof did not meet all criteria. Sent back for rework.`,
      type: approved ? "SUCCESS" : "WARNING",
      read: false,
      createdAt: "Just now"
    };
    setNotifications((prev) => [notif, ...prev]);
  }, [issues]);

  const addFollowUp = useCallback((reportId: string, description: string, photoCount: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              followUps: [
                ...(r.followUps || []),
                {
                  id: crypto.randomUUID(),
                  complaintId: reportId,
                  description,
                  photoCount,
                  createdAt: new Date().toLocaleString("en-IN")
                }
              ]
            }
          : r
      )
    );

    const notif: Notification = {
      id: crypto.randomUUID(),
      userRole: "AUDITOR",
      title: "Citizen Follow-Up Added",
      message: `Citizen added an update under complaint ${reportId}.`,
      type: "INFO",
      read: false,
      createdAt: "Just now"
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  }, []);

  const addReward = useCallback((reward: Omit<Reward, "id">) => {
    const newRew: Reward = { ...reward, id: `rew-${Date.now()}` };
    setRewards((prev) => [newRew, ...prev]);

    // Attach to building profile
    setBuildings((prev) =>
      prev.map((b) =>
        b.id === reward.buildingId
          ? { ...b, rewards: [...(b.rewards || []), newRew], score: Math.min(100, b.score + 2) }
          : b
      )
    );

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminId: "adm-01",
      adminName: "Priya Raman",
      action: "REWARD_ISSUED",
      targetType: "BUILDING",
      targetId: reward.buildingId,
      description: `Conferred ${reward.rewardType} to ${reward.buildingName}.`,
      createdAt: new Date().toLocaleString("en-IN")
    };
    setAdminLogs((prev) => [log, ...prev]);
  }, []);

  const addPenalty = useCallback((penalty: Omit<Penalty, "id">) => {
    const newPen: Penalty = { ...penalty, id: `pen-${Date.now()}` };
    setPenalties((prev) => [newPen, ...prev]);

    // Attach to building profile
    setBuildings((prev) =>
      prev.map((b) =>
        b.id === penalty.buildingId
          ? { ...b, penalties: [...(b.penalties || []), newPen] }
          : b
      )
    );

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminId: "adm-01",
      adminName: "Priya Raman",
      action: "PENALTY_ISSUED",
      targetType: "DEPARTMENT",
      targetId: penalty.responsibleDepartment,
      description: `Issued ${penalty.penaltyType} against ${penalty.responsibleDepartment} for ${penalty.buildingName}. Reason: ${penalty.reason}.`,
      createdAt: new Date().toLocaleString("en-IN")
    };
    setAdminLogs((prev) => [log, ...prev]);
  }, []);

  const reassignAuditor = useCallback((fromAuditorId: string, toAuditorId: string, reason: string) => {
    const targetAuditor = auditorList.find((a) => a.id === toAuditorId);
    if (!targetAuditor) return;

    // Update buildings assigned auditor
    setBuildings((prev) =>
      prev.map((b) =>
        b.assignedAuditorId === fromAuditorId
          ? { ...b, assignedAuditorId: toAuditorId, assignedAuditorName: targetAuditor.name }
          : b
      )
    );

    // Update auditor performance counts
    setAuditorList((prev) =>
      prev.map((a) => {
        if (a.id === fromAuditorId) {
          return { ...a, assignedBuildings: 0, currentWorkload: "LOW" };
        }
        if (a.id === toAuditorId) {
          return {
            ...a,
            assignedBuildings: a.assignedBuildings + 4,
            currentWorkload: "HIGH"
          };
        }
        return a;
      })
    );

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminId: "adm-01",
      adminName: "Priya Raman",
      action: "AUDITOR_REASSIGNMENT",
      targetType: "AUDITOR",
      targetId: toAuditorId,
      description: `Reassigned all facilities from ${fromAuditorId} to ${targetAuditor.name}. Reason: ${reason}.`,
      createdAt: new Date().toLocaleString("en-IN")
    };
    setAdminLogs((prev) => [log, ...prev]);
  }, [auditorList]);

  const escalateIssue = useCallback((issueId: string, reason: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status: "ESCALATED",
              escalationLevel: Math.min(3, i.escalationLevel + 1)
            }
          : i
      )
    );

    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminId: "adm-01",
      adminName: "Priya Raman",
      action: "ISSUE_ESCALATION",
      targetType: "ISSUE",
      targetId: issueId,
      description: `Escalated ${issueId} to higher authority level. Reason: ${reason}.`,
      createdAt: new Date().toLocaleString("en-IN")
    };
    setAdminLogs((prev) => [log, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      role,
      demoMode: true,
      buildings,
      departments,
      auditorList,
      issues,
      reports,
      notifications,
      rewards,
      penalties,
      adminLogs,
      login,
      logout,
      resetDemo,
      submitReport,
      acceptReport,
      acceptAndAssignReport,
      createAuditIssue,
      createAuditFindingsIssues,
      assignIssue,
      startWork,
      submitEvidence,
      verifyIssue,
      addFollowUp,
      markNotificationsRead,
      addReward,
      addPenalty,
      reassignAuditor,
      escalateIssue
    }),
    [
      role,
      buildings,
      departments,
      auditorList,
      issues,
      reports,
      notifications,
      rewards,
      penalties,
      adminLogs,
      login,
      logout,
      resetDemo,
      submitReport,
      acceptReport,
      acceptAndAssignReport,
      createAuditIssue,
      createAuditFindingsIssues,
      assignIssue,
      startWork,
      submitEvidence,
      verifyIssue,
      addFollowUp,
      markNotificationsRead,
      addReward,
      addPenalty,
      reassignAuditor,
      escalateIssue
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}
