export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "rejected"
  | "accepted"
  | "hired"
  | "request_sent"
  | "invited";

export interface CandidateApplication {
  id: number;
  job: {
    id: number;
    title: string;
    location: string;
    job_type: string;
    organization: {
      id: number;
      name: string;
    };
  };
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

export interface BrowseJob {
  id: number;
  title: string;
  location: string;
  job_type: string;
  organization: {
    id: number;
    name: string;
  };
  description?: string;
  requirements?: string;
  salary_range?: string;
  created_at: string;
}

export type JobApplicationTab =
  | "All"
  | "Applied"
  | "Accepted"
  | "Rejected"
  | "Invites from employer";
