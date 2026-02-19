import type { EmployerJob, JobFormValues } from "@/lib/employerJobsTypes";

export type JobStats = {
  accepted: number;
  declined: number;
  requestsSent: number;
  matchingCandidates: number;
};

// Frontend to Backend field mappings for job creation
// Backend expects numeric IDs for choice fields
const EMPLOYMENT_TYPE_TO_BACKEND: Record<string, number> = {
  "Full time": 1,
  "Part time": 2,
  "Contract": 3,
  "Internship": 4,
  "Hourly based": 3, // Map to Contract
};

const WORK_ARRANGEMENT_TO_BACKEND: Record<string, number> = {
  "Remote": 1,
  "Onsite": 2,
  "Hybrid": 3,
};

export const toBackendJobPayload = (values: JobFormValues) => {
  // Use description as the job_desc field
  const jobDesc = (values.description ?? "").replace(/\r\n/g, "\n");

  // Parse salary to number if possible, otherwise send as is
  let salaryValue: number | string = values.salary;
  const salaryNum = parseFloat(values.salary.replace(/[^0-9.]/g, ""));
  if (!isNaN(salaryNum)) {
    salaryValue = salaryNum;
  }

  // Extract skills array (filter out empty strings)
  const skills = (values.skills || []).filter(skill => skill.trim().length > 0);

  return {
    title: values.title,
    job_desc: jobDesc,
    workplace_type: WORK_ARRANGEMENT_TO_BACKEND[values.workArrangement] || 1,
    location: values.location,
    job_type: EMPLOYMENT_TYPE_TO_BACKEND[values.employmentType] || 1,
    estimated_salary: salaryValue,
    visa_required: false, // Default value, not collected in form
    skills: skills,
  };
};

// Backend choice field mappings for status only
const STATUS_LABELS: Record<string, string> = {
  "1": "Active",
  "2": "Closed",
  "3": "Draft",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const normalizeChoice = (
  value: unknown,
  choices: Record<string, string>
): string => {
  const raw = toStringValue(value).trim();
  if (!raw) return "";
  return choices[raw] ?? raw;
};

const parseJobFromBackend = (
  record: Record<string, unknown>
): EmployerJob | null => {
  const id = toStringValue(record.id ?? record.job_id);
  if (!id) return null;

  const title = toStringValue(record.title ?? record.job_title);

  // Extract company from organization object or fallback
  let company = "";
  if (isRecord(record.organization)) {
    company = toStringValue(record.organization.name);
  }
  if (!company) {
    company = toStringValue(record.company_name ?? record.company);
  }

  const location = toStringValue(record.location);
  const address = toStringValue(record.address);
  const experience = toStringValue(record.experience);

  // Handle both job_type (backend response) and employment_type (alternative)
  // Backend can return numeric (1, 2, 3, 4) or string ("full-time", "Full-time", "Full time")
  const rawEmploymentType = record.job_type ?? record.employment_type ?? record.employmentType;
  let employmentType = "";
  if (typeof rawEmploymentType === "number") {
    // Convert numeric to frontend format
    const typeMap: Record<number, string> = {
      1: "Full time",
      2: "Part time",
      3: "Contract",
      4: "Internship",
    };
    employmentType = typeMap[rawEmploymentType] || "";
  } else {
    // Convert string to frontend format
    const typeStr = toStringValue(rawEmploymentType);
    if (typeStr === "full-time" || typeStr === "Full-time") employmentType = "Full time";
    else if (typeStr === "part-time" || typeStr === "Part-time") employmentType = "Part time";
    else if (typeStr === "contract" || typeStr === "Contract") employmentType = "Contract";
    else if (typeStr === "internship" || typeStr === "Internship") employmentType = "Internship";
    else employmentType = typeStr;
  }

  // Handle both workplace_type (backend response) and work_arrangement (alternative)
  // Backend can return numeric (1, 2, 3) or string ("remote", "Remote", etc.)
  const rawWorkArrangement = record.workplace_type ?? record.work_arrangement ?? record.workArrangement;
  let workArrangement = "";
  if (typeof rawWorkArrangement === "number") {
    // Convert numeric to frontend format
    const arrangeMap: Record<number, string> = {
      1: "Remote",
      2: "Onsite",
      3: "Hybrid",
    };
    workArrangement = arrangeMap[rawWorkArrangement] || "";
  } else {
    // Convert string to frontend format
    const arrangeStr = toStringValue(rawWorkArrangement);
    if (arrangeStr === "remote" || arrangeStr === "Remote") workArrangement = "Remote";
    else if (arrangeStr === "onsite" || arrangeStr === "Onsite") workArrangement = "Onsite";
    else if (arrangeStr === "hybrid" || arrangeStr === "Hybrid") workArrangement = "Hybrid";
    else workArrangement = arrangeStr;
  }

  // Handle both job_desc (backend response) and description/job_description (alternatives)
  const description = toStringValue(
    record.job_desc ?? record.job_description ?? record.description
  );
  const requirements = toStringValue(record.requirements);

  // Handle both estimated_salary (backend response) and salary_range/salary (alternatives)
  const salary = toStringValue(
    record.estimated_salary ?? record.salary_range ?? record.salary
  );
  const postedAt = toStringValue(record.created_at ?? record.postedAt);
  const status = normalizeChoice(record.status, STATUS_LABELS) as
    | "Active"
    | "Closed"
    | "Draft";

  // Extract skills - backend returns array of {id, name} objects
  const skills: string[] = [];
  if (Array.isArray(record.skills)) {
    record.skills.forEach((skill: unknown) => {
      if (typeof skill === "string") {
        skills.push(skill);
      } else if (isRecord(skill) && typeof skill.name === "string") {
        skills.push(skill.name);
      }
    });
  }

  return {
    id,
    title,
    company,
    location,
    address,
    experience,
    employmentType,
    workArrangement,
    description,
    requirements,
    salary,
    status: status || "Active",
    postedAt: postedAt || new Date().toISOString(),
    skills,
  };
};

export const parseJobsArray = (payload: unknown): EmployerJob[] => {
  // Handle array directly
  if (Array.isArray(payload)) {
    return payload
      .filter(isRecord)
      .map(parseJobFromBackend)
      .filter((job): job is EmployerJob => job !== null);
  }

  // Handle single job object (e.g., POST response returning one job)
  if (isRecord(payload) && typeof payload.id === "number") {
    const job = parseJobFromBackend(payload);
    return job ? [job] : [];
  }

  // Handle wrapped in object (e.g., { results: [...] })
  if (isRecord(payload)) {
    const candidates = [
      payload.results,
      payload.jobs,
      payload.data,
      payload.job_posts,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate
          .filter(isRecord)
          .map(parseJobFromBackend)
          .filter((job): job is EmployerJob => job !== null);
      }
    }
  }

  return [];
};

