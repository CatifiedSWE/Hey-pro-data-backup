import type { ProjectCardType } from "@/types";

const profileData = {
  name: "John Doe",
  image: "/default-profile.png",
  banner: "/default-banner.png",
  bio: "Passionate developer with a love for creating web applications.",
  age: 30,
  occupation: "Software Developer",
  location: "San Francisco, CA",
  about:
    "I'm a passionate cinematographer who believes in the power of visual storytelling to evoke emotions and transport audiences. With over a decade in the industry, I've had the privilege of working on everything from intimate indie films to large-scale commercial productions. My approach combines technical expertise with creative vision, blending classic cinematic techniques with innovative handheld camera work, bringing an authentic, human quality to every frame.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js"],
  experience: [
    {
      company: "Tech Corp",
      role: "Frontend Developer",
      duration: "2 years",
    },
    {
      company: "Web Solutions",
      role: "Full Stack Developer",
      duration: "3 years",
    },
  ],
  education: {
    degree: "Bachelor of Science in Computer Science",
    university: "State University",
    graduationYear: 2015,
  },
};
export type GigDateWindow = {
  label: string;
  range: string;
};

export type GigCalendarMonth = {
  month: number; // 0-indexed, Jan = 0
  year: number;
  highlightedDays: number[];
};

export type GigReference = {
  label: string;
  href?: string;
  type: "file" | "link";
};

export type GigEntry = {
  id: string;
  slug: string;
  title: string;
  postedOn: string;
  postedBy: {
    name: string;
    avatar: string;
  };
  description: string;
  qualifyingCriteria: string;
  budgetLabel: string;
  dateWindows: GigDateWindow[];
  calendarMonths: GigCalendarMonth[];
  references: GigReference[];
  location: string;
  supportingFileLabel: string;
  applyBefore: string;
};

