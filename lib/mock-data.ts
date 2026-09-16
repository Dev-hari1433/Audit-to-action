import type {
  Building,
  CitizenReport,
  Department,
  Issue,
  Notification,
  AuditorPerformance,
  Reward,
  Penalty,
  AdminActivityLog
} from "@/types";

const buildingRawData = [
  ["Government General Hospital", "Hospital", "Government", 78, 13.0815, 80.2771, "aud-01", "Arun Selvan", "dept-01", "Hospital Engineering"],
  ["Anna Nagar Government College", "College", "Government", 64, 13.0850, 80.2101, "aud-02", "Divya K", "dept-02", "Public Works Department"],
  ["Teynampet Corporation Office", "Government Office", "Government", 82, 13.0444, 80.2498, "aud-01", "Arun Selvan", "dept-05", "Municipal Corporation Works"],
  ["Marina Public Library", "Public Institution", "Government", 88, 13.0548, 80.2823, "aud-03", "Karthik S", "dept-03", "Building Administration"],
  ["Mylapore Higher Secondary School", "School", "Government", 59, 13.0339, 80.2698, "aud-04", "Sneha R", "dept-02", "Public Works Department"],
  ["South Chennai District Office", "Government Office", "Government", 71, 12.9840, 80.2180, "aud-02", "Divya K", "dept-05", "Municipal Corporation Works"],
  ["Perambur Community Health Centre", "Hospital", "Government", 76, 13.1180, 80.2320, "aud-01", "Arun Selvan", "dept-01", "Hospital Engineering"],
  ["Velachery Citizen Service Centre", "Public Institution", "Government", 91, 12.9815, 80.2180, "aud-03", "Karthik S", "dept-03", "Building Administration"],
  ["Royapettah Arts College", "College", "Government", 67, 13.0550, 80.2630, "aud-05", "Venkatesh M", "dept-02", "Public Works Department"],
  ["Guindy Industrial Training Institute", "College", "Government", 62, 13.0105, 80.2130, "aud-04", "Sneha R", "dept-02", "Public Works Department"],
  ["Adyar Learning Centre", "School", "Private", 86, 13.0068, 80.2570, "aud-03", "Karthik S", "dept-03", "Building Administration"],
  ["Kodambakkam Civic Hall", "Public Institution", "Government", 73, 13.0520, 80.2260, "aud-02", "Divya K", "dept-05", "Municipal Corporation Works"],
  ["Egmore Women’s Resource Centre", "Public Institution", "Government", 81, 13.0730, 80.2610, "aud-05", "Venkatesh M", "dept-03", "Building Administration"],
  ["Nungambakkam Community Clinic", "Private Hospital", "Private", 69, 13.0610, 80.2410, "aud-01", "Arun Selvan", "dept-01", "Hospital Engineering"],
  ["Saidapet Taluk Office", "Government Office", "Government", 55, 13.0210, 80.2230, "aud-04", "Sneha R", "dept-05", "Municipal Corporation Works"],
  ["Thiruvanmiyur Public School", "School", "Government", 79, 12.9840, 80.2590, "aud-02", "Divya K", "dept-02", "Public Works Department"],
  ["Kilpauk Rehabilitation Centre", "Hospital", "Government", 84, 13.0830, 80.2420, "aud-01", "Arun Selvan", "dept-01", "Hospital Engineering"],
  ["Washermanpet Skills Centre", "College", "Government", 61, 13.1130, 80.2860, "aud-05", "Venkatesh M", "dept-02", "Public Works Department"],
  ["Porur Community Hall", "Public Institution", "Government", 74, 13.0350, 80.1570, "aud-03", "Karthik S", "dept-05", "Municipal Corporation Works"],
  ["Sholinganallur Service Hub", "Government Office", "Government", 89, 12.9010, 80.2270, "aud-04", "Sneha R", "dept-03", "Building Administration"]
] as const;