export const emptyJobStats = (): JobStats => ({
  accepted: 0,
  declined: 0,
  requestsSent: 0,
  matchingCandidates: 0,
});

const stripBullet = (value: string) =>
  value.replace(/^\s*[-*]\s?/, "").trim();

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map(stripBullet)
    .filter(Boolean);

export const formatPostedTime = (postedAt: string) => {
  const timestamp = Date.parse(postedAt);
  if (Number.isNaN(timestamp)) return "just now";

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hrs ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

export const formatExperienceLabel = (experience: string) => {
  if (!experience) return "Exp: N/A";
  if (/exp:/i.test(experience)) return experience;
  return `Exp: ${experience} Years`;
};

export const toListedJob = (job: EmployerJob) => {
  const stats = emptyJobStats();
  return {
    id: job.id,
    role: job.title,
    company: job.company,
    location: job.location,
    type: job.employmentType,
    experience: formatExperienceLabel(job.experience),
    postedTime: formatPostedTime(job.postedAt),
    status: job.status,
    stats: {
      accepted: stats.accepted,
      declined: stats.declined,
      matching: stats.matchingCandidates,
    },
  };
};

export const toJobDetail = (job: EmployerJob) => {
  const stats = emptyJobStats();
  const descriptionText = job.description || "";
  const requirementLines = splitLines(job.requirements);

  return {
    id: job.id,
    role: job.title,
    company: job.company,
    location: job.location,
    type: job.employmentType,
    workMode: job.workArrangement,
    experience: job.experience,
    salary: job.salary,
    about: descriptionText || "No description provided.",
    requirements: requirementLines,
    stats: {
      accepted: stats.accepted,
      declined: stats.declined,
      requests: stats.requestsSent,
      matching: stats.matchingCandidates,
    },
  };
};

export const toJobHeaderInfo = (job: EmployerJob) => ({
  title: job.title,
  company: job.company,
  location: job.location,
  postedTime: formatPostedTime(job.postedAt),
  status: job.status,
});

export const toJobFormValues = (job: EmployerJob): JobFormValues => ({
  title: job.title || "",
  location: job.location || "",
  employmentType: job.employmentType || "",
  workArrangement: job.workArrangement || "",
  description: job.description || "",
  requirements: job.requirements || "",
  salary: job.salary || "",
  skills: job.skills || [],
});
