import type { UserData } from "@/components/signup/types";

export const initialUserData: UserData = {
  basicInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    citizenshipStatus: "",
    gender: "",
    ethnicity: "",
    socialProfile: "",
    linkedinUrl: "",
    currentStatus: "",
    profilePhoto: "",
  },
  education: {
    courseName: "",
    major: "",
    institution: "",
    graduationDate: "",
  },
  workExperience: {
    experienceType: "fresher",
    entries: [],
  },
  skills: {
    skills: "",
    primaryList: [],
  },
  projects: {
    noProjects: false,
    entries: [],
  },
  achievements: {
    entries: [],
  },
  certification: {
    noCertification: false,
    entries: [],
  },
  preference: {
    companySize: [],
    jobType: [],
    jobSearch: [],
  },
  otherDetails: {
    languages: [{ language: "", speaking: "", reading: "", writing: "" }],
    careerStage: "",
    availability: "",
    desiredSalary: "",
  },
  reviewAgree: { agree: false, discover: "", comments: "" },
};
