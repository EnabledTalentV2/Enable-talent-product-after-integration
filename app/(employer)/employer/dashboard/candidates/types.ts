export type CandidateStatus =
  | "Active"
  | "Inactive"
  | "Accepted"
  | "Declined"
  | "Request Sent"
  | "Matching";

export type CandidateStage =
  | "accepted"
  | "declined"
  | "request_sent"
  | "matching";

export interface Candidate {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  matchPercentage: number;
  status: CandidateStatus;
  stage: CandidateStage;
  avatarUrl?: string;
  isBestMatch?: boolean;
}

export interface CandidateProfile extends Candidate {
  about: string;
  culturalInterest: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  workExperience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
  }[];
  achievements: string[];
  certifications: string[];
  preferences: string[];
  otherDetails: string[];
}

export interface JobStats {
  accepted: number;
  declined: number;
  requestsSent: number;
  matchingCandidates: number;
}

export interface JobInfo {
  title: string;
  company: string;
  location: string;
  postedTime: string;
  status: "Active" | "Closed" | "Draft";
}
