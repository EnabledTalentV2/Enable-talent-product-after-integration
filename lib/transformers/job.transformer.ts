import type { BackendJob, JobFormValues, BackendJobPayload } from "@/lib/schemas/job.schema";
import type { EmployerJob } from "@/lib/employerJobsTypes";
import {
  tryFields,
  toString,
  employmentTypeMapper,
  workArrangementMapper,
  jobStatusMapper,
  parseSalary,
  isRecord,
  extractArray,
} from "./fieldMappers";

/**
 * Transform backend job to frontend format
 */
export const transformJobFromBackend = (raw: BackendJob): EmployerJob => {
  // Extract ID
  const id = String(raw.id);

  // Extract title
  const title = raw.title || "";

  // Extract company from organization object or direct field
  let company = "";
  if (raw.organization) {
    company = raw.organization.name;
  }
  if (!company) {
    company = toString(tryFields(raw, "company_name", "company"));
  }

  // Extract location and address
  const location = toString(raw.location);
  const address = toString(raw.address);

  // Extract experience
  const experience = toString(tryFields(raw, "experience", "experience_required"));

  // Transform employment type (handles multiple field names and formats)
  const rawEmploymentType = tryFields(raw, "job_type", "employment_type", "employmentType");
  const employmentType = employmentTypeMapper.toFrontend(rawEmploymentType);

  // Transform work arrangement (handles multiple field names and formats)
  const rawWorkArrangement = tryFields(raw, "workplace_type", "work_arrangement", "workArrangement");
  const workArrangement = workArrangementMapper.toFrontend(rawWorkArrangement);

  // Extract description (handles multiple field names)
  const description = toString(tryFields(raw, "job_desc", "description", "job_description"));

  // Extract requirements
  const requirements = toString(raw.requirements);

  // Extract salary
  const rawSalary = tryFields(raw, "estimated_salary", "salary", "salary_range");
  const salary = toString(rawSalary);

  // Extract status
  const rawStatus = tryFields(raw, "status", "is_active");
  const status = jobStatusMapper.toFrontend(rawStatus);

  // Extract posted date
  const postedAt = toString(tryFields(raw, "created_at", "posted_at", "postedAt")) || new Date().toISOString();

  // Extract skills - backend returns array of {id, name} objects
  const skills: string[] = [];
  if (Array.isArray(raw.skills)) {
    raw.skills.forEach((skill: any) => {
      if (typeof skill === "string") {
        skills.push(skill);
      } else if (skill && typeof skill.name === "string") {
        skills.push(skill.name);
      }
    });
  }

  // Extract visa required
  const visaRequired = Boolean(raw.visa_required);

  // Extract ranking data
  const rankingStatus = toString(raw.ranking_status);
  const candidateRankingData = raw.candidate_ranking_data;

  // Extract user info
  const user = raw.user ? {
    id: raw.user.id,
    first_name: raw.user.first_name,
    last_name: raw.user.last_name,
    email: raw.user.email,
    is_verified: raw.user.is_verified,
    is_candidate: raw.user.is_candidate,
  } : undefined;

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
    status,
    postedAt,
    skills,
    visaRequired,
    rankingStatus,
    candidateRankingData,
    user,
  };
};

/**
 * Transform frontend form values to backend payload
 */
export const transformJobToBackend = (values: JobFormValues): BackendJobPayload => {
  // Use description as the job_desc field
  const jobDesc = (values.description ?? "").replace(/\r\n/g, "\n");

  // Parse salary to number
  const salaryNum = parseSalary(values.salary);

  // Extract skills array (filter out empty strings)
  const skills = (values.skills || []).filter(skill => skill.trim().length > 0);

  const payload: BackendJobPayload = {
    title: values.title,
    job_desc: jobDesc,
    workplace_type: workArrangementMapper.toBackend(values.workArrangement),
    location: values.location,
    job_type: employmentTypeMapper.toBackend(values.employmentType),
    estimated_salary: salaryNum,
    visa_required: false, // Default value
  };

  // NOTE: Skills are temporarily disabled until we implement skill ID mapping
  // The backend expects skill IDs (numbers), not skill names (strings)
  // TODO:
  // 1. Create GET /api/skills endpoint to fetch available skills
  // 2. Map skill names to IDs before sending to backend
  // 3. Uncomment the code below once skill ID mapping is implemented

  // Only include skills if there are any
  // if (skills.length > 0) {
  //   payload.skills = skills;
  // }

  return payload;
};

/**
 * Transform array of backend jobs to frontend format
 * Handles various response wrapper formats
 */
export const transformJobsArray = (payload: unknown): EmployerJob[] => {
  // Extract array from various wrapper formats
  const jobs = extractArray<BackendJob>(payload, ["results", "jobs", "data", "job_posts"]);

  // Transform each job
  return jobs
    .filter(isRecord)
    .map(transformJobFromBackend)
    .filter((job): job is EmployerJob => job !== null && job.id !== "");
};

/**
 * Transform EmployerJob to JobFormValues for editing
 */
export const transformJobToFormValues = (job: EmployerJob): JobFormValues => {
  return {
    title: job.title,
    location: job.location,
    employmentType: job.employmentType,
    workArrangement: job.workArrangement,
    description: job.description,
    requirements: job.requirements || "",
    salary: job.salary || "",
    skills: job.skills || [],
  };
};
