import { CandidateProfile } from "./candidates/types";

// Define Candidates (Linked to Jobs via jobId)
export const MOCK_CANDIDATES: (CandidateProfile & { jobId: string })[] = [
  {
    id: "1",
    jobId: "ui-ux-designer", // Linked to UI/UX Designer
    name: "Nalley Heather D.",
    role: "Website Developer",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 97,
    status: "Active",
    stage: "matching",
    isBestMatch: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about:
      "I'm Nalley, a Product & User Experience Designer passionate about building products and services that solve real-world problems. My work has enabled me to gather a wide range of experiences, including leading, managing, and building multi-disciplinary design teams, and defining vision and designing products, services, brand identity, digital ad campaigns, and interactive design for various emerging platforms.",
    culturalInterest: ["Collaborative", "Innovative", "Fast-paced"],
    education: [
      {
        degree: "Master of Design",
        institution: "University of California",
        year: "2018 - 2020",
      },
      {
        degree: "Bachelor of Arts",
        institution: "University of California",
        year: "2014 - 2018",
      },
    ],
    workExperience: [
      {
        role: "Senior Product Designer",
        company: "Google",
        duration: "2020 - Present",
        description:
          "Leading the design of the new Google Pay app. Responsible for the end-to-end design process, from research to launch.",
      },
    ],
    skills: [
      "Figma",
      "Sketch",
      "Adobe XD",
      "Prototyping",
      "User Research",
      "Wireframing",
    ],
    projects: [
      {
        name: "E-commerce Redesign",
        description: "Redesigned the checkout flow for a major retailer.",
      },
    ],
    achievements: ["Best Design Award 2021", "Speaker at UX Conf 2022"],
    certifications: ["Google UX Design Certificate"],
    preferences: ["Remote", "Full-time"],
    otherDetails: ["Available immediately"],
  },
  {
    id: "2",
    jobId: "ui-ux-designer",
    name: "Jennifer Allison",
    role: "UX Designer",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 92,
    status: "Active",
    stage: "matching",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Passionate UX Designer with a focus on accessibility.",
    culturalInterest: ["Inclusive", "Diverse"],
    education: [],
    workExperience: [],
    skills: ["Figma", "Accessibility"],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "3",
    jobId: "ui-ux-designer",
    name: "Henry Creel",
    role: "Marketing Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 91,
    status: "Active",
    stage: "matching",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Data-driven marketing analyst.",
    culturalInterest: ["Data-driven"],
    education: [],
    workExperience: [],
    skills: ["Google Analytics", "SQL"],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "4",
    jobId: "ui-ux-designer",
    name: "Milley Arthur",
    role: "Data Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 82,
    status: "Active",
    stage: "accepted",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Experienced data analyst.",
    culturalInterest: [],
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "5",
    jobId: "software-engineer", // Linked to Software Engineer
    name: "John Doe",
    role: "Software Engineer",
    location: "San Francisco, CA",
    experience: "5 Yrs",
    matchPercentage: 75,
    status: "Declined",
    stage: "declined",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Full stack engineer.",
    culturalInterest: [],
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "6",
    jobId: "software-engineer",
    name: "Jane Smith",
    role: "Product Manager",
    location: "New York, NY",
    experience: "8 Yrs",
    matchPercentage: 88,
    status: "Request Sent",
    stage: "request_sent",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Product manager with a focus on growth.",
    culturalInterest: [],
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
];

// Helper to get stats for ANY job
export const getJobStats = (jobId: string) => {
  const jobCandidates = MOCK_CANDIDATES.filter((c) => c.jobId === jobId);

  return jobCandidates.reduce(
    (acc, candidate) => {
      switch (candidate.stage) {
        case "accepted":
          acc.accepted++;
          break;
        case "declined":
          acc.declined++;
          break;
        case "request_sent":
          acc.requestsSent++;
          break;
        case "matching":
          acc.matchingCandidates++;
          break;
      }
      return acc;
    },
    { accepted: 0, declined: 0, requestsSent: 0, matchingCandidates: 0 }
  );
};