export const initialRewards: Reward[] = [
  {
    id: "rew-01",
    buildingId: "bld-08",
    buildingName: "Velachery Citizen Service Centre",
    rewardType: "Compliance Recognition",
    description: "Achieved exemplary 91% monitoring score with full tactile paving and automated wheelchair lift.",
    date: "2026-08-15"
  },
  {
    id: "rew-02",
    buildingId: "bld-04",
    buildingName: "Marina Public Library",
    rewardType: "Accessibility Improvement Badge",
    description: "Successfully added audio wayfinding signage and unobstructed ramp access for visually impaired citizens.",
    date: "2026-07-28"
  },
  {
    id: "rew-03",
    buildingId: "bld-11",
    buildingName: "Adyar Learning Centre",
    rewardType: "Certificate",
    description: "Recognized for universal accessible restrooms across all student wings.",
    date: "2026-06-12"
  }
];

export const initialPenalties: Penalty[] = [
  {
    id: "pen-01",
    buildingId: "bld-01",
    buildingName: "Government General Hospital",
    responsibleDepartment: "Hospital Engineering",
    penaltyType: "Notice",
    amount: 25000,
    reason: "Main entrance ramp construction overdue by 12 days beyond statutory deadline.",
    authorityNote: "First formal notice issued. 14 days granted before administrative escalation.",
    date: "2026-08-25",
    status: "ISSUED"
  },
  {
    id: "pen-02",
    buildingId: "bld-15",
    buildingName: "Saidapet Taluk Office",
    responsibleDepartment: "Municipal Corporation Works",
    penaltyType: "Warning",
    reason: "Ground floor accessible restroom repeatedly locked during public operational hours.",
    authorityNote: "Administrative inspection verified citizen complaint ACC-2026-00108.",
    date: "2026-08-20",
    status: "ISSUED"
  }
];

export const buildings: Building[] = buildingRawData.map((item, index) => ({
  id: `bld-${String(index + 1).padStart(2, "0")}`,
  name: item[0],
  type: item[1],
  ownership: item[2] as "Government" | "Private",
  address: `${18 + index}, Civic Campus Road, ${item[0].split(" ")[0]} Zone`,
  city: "Chennai",
  organisation: index % 4 === 0 ? "Greater Chennai Corporation" : "Tamil Nadu Public Services Pilot",
  latitude: item[4],
  longitude: item[5],
  score: item[3],
  lastAudit: `2026-${String((index % 7) + 1).padStart(2, "0")}-${String((index % 20) + 3).padStart(2, "0")}`,
  assignedAuditorId: item[6],
  assignedAuditorName: item[7],
  departmentId: item[8],
  departmentName: item[9],
  features: {
    entrance: item[3] >= 60,
    ramp: index === 0 ? "In progress" : item[3] >= 80 ? "Available" : "Needs improvement",
    toilet: item[3] >= 70,
    parking: item[3] >= 85
  },
  rewards: initialRewards.filter((r) => r.buildingId === `bld-${String(index + 1).padStart(2, "0")}`),
  penalties: initialPenalties.filter((p) => p.buildingId === `bld-${String(index + 1).padStart(2, "0")}`)
}));

export const departments: Department[] = [
  {
    id: "dept-01",
    name: "Hospital Engineering",
    type: "Healthcare Infrastructure",
    contactName: "Kavitha Mani",
    email: "kavitha.mani@chennai-health.gov.in",
    phone: "+91 94441 23456",
    assignedIssuesCount: 38,
    completedIssuesCount: 26,
    overdueIssuesCount: 4,
    avgResolutionDays: 22
  },
  {
    id: "dept-02",
    name: "Public Works Department",
    type: "Civil Works Wing",
    contactName: "Ramesh Iyer",
    email: "ramesh.pwd@tn.gov.in",
    phone: "+91 94442 34567",
    assignedIssuesCount: 45,
    completedIssuesCount: 32,
    overdueIssuesCount: 5,
    avgResolutionDays: 28
  },
  {
    id: "dept-03",
    name: "Building Administration",
    type: "Facilities Management",
    contactName: "Anitha Parthiban",
    email: "anitha.admin@civic.tn.gov.in",
    phone: "+91 94443 45678",
    assignedIssuesCount: 24,
    completedIssuesCount: 20,
    overdueIssuesCount: 1,
    avgResolutionDays: 14
  },
  {
    id: "dept-04",
    name: "Transit Infrastructure",
    type: "Metro & Bus Transport",
    contactName: "Murugan Selvam",
    email: "murugan@chennaitransit.gov.in",
    phone: "+91 94444 56789",
    assignedIssuesCount: 18,
    completedIssuesCount: 15,
    overdueIssuesCount: 2,
    avgResolutionDays: 19
  },
  {
    id: "dept-05",
    name: "Municipal Corporation Works",
    type: "GCC Zone Works",
    contactName: "Suresh Babu",
    email: "suresh.works@chennaicorp.gov.in",
    phone: "+91 94445 67890",
    assignedIssuesCount: 30,
    completedIssuesCount: 22,
    overdueIssuesCount: 3,
    avgResolutionDays: 25
  }
];

