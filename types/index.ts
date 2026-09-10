export type Role = "CITIZEN" | "AUDITOR" | "BUILDING_MANAGER" | "ADMIN";

export type IssueStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REWORK_REQUIRED"
  | "OVERDUE"
  | "ESCALATED"
  | "CLOSED";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Building {
  id: string;
  name: string;
  type: string;
  ownership: "Government" | "Private";
  address: string;
  city: string;
  organisation: string;
  latitude: number;
  longitude: number;
  score: number;
  lastAudit: string;
  features: { entrance: boolean; ramp: string; toilet: boolean; parking: boolean };
}

export interface Evidence {
  id: string;
  description: string;
  fileName: string;
  createdAt: string;
  type: "BEFORE" | "AFTER" | "DOCUMENT";
  photoCount?: number;
  aiSummary?: string;
}

export interface PhotoEvidence {
  id: string;
  fileName: string;
  width: number;
  height: number;
  quality: "CLEAR" | "RETAKE";
  source: "CAMERA" | "UPLOAD";
}

export interface Issue {
  id: string;
  buildingId: string;
  buildingName: string;
  category: string;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  responsible: string;
  department: string;
  deadline: string;
  createdAt: string;
  actionRequired: string;
  evidence: Evidence[];
  verifierComment?: string;
  escalationLevel: number;
  progress: number;
  reportId?: string;
}

export interface CitizenReport {
  id: string;
  buildingId: string;
  buildingName: string;
  category: string;
  description: string;
  location: string;
  status: "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "ASSIGNED" | "IN_PROGRESS" | "EVIDENCE_UPLOADED" | "VERIFICATION_PENDING" | "REWORK_REQUIRED" | "VERIFIED" | "RESOLVED";
  createdAt: string;
  citizenName?: string;
  email?: string;
  phone?: string;
  phoneVerified?: boolean;
  photos?: PhotoEvidence[];
  aiSummary?: string;
  followUps?: Array<{ id: string; description: string; createdAt: string; photoCount: number }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "INFO" | "WARNING" | "SUCCESS";
}

export interface AuditDraftItem {
  id: string;
  category: string;
  requirement: string;
  result: "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NOT_COMPLIANT" | "NOT_APPLICABLE";
  severity: Severity;
  notes: string;
  correctiveAction: string;
}
