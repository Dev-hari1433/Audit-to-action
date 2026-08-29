import type { Building, CitizenReport, Issue, Notification } from "@/types";

const buildingNames = [
  ["Government General Hospital", "Hospital", "Government", 78, 13.0815, 80.2771],
  ["Anna Nagar Government College", "College", "Government", 64, 13.085, 80.2101],
  ["Teynampet Corporation Office", "Government Office", "Government", 82, 13.0444, 80.2498],
  ["Marina Public Library", "Public Institution", "Government", 88, 13.0548, 80.2823],
  ["Mylapore Higher Secondary School", "School", "Government", 59, 13.0339, 80.2698],
  ["South Chennai District Office", "Government Office", "Government", 71, 12.984, 80.218],
  ["Perambur Community Health Centre", "Hospital", "Government", 76, 13.118, 80.232],
  ["Velachery Citizen Service Centre", "Public Institution", "Government", 91, 12.9815, 80.218],
  ["Royapettah Arts College", "College", "Government", 67, 13.055, 80.263],
  ["Guindy Industrial Training Institute", "College", "Government", 62, 13.0105, 80.213],
  ["Adyar Learning Centre", "School", "Private", 86, 13.0068, 80.257],
  ["Kodambakkam Civic Hall", "Public Institution", "Government", 73, 13.052, 80.226],
  ["Egmore Women’s Resource Centre", "Public Institution", "Government", 81, 13.073, 80.261],
  ["Nungambakkam Community Clinic", "Private Hospital", "Private", 69, 13.061, 80.241],
  ["Saidapet Taluk Office", "Government Office", "Government", 55, 13.021, 80.223],
  ["Thiruvanmiyur Public School", "School", "Government", 79, 12.984, 80.259],
  ["Kilpauk Rehabilitation Centre", "Hospital", "Government", 84, 13.083, 80.242],
  ["Washermanpet Skills Centre", "College", "Government", 61, 13.113, 80.286],
  ["Porur Community Hall", "Public Institution", "Government", 74, 13.035, 80.157],
  ["Sholinganallur Service Hub", "Government Office", "Government", 89, 12.901, 80.227],
] as const;

export const buildings: Building[] = buildingNames.map((item, index) => ({
  id: `bld-${String(index + 1).padStart(2, "0")}`,
  name: item[0],
  type: item[1],
  ownership: item[2],
  address: `${18 + index}, Civic Campus Road, ${item[0].split(" ")[0]} Zone`,
  city: "Chennai",
  organisation: index % 4 === 0 ? "Greater Chennai Corporation" : "Tamil Nadu Public Services Pilot",
  latitude: item[4],
  longitude: item[5],
  score: item[3],
  lastAudit: `2026-${String((index % 7) + 1).padStart(2, "0")}-${String((index % 20) + 3).padStart(2, "0")}`,
  features: {
    entrance: item[3] >= 60,
    ramp: index === 0 ? "In progress" : item[3] >= 80 ? "Available" : "Needs improvement",
    toilet: item[3] >= 70,
    parking: item[3] >= 85,
  },
}));

const issueTitles = [
  ["No wheelchair ramp at main entrance", "ENTRANCE"],
  ["Accessible toilet grab bars incomplete", "TOILETS"],
  ["Tactile pathway is interrupted", "MOVEMENT"],
  ["Accessible parking bay not marked", "PARKING"],
  ["Directional signage lacks tactile information", "COMMUNICATION"],
  ["Entrance doorway is too narrow", "ENTRANCE"],
] as const;

const statuses: Issue["status"][] = ["CLOSED", "CLOSED", "VERIFIED", "IN_PROGRESS", "PENDING", "OVERDUE"];
const severities: Issue["severity"][] = ["MEDIUM", "HIGH", "MEDIUM", "LOW", "HIGH", "CRITICAL"];

export const seededIssues: Issue[] = Array.from({ length: 120 }, (_, index) => {
  const building = buildings[index % buildings.length];
  const template = issueTitles[index % issueTitles.length];
  const status = index < 70 ? statuses[index % 3] : index < 100 ? "IN_PROGRESS" : index < 110 ? "OVERDUE" : "PENDING";
  return {
    id: index === 0 ? "ACC-1024" : `ACC-${String(1025 + index).padStart(4, "0")}`,
    buildingId: building.id,
    buildingName: building.name,
    category: template[1],
    title: template[0],
    description: `Audit observation recorded at ${building.name}. The route is not independently usable by a wheelchair user.`,
    severity: severities[index % severities.length],
    status: index === 0 ? "OVERDUE" : status,
    responsible: index % 3 === 0 ? "Building Maintenance Lead" : "Facilities Coordinator",
    department: index % 2 === 0 ? "Engineering" : "Building Administration",
    deadline: index < 110 ? "2026-08-20" : "2026-09-15",
    createdAt: "2026-07-21",
    actionRequired: `Correct the ${template[1].toLowerCase()} barrier and provide clear before/after evidence.`,
    evidence: [],
    verifierComment: undefined,
    escalationLevel: status === "OVERDUE" || index === 0 ? 2 : 0,
    progress: status === "CLOSED" ? 100 : status === "VERIFIED" ? 92 : status === "IN_PROGRESS" ? 55 : 15,
  };
});

export const initialReports: CitizenReport[] = [
  {
    id: "ACC-2026-00124",
    buildingId: "bld-02",
    buildingName: "Anna Nagar Government College",
    category: "TOILETS",
    description: "The accessible toilet is locked during class hours.",
    location: "Ground floor, Block B",
    status: "UNDER_REVIEW",
    createdAt: "2026-08-28",
  },
  {
    id: "ACC-2026-00119",
    buildingId: "bld-05",
    buildingName: "Mylapore Higher Secondary School",
    category: "ENTRANCE",
    description: "Steps at the only public entrance and no ramp.",
    location: "Main gate",
    status: "ASSIGNED",
    createdAt: "2026-08-25",
  },
];

export const initialNotifications: Notification[] = [
  { id: "n1", title: "Evidence ready", message: "Issue ACC-1087 is waiting for human verification.", read: false, createdAt: "10 minutes ago", type: "INFO" },
  { id: "n2", title: "Deadline approaching", message: "3 assigned issues are due within 3 days.", read: false, createdAt: "2 hours ago", type: "WARNING" },
  { id: "n3", title: "Issue verified", message: "Issue ACC-1048 has been verified and closed.", read: true, createdAt: "Yesterday", type: "SUCCESS" },
];

export const demoAccounts = [
  { role: "CITIZEN" as const, name: "Meena", detail: "Report and track barriers" },
  { role: "AUDITOR" as const, name: "Arun", detail: "Audit and verify work" },
  { role: "BUILDING_MANAGER" as const, name: "Kavitha", detail: "Fix assigned issues" },
  { role: "ADMIN" as const, name: "Priya", detail: "Assign and monitor action" },
];