export const auditorList: AuditorPerformance[] = [
  {
    id: "aud-01",
    name: "Arun Selvan",
    email: "arun.auditor@accesstrack.org",
    assignedBuildings: 5,
    visits: 18,
    complaintsReviewed: 28,
    issuesVerified: 22,
    issuesClosed: 19,
    overdueReviews: 1,
    avgVerificationDays: 1.8,
    currentWorkload: "NORMAL",
    active: true
  },
  {
    id: "aud-02",
    name: "Divya K",
    email: "divya.auditor@accesstrack.org",
    assignedBuildings: 4,
    visits: 14,
    complaintsReviewed: 22,
    issuesVerified: 17,
    issuesClosed: 15,
    overdueReviews: 2,
    avgVerificationDays: 2.3,
    currentWorkload: "NORMAL",
    active: true
  },
  {
    id: "aud-03",
    name: "Karthik S",
    email: "karthik.auditor@accesstrack.org",
    assignedBuildings: 4,
    visits: 16,
    complaintsReviewed: 24,
    issuesVerified: 19,
    issuesClosed: 18,
    overdueReviews: 0,
    avgVerificationDays: 1.5,
    currentWorkload: "LOW",
    active: true
  },
  {
    id: "aud-04",
    name: "Sneha R",
    email: "sneha.auditor@accesstrack.org",
    assignedBuildings: 4,
    visits: 12,
    complaintsReviewed: 19,
    issuesVerified: 14,
    issuesClosed: 12,
    overdueReviews: 3,
    avgVerificationDays: 3.1,
    currentWorkload: "HIGH",
    active: true
  },
  {
    id: "aud-05",
    name: "Venkatesh M",
    email: "venkatesh.auditor@accesstrack.org",
    assignedBuildings: 3,
    visits: 11,
    complaintsReviewed: 16,
    issuesVerified: 13,
    issuesClosed: 12,
    overdueReviews: 1,
    avgVerificationDays: 2.0,
    currentWorkload: "LOW",
    active: true
  }
];

export const initialAdminLogs: AdminActivityLog[] = [
  {
    id: "log-01",
    adminId: "adm-01",
    adminName: "Priya Raman",
    action: "AUDITOR_REASSIGNMENT",
    targetType: "BUILDING",
    targetId: "bld-01",
    description: "Reassigned Government General Hospital inspection monitoring to Auditor Arun Selvan.",
    createdAt: "2026-08-28 11:30"
  },
  {
    id: "log-02",
    adminId: "adm-01",
    adminName: "Priya Raman",
    action: "ENFORCEMENT_NOTICE",
    targetType: "ISSUE",
    targetId: "ACC-1024",
    description: "Formal statutory notice issued to Hospital Engineering for 8-day overdue entrance ramp.",
    createdAt: "2026-08-25 15:45"
  },
  {
    id: "log-03",
    adminId: "adm-01",
    adminName: "Priya Raman",
    action: "REWARD_ISSUED",
    targetType: "BUILDING",
    targetId: "bld-08",
    description: "Awarded Compliance Recognition Badge to Velachery Citizen Service Centre for 91% score.",
    createdAt: "2026-08-15 09:20"
  }
];

