export const sampleApplicants = [
    {
        id: "1",
        name: "Aarav Mehta",
        city: "Dubai",
        skills: ["Guitarist", "Sound Engineer"],
        credits: "View credits",
        referrals: 15,
        phone: "+91 9876543210",
        email: "aaravmehta12@gmail.com",
        avatar: "/default-profile.png",
    },
    {
        id: "2",
        name: "Leila Khan",
        city: "Abu Dhabi",
        skills: ["Vocalist", "Composer"],
        credits: "View credits",
        referrals: 12,
        phone: "+91 9876543210",
        email: "leilakhan22@gmail.com",
        avatar: "/default-profile.png",
    },
    {
        id: "3",
        name: "Noah Elder",
        city: "Dubai",
        skills: ["Editor", "Colorist"],
        credits: "View credits",
        referrals: 9,
        phone: "+91 9876543210",
        email: "noahelder@email.com",
        avatar: "/default-profile.png",
    },
];

export type SampleApplicant = (typeof sampleApplicants)[number];

export const availabilityStates = ["available", "hold", "na"] as const;
export type AvailabilityState = (typeof availabilityStates)[number];

export type AvailabilitySchedule = Record<string, AvailabilityState>;

export const availabilityScheduleByApplicant: Record<string, AvailabilitySchedule> = {
    "1": {
        "Sep 2025-12": "available",
        "Sep 2025-15": "available",
        "Sep 2025-18": "hold",
        "Sep 2025-21": "available",
        "Oct 2025-2": "available",
        "Oct 2025-5": "hold",
        "Oct 2025-13": "available",
        "Oct 2025-20": "na",
        "Oct 2025-25": "available",
    },
    "2": {
        "Sep 2025-12": "hold",
        "Sep 2025-16": "available",
        "Sep 2025-19": "available",
        "Sep 2025-24": "na",
        "Oct 2025-1": "available",
        "Oct 2025-6": "available",
        "Oct 2025-10": "hold",
        "Oct 2025-17": "available",
        "Oct 2025-23": "available",
    },
    "3": {
        "Sep 2025-12": "na",
        "Sep 2025-15": "available",
        "Sep 2025-18": "hold",
        "Sep 2025-22": "available",
        "Oct 2025-3": "available",
        "Oct 2025-8": "hold",
        "Oct 2025-14": "available",
        "Oct 2025-19": "available",
        "Oct 2025-27": "available",
    },
};

export const getAvailabilityState = (applicantId: string, dayKey: string): AvailabilityState => {
    const schedule = availabilityScheduleByApplicant[applicantId];
    if (!schedule) {
        return "na";
    }
    return schedule[dayKey] ?? "na";
};

export const contactGroups = [
    {
        id: "camera",
        department: "Camera",
        summary: "4 Camera Operator for Shortfilm",
        entries: [
            { role: "Camera Operator", company: "Central Films", person: sampleApplicants[0] },
            { role: "Camera Operator", company: "Central Films", person: sampleApplicants[1] },
        ],
    },
    {
        id: "lighting",
        department: "Lighting",
        summary: "4 Lighting Operator for Shortfilm",
        entries: [
            { role: "Lighting Operator", company: "Central Films", person: sampleApplicants[2] },
            { role: "Lighting Operator", company: "Central Films", person: sampleApplicants[0] },
        ],
    },
];

export type ContactGroup = (typeof contactGroups)[number];
