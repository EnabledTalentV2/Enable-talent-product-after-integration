import type { UserData } from "@/lib/types/user";

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
    githubUrl: "",
    portfolioUrl: "",
    currentStatus: "",
    profilePhoto: "",
  },
  education: {
    courseName: "",
    major: "",
    institution: "",
    graduationDate: "",
    grade: "",
    from: "",
    to: "",
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
  accessibilityNeeds: {
    categories: [],
    accommodationNeed: "",
    disclosurePreference: "",
    accommodations: [],
  },
};