const issueTitles = [
  ["No wheelchair ramp at main entrance", "ENTRANCE"],
  ["Accessible toilet grab bars incomplete", "TOILETS"],
  ["Tactile pathway is interrupted", "MOVEMENT"],
  ["Accessible parking bay not marked", "PARKING"],
  ["Directional signage lacks tactile information", "SIGNAGE"],
  ["Entrance doorway threshold step barrier", "ENTRANCE"],
  ["Handrail missing on exterior access stairs", "HANDRAIL"],
  ["Lift call buttons lack Braille characters", "LIFT"]
] as const;

export const seededIssues: Issue[] = Array.from({ length: 120 }, (_, index) => {
  const building = buildings[index % buildings.length];
  const template = issueTitles[index % issueTitles.length];
  const status: Issue["status"] =
    index === 0
      ? "OVERDUE"
      : index === 1
      ? "VERIFICATION_PENDING"
      : index < 70
      ? "CLOSED"
      : index < 95
      ? "IN_PROGRESS"
      : index < 105
      ? "OVERDUE"
      : "PENDING";

  const isOverdue = status === "OVERDUE" || index === 0;

  return {
    id: index === 0 ? "ACC-1024" : `ACC-${String(1025 + index).padStart(4, "0")}`,
    reportId: index === 0 ? "ACC-2026-00124" : undefined,
    buildingId: building.id,
    buildingName: building.name,
    category: template[1],
    title: template[0],
    description: `Audit observation recorded at ${building.name}. The barrier prevents independent access by persons with reduced mobility.`,
    severity: index % 4 === 0 ? "CRITICAL" : index % 3 === 0 ? "HIGH" : "MEDIUM",
    status,
    responsible: index % 2 === 0 ? "Kavitha Mani — Hospital Facilities Lead" : "Ramesh Iyer — PWD Engineer",
    department: building.departmentName || "Hospital Engineering",
    responsibleDepartmentId: building.departmentId,
    deadline: isOverdue ? "2026-08-20" : "2026-09-25",
    createdAt: "2026-07-21",
    actionRequired: `Provide compliant ${template[0].toLowerCase()} and upload clear completion proof photos.`,
    auditorNotes: "Standard NBC guidelines apply. Minimum ramp gradient 1:12.",
    evidence:
      status === "CLOSED" || status === "VERIFICATION_PENDING"
        ? [
            {
              id: `ev-${index}-1`,
              type: "BEFORE",
              description: "Initial citizen complaint and auditor inspection photo.",
              fileName: "entrance-barrier-before.jpg",
              createdAt: "2026-07-22",
              photoCount: 2,
              aiSummary: "Steps detected at entrance threshold. No wheelchair ramp visible."
            },
            {
              id: `ev-${index}-2`,
              type: "AFTER",
              description: "Ramp constructed with continuous steel handrail and anti-slip finish.",
              fileName: "ramp-completed-after.jpg",
              createdAt: "2026-08-26",
              photoCount: 2,
              aiSummary: "New ramp structure and handrail detected. Contrast and gradient verified."
            }
          ]
        : [],
    verifierComment:
      status === "CLOSED"
        ? "Physical inspection and after-photos verified on site. Complies with NBC barrier-free standards."
        : undefined,
    escalationLevel: isOverdue ? 2 : 0,
    progress: status === "CLOSED" ? 100 : status === "VERIFICATION_PENDING" ? 80 : status === "IN_PROGRESS" ? 50 : 15
  };
});

