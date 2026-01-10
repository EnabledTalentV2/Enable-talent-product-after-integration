export type JobFormValues = {
  title: string;
  company: string;
  location: string;
  address: string;
  experience: string;
  employmentType: string;
  workArrangement: string;
  preferredLanguage: string;
  urgentHiring: string;
  description: string;
  requirements: string;
  salary: string;
  skills?: string[]; // Array of skill names
};

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
  is_candidate: boolean;
};

export type EmployerJob = JobFormValues & {
  id: string | number; // Support both string (frontend-generated) and number (backend)
  status: "Active" | "Closed" | "Draft";
  postedAt: string;
  visaRequired?: boolean;
  rankingStatus?: string;
  candidateRankingData?: any;
  user?: User;
};