const gigsData: GigEntry[] = [
  {
    id: "1",
    slug: "video-editors-shortfilm",
    title: "4 Video Editors for Shortfilm",
    postedOn: "18 Oct, 2025",
    postedBy: {
      name: "Michael Molar",
      avatar: "/image (2).png",
    },
    description: "Description of the GIG will be here abcdefghij .......",
    qualifyingCriteria: "This is where the qualifying criteria value comes....",
    budgetLabel: " 20000",
    dateWindows: [
      { label: "Sep 2025", range: "12, 15, 16-25" },
      { label: "Oct 2025", range: "1-30" },
    ],
    calendarMonths: [
      { month: 8, year: 2025, highlightedDays: [1, 3, 4, 5, 6, 7, 8, 10, 17] },
      { month: 9, year: 2025, highlightedDays: [2, 5, 6, 7, 8, 13, 14, 20, 27, 28] },
      { month: 10, year: 2025, highlightedDays: [1, 2, 4, 5, 6, 7, 8, 17] },
      { month: 11, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7, 8, 17] },
    ],
    references: [
      { label: "Document.pdf", type: "file" },
      { label: "www.somewebsite.com/Document", href: "https://somewebsite.com/Document", type: "link" },
    ],
    location: "Dubai Design District, location1",
    supportingFileLabel: "Supporting file attached",
    applyBefore: "22 Oct, 2025",
  },
  {
    id: "2",
    slug: "post-production-supervisors",
    title: "Post Production Supervisors",
    postedOn: "18 Oct, 2025",
    postedBy: {
      name: "Michael Molar",
      avatar: "/image (2).png",
    },
    description: "Description of the GIG will be here abcdefghij .......",
    qualifyingCriteria: "This is where the qualifying criteria value comes....",
    budgetLabel: " 18000",
    dateWindows: [
      { label: "Sep 2025", range: "12, 15, 16-25" },
      { label: "Oct 2025", range: "1-30" },
    ],
    calendarMonths: [
      { month: 8, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 16, 17, 18] },
      { month: 9, year: 2025, highlightedDays: [3, 4, 5, 6, 7, 14, 15, 16, 17, 18] },
      { month: 10, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { month: 11, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    ],
    references: [
      { label: "Shotlist.pdf", type: "file" },
      { label: "Drive folder", href: "https://drive.google.com", type: "link" },
    ],
    location: "Dubai Design District, location1",
    supportingFileLabel: "Supporting file attached",
    applyBefore: "28 Oct, 2025",
  },
  {
    id: "3",
    slug: "production-assistants-needed",
    title: "Production Assistants Needed",
    postedOn: "18 Oct, 2025",
    postedBy: {
      name: "Michael Molar",
      avatar: "/image (2).png",
    },
    description: "Description of the GIG will be here abcdefghij .......",
    qualifyingCriteria: "This is where the qualifying criteria value comes....",
    budgetLabel: " 15000",
    dateWindows: [
      { label: "Sep 2025", range: "12, 15, 16-25" },
      { label: "Oct 2025", range: "1-30" },
    ],
    calendarMonths: [
      { month: 8, year: 2025, highlightedDays: [1, 8, 9, 10, 11, 12, 19, 20] },
      { month: 9, year: 2025, highlightedDays: [2, 3, 4, 5, 6, 25, 26, 27] },
      { month: 10, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7, 8] },
      { month: 11, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7, 8] },
    ],
    references: [
      { label: "Production brief.pdf", type: "file" },
      { label: "Reference deck", href: "https://www.behance.net", type: "link" },
    ],
    location: "Dubai Design District, location1",
    supportingFileLabel: "Supporting file attached",
    applyBefore: "30 Oct, 2025",
  },
  {
    id: "4",
    slug: "location-scouts-required",
    title: "Location Scouts Required",
    postedOn: "18 Oct, 2025",
    postedBy: {
      name: "Michael Molar",
      avatar: "/image (2).png",
    },
    description: "Description of the GIG will be here abcdefghij .......",
    qualifyingCriteria: "This is where the qualifying criteria value comes....",
    budgetLabel: " 12000",
    dateWindows: [
      { label: "Sep 2025", range: "12, 15, 16-25" },
      { label: "Oct 2025", range: "1-30" },
    ],
    calendarMonths: [
      { month: 8, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7, 8] },
      { month: 9, year: 2025, highlightedDays: [2, 5, 6, 7, 8, 13, 14, 15] },
      { month: 10, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7] },
      { month: 11, year: 2025, highlightedDays: [1, 2, 3, 4, 5, 6, 7] },
    ],
    references: [
      { label: "Location brief.pdf", type: "file" },
      { label: "Sample location deck", href: "https://www.somewebsite.com/location", type: "link" },
    ],
    location: "Dubai Design District, location1",
    supportingFileLabel: "Supporting file attached",
    applyBefore: "15 Nov, 2025",
  }
];

const projectCardData: ProjectCardType[] = [
  {
    id: 1,
    name: "Project One",
    banner: "/default-banner.png",
    image: "/default-profile.png",
    bio: "Behind-the-scenes documentary capturing the energy and creativity of Dubai Fashion Week 2024. We need a skilled team to document designers, models, and the fashion industry magic.",
    location: "New York, NY",
    skills: ["React", "Node.js", "GraphQL"],
  },
  {
    id: 2,
    name: "Project Two",
    banner: "/default-banner.png",
    image: "/default-profile.png",
    bio: "This is a brief description of Project Two.",
    location: "Los Angeles, CA",
    skills: ["Vue.js", "Firebase", "TypeScript"],
  },
  {
    id: 3,
    name: "Project Three",
    banner: "/default-banner.png",
    image: "/default-profile.png",
    bio: "This is a brief description of Project Three.",
    location: "Chicago, IL",
    skills: ["Angular", "Express", "MongoDB"],
  },
];

export { profileData, gigsData, projectCardData };

export type ProfileDataType = typeof profileData;
export type GigsDataType = typeof gigsData;