export const initialReports: CitizenReport[] = [
  {
    id: "ACC-2026-00124",
    buildingId: "bld-01",
    buildingName: "Government General Hospital",
    category: "Wheelchair Ramp",
    description: "There is no wheelchair ramp at the main entrance of Government Hospital. I am near the east gate.",
    location: "Main entrance, East Gate",
    latitude: 13.0815,
    longitude: 80.2771,
    status: "OVERDUE",
    createdAt: "2026-08-15",
    citizenName: "Meena Kumar",
    phone: "+91 98401 24681",
    phoneVerified: true,
    photos: [
      {
        id: "p-01",
        fileName: "gh-entrance-steps.jpg",
        width: 1280,
        height: 960,
        quality: "CLEAR",
        source: "CAMERA"
      }
    ],
    aiSummary: "AI preliminary assessment: 3 concrete steps detected at entrance. Wheelchair ramp missing. Human verification required.",
    followUps: [
      {
        id: "fu-01",
        complaintId: "ACC-2026-00124",
        description: "The department started initial measurement, but the ramp is still incomplete and steps are blocked.",
        photoCount: 1,
        createdAt: "2026-08-26"
      }
    ]
  },
  {
    id: "ACC-2026-00123",
    buildingId: "bld-02",
    buildingName: "Anna Nagar Government College",
    category: "Accessible Toilet",
    description: "The accessible toilet on the ground floor of Block B is locked during operational class hours.",
    location: "Ground Floor, Block B",
    latitude: 13.0850,
    longitude: 80.2101,
    status: "UNDER_REVIEW",
    createdAt: "2026-08-28",
    citizenName: "Rajesh Kannan",
    phone: "+91 98402 34567",
    phoneVerified: true,
    photos: [
      {
        id: "p-02",
        fileName: "toilet-locked.jpg",
        width: 1280,
        height: 960,
        quality: "CLEAR",
        source: "CAMERA"
      }
    ],
    aiSummary: "AI preliminary assessment: Door latch and padlock visible on designated accessible toilet stall."
  },
  {
    id: "ACC-2026-00122",
    buildingId: "bld-03",
    buildingName: "Teynampet Corporation Office",
    category: "Parking",
    description: "Designated accessible parking bay is blocked by municipal equipment and lacks visible ground signage.",
    location: "Visitor Parking, North Wing",
    latitude: 13.0444,
    longitude: 80.2498,
    status: "ASSIGNED",
    createdAt: "2026-08-22",
    citizenName: "Anand Sundaram",
    phone: "+91 98403 45678",
    phoneVerified: true,
    photos: [
      {
        id: "p-03",
        fileName: "parking-obstruction.jpg",
        width: 1280,
        height: 960,
        quality: "CLEAR",
        source: "CAMERA"
      }
    ],
    aiSummary: "AI preliminary assessment: Obstruction detected across designated parking space."
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "n1",
    userRole: "CITIZEN",
    title: "Complaint Under Review",
    message: "Your complaint ACC-2026-00124 for Government General Hospital has been assigned to an auditor.",
    read: false,
    createdAt: "10 minutes ago",
    type: "INFO"
  },
  {
    id: "n2",
    userRole: "AUDITOR",
    title: "Evidence Awaiting Verification",
    message: "Hospital Engineering uploaded completion evidence for ACC-1025. Verification required.",
    read: false,
    createdAt: "1 hour ago",
    type: "WARNING"
  },
  {
    id: "n3",
    userRole: "BUILDING_MANAGER",
    title: "Corrective Action Assigned",
    message: "New high-priority barrier assigned at Government General Hospital with 30-day deadline.",
    read: false,
    createdAt: "3 hours ago",
    type: "INFO"
  },
  {
    id: "n4",
    userRole: "ADMIN",
    title: "Statutory Overdue Alert",
    message: "Issue ACC-1024 has exceeded deadline by 8 days. Escalated to Level 2 (Department Head).",
    read: false,
    createdAt: "4 hours ago",
    type: "WARNING"
  }
];

export const demoAccounts = [
  { role: "CITIZEN" as const, name: "Meena Kumar", detail: "Report and track barriers with live photos & OTP" },
  { role: "AUDITOR" as const, name: "Arun Selvan", detail: "Inspect buildings, review complaints & verify evidence" },
  { role: "BUILDING_MANAGER" as const, name: "Kavitha Mani", detail: "Hospital facilities lead — execute repairs & upload proof" },
  { role: "ADMIN" as const, name: "Priya Raman", detail: "Supervise system, reassign auditors & issue enforcement notices" }
];
