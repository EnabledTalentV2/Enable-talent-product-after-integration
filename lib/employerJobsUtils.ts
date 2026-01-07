import type { EmployerJob, JobFormValues } from "@/lib/employerJobsTypes";

export type JobStats = {
  accepted: number;
  declined: number;
  requestsSent: number;
  matchingCandidates: number;
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
  const descriptionLines = splitLines(job.description);
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
    about: job.description || "No description provided.",
    description: descriptionLines,
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
  company: job.company || "",
  location: job.location || "",
  address: job.address || "",
  experience: job.experience || "",
  employmentType: job.employmentType || "",
  workArrangement: job.workArrangement || "",
  preferredLanguage: job.preferredLanguage || "",
  urgentHiring: job.urgentHiring || "",
  description: job.description || "",
  requirements: job.requirements || "",
  salary: job.salary || "",
});
