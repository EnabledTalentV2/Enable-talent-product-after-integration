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
};

export type EmployerJob = JobFormValues & {
  id: string | number; // Support both string (frontend-generated) and number (backend)
  status: "Active" | "Closed" | "Draft";
  postedAt: string;
};
