export type Role = "CITIZEN" | "AUDITOR" | "BUILDING_MANAGER" | "ADMIN";

export type IssueStatus =
  | "CREATED"
  | "ASSIGNED"
  | "PENDING"
  | "IN_PROGRESS"
  | "EVIDENCE_UPLOADED"
  | "VERIFICATION_PENDING"
  | "REWORK_REQUIRED"
  | "VERIFIED"
  | "CLOSED"
  | "OVERDUE"
  | "ESCALATED"
  | "COMPLETED";

export type ComplaintStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "EVIDENCE_UPLOADED"
  | "VERIFICATION_PENDING"
  | "REWORK_REQUIRED"
  | "VERIFIED"
  | "CLOSED"
  | "REJECTED"
  | "OVERDUE"
  | "ESCALATED"
  | "RESOLVED";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ProblemType =
  | "Wheelchair Ramp"
  | "Accessible Toilet"
  | "Lift"
  | "Parking"
  | "Entrance"
  | "Handrail"
  | "Tactile Path"
  | "Signage"
  | "Door / Corridor"
  | "Other";

export interface Department {
  id: string;
  name: string;
  type: string;
  contactName: string;
  email: string;
  phone: string;
  assignedIssuesCount?: number;
  completedIssuesCount?: number;
  overdueIssuesCount?: number;
  avgResolutionDays?: number;
}

export interface Reward {
  id: string;
  buildingId: string;
  buildingName: string;
  issueId?: string;
  rewardType: "Accessibility Improvement Badge" | "Compliance Recognition" | "Certificate" | "Performance Recognition";
  description: string;
  date: string;
}

export interface Penalty {
  id: string;
  buildingId: string;
  buildingName: string;
  issueId?: string;
  responsibleDepartment: string;
  penaltyType: "Warning" | "Notice" | "Administrative action" | "Fine / Penalty" | "Other";
  amount?: number;
  reason: string;
  authorityNote: string;
  date: string;
  status: "ISSUED" | "RESOLVED" | "APPEALED";
}

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
  assignedAuditorId?: string;
  assignedAuditorName?: string;
  departmentId?: string;
  departmentName?: string;
  features: { entrance: boolean; ramp: string; toilet: boolean; parking: boolean };
  rewards?: Reward[];
  penalties?: Penalty[];
}

export interface AiPhotoAnalysis {
  possibleIssue: string;
  relevance: string;
  visualIndicators: string[];
  confidenceScore: number;
  signsOfManipulation: string;
  summary: string;
  progressScore?: number;
  progressStage?: string;
  detectedImprovements?: string[];
  remainingDeficiencies?: string[];
}

export interface Evidence {
  id: string;
  description: string;
  fileName: string;
  createdAt: string;
  type: "BEFORE" | "AFTER" | "DOCUMENT";
  photoCount?: number;
  aiSummary?: string;
  aiAnalysis?: AiPhotoAnalysis;
  documentUrl?: string;
}

export interface PhotoEvidence {
  id: string;
  fileName: string;
  width: number;
  height: number;
  quality: "CLEAR" | "RETAKE";
  source: "CAMERA" | "UPLOAD";
  preview?: string;
}

export interface ComplaintFollowUp {
  id: string;
  complaintId: string;
  userId?: string;
  description: string;
  photoUrl?: string;
  photoCount: number;
  voiceText?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  complaintId?: string;
  reportId?: string;
  auditId?: string;
  buildingId: string;
  buildingName: string;
  category: string;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  responsible: string;
  department: string;
  responsibleDepartmentId?: string;
  responsibleUserId?: string;
  auditorId?: string;
  auditorName?: string;
  deadline: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  closedAt?: string;
  actionRequired: string;
  auditorNotes?: string;
  evidence: Evidence[];
  verifierComment?: string;
  escalationLevel: number;
  progress: number;
}

export interface CitizenReport {
  id: string;
  complaintNumber?: string;
  buildingId: string;
  buildingName: string;
  category: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt?: string;
  citizenName?: string;
  email?: string;
  phone?: string;
  phoneVerified?: boolean;
  photos?: PhotoEvidence[];
  aiSummary?: string;
  aiAnalysis?: AiPhotoAnalysis;
  followUps?: ComplaintFollowUp[];
}

export interface Notification {
  id: string;
  userRole?: Role;
  userId?: string;
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
  photoUrl?: string;
}

export interface Audit {
  id: string;
  buildingId: string;
  buildingName: string;
  auditorId: string;
  auditorName: string;
  auditDate: string;
  status: "DRAFT" | "COMPLETED";
  score: number;
  notes: string;
  items: AuditDraftItem[];
}

export interface Escalation {
  id: string;
  issueId: string;
  level: 1 | 2 | 3;
  escalatedFrom: string;
  escalatedTo: string;
  reason: string;
  createdAt: string;
  resolvedAt?: string;
  status: "ACTIVE" | "RESOLVED";
}

export interface AuditorReport {
  id: string;
  auditorId: string;
  auditorName: string;
  reportingPeriod: string;
  buildingsVisited: number;
  complaintsReviewed: number;
  issuesIdentified: number;
  issuesSolved: number;
  issuesPending: number;
  overdueIssues: number;
  majorBarriers: string;
  recommendations: string;
  notes: string;
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  description: string;
  createdAt: string;
}

export interface AuditorPerformance {
  id: string;
  name: string;
  email: string;
  assignedBuildings: number;
  visits: number;
  complaintsReviewed: number;
  issuesVerified: number;
  issuesClosed: number;
  overdueReviews: number;
  avgVerificationDays: number;
  currentWorkload: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  active: boolean;
}
