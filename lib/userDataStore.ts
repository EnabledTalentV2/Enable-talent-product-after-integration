'use client';

import { create } from "zustand";
import type { UserData } from "@/components/signup/types";

export const initialUserData: UserData = {
  basicInfo: {
    firstName: "Jenny",
    lastName: "",
    email: "",
    phone: "(229) 555-0109",
    location: "Allentown, New Mexico 31134",
    citizenshipStatus: "Canadian",
    gender: "Female",
    ethnicity: "South Asian",
    socialProfile: "Jennywilson.com",
    linkedinUrl: "www.linkedin.com/jennywilson",
    currentStatus: "Newly graduated student interested in working with employers in Brampton",
    profilePhoto: "",
  },
  education: {
    courseName: "",
    major: "Design methodologies, Aesthetics, Visual communication, Technical specification...",
    institution: "York University",
    graduationDate: "",
  },
  workExperience: {
    experienceType: "experienced",
    entries: [
      {
        company: "tiktok",
        role: "Sr UX designer",
        from: "",
        to: "2025-01-21",
        current: false,
        description: [
          "- Collaborated with cross-functional teams including product managers, engineers, and marketers to understand business goals and user needs.",
          "- Conducted user research through interviews, surveys, and usability testing to inform design decisions.",
          "- Created wireframes, prototypes, and user flows to communicate design ideas and facilitate feedback.",
          "- Designed intuitive and elegant user interfaces for web and mobile applications, adhering to design principles and best practices.",
          "- Implemented responsive design techniques to ensure a seamless user experience across devices.",
        ].join("\n"),
      },
    ],
  },
  skills: {
    skills: "",
    primaryList: [
      "UX Design",
      "UX Research",
      "Usability Principles",
      "Information Architecture",
      "Wireframing And Prototyping",
      "Design Systems Governance",
      "Agile Methodologies",
    ],
  },
  projects: {
    entries: [
      {
        projectName: "UST Global",
        projectDescription: "Sr UX designer",
        current: false,
        from: "",
        to: "2025-01-21",
      },
    ],
  },
  achievements: {
    entries: [
      {
        title: "Spot Award",
        issueDate: "2022",
        description: "Received Spot Award in recognition of outstanding performance and contributions to Amazon Projectx",
      },
    ],
  },
  certification: {
    noCertification: false,
    entries: [
      {
        name: "Design Thinking for Innovation",
        issueDate: "Aug 2021",
        organization: "University of Virginia",
        credentialIdUrl: "",
      },
    ],
  },
  preference: {
    companySize: ["10 - 100"],
    jobType: ["Full time"],
    jobSearch: ["Ready for Interviews"],
  },
  otherDetails: {
    languages: [
      { language: "English", speaking: "Proficient", reading: "Basic", writing: "Proficient" },
      { language: "French", speaking: "Proficient", reading: "Basic", writing: "Proficient" },
    ],
    careerStage: "Mid career professional (<10 years)",
    availability: "",
    desiredSalary: "80000-90000",
  },
  reviewAgree: { agree: false, discover: "LinkedIn", comments: "" },
};

type UserDataStore = {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  patchUserData: (patch: Partial<UserData>) => void;
};

export const useUserDataStore = create<UserDataStore>((set) => ({
  userData: initialUserData,
  setUserData: (updater) => set((state) => ({ userData: updater(state.userData) })),
  patchUserData: (patch) => set((state) => ({ userData: { ...state.userData, ...patch } })),
}));
