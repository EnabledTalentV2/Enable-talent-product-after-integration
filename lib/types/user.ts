export type StepStatus = "pending" | "completed" | "error";

export type StepKey =
  | "basicInfo"
  | "education"
  | "workExperience"
  | "skills"
  | "projects"
  | "achievements"
  | "certification"
  | "preference"
  | "otherDetails"
  | "accessibilityNeeds"
  | "reviewAgree";

export type Step = {
  id: number;
  label: string;
  key: StepKey;
  status: StepStatus;
  errorText?: string;
  isActive?: boolean;
};

export type UserData = {
  basicInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    citizenshipStatus: string;
    gender: string;
    ethnicity: string;
    socialProfile: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    currentStatus: string;
    profilePhoto?: string;
  };
  education: {
    courseName: string;
    major: string;
    institution: string;
    graduationDate: string;
    grade: string;
    from: string;
    to: string;
  };
  workExperience: {
    experienceType: "experienced" | "fresher";
    entries: Array<{
      company: string;
      role: string;
      from: string;
      to: string;
      current?: boolean;
      description: string;
    }>;
  };
  skills: { skills: string; primaryList?: string[] };
  projects: {
    noProjects: boolean;
    entries: Array<{
      projectName: string;
      projectDescription: string;
      current: boolean;
      from: string;
      to: string;
    }>;
  };
  achievements: {
    entries: Array<{
      title: string;
      issueDate: string;
      description: string;
    }>;
  };
  certification: {
    noCertification: boolean;
    entries: Array<{
      name: string;
      issueDate: string;
      organization: string;
      credentialIdUrl: string;
    }>;
  };
  preference: {
    companySize: string[];
    jobType: string[];
    jobSearch: string[];
  };
  otherDetails: {
    languages: Array<{
      language: string;
      speaking: string;
      reading: string;
      writing: string;
    }>;
    careerStage: string;
    availability: string;
    desiredSalary: string;
  };
  reviewAgree: { agree: boolean; discover: string; comments: string };
  accessibilityNeeds?: {
    categories: string[];
    accommodationNeed: string;
    disclosurePreference: string;
    accommodations: string[];
  };
};
