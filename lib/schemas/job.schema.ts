import { z } from "zod";

/**
 * Backend Job Schema
 * Validates and transforms raw backend job responses
 * Handles multiple field name variants and type inconsistencies
 */
export const BackendJobSchema = z.object({
  // ID can be string or number from backend
  id: z.union([z.string(), z.number()]).transform(String),

  // Title is required
  title: z.string(),

  // Job description - multiple possible field names
  job_desc: z.string().optional(),
  description: z.string().optional(),
  job_description: z.string().optional(),

  // Job type/employment type - can be number (1,2,3,4) or string
  job_type: z.union([z.number(), z.string()]).optional(),
  employment_type: z.union([z.number(), z.string()]).optional(),
  employmentType: z.union([z.number(), z.string()]).optional(),

  // Workplace/work arrangement - can be number (1,2,3) or string
  workplace_type: z.union([z.number(), z.string()]).optional(),
  work_arrangement: z.union([z.number(), z.string()]).optional(),
  workArrangement: z.union([z.number(), z.string()]).optional(),

  // Location
  location: z.string().optional(),
  address: z.string().optional(),

  // Experience
  experience: z.string().optional(),
  experience_required: z.string().optional(),

  // Salary
  estimated_salary: z.union([z.number(), z.string()]).optional(),
  salary: z.union([z.number(), z.string()]).optional(),

  // Language
  preferred_language: z.string().optional(),
  language: z.string().optional(),

  // Requirements and description split
  requirements: z.string().optional(),

  // Urgent hiring
  is_urgent: z.boolean().optional(),
  urgent_hiring: z.union([z.boolean(), z.string()]).optional(),

  // Status - can be number or string
  status: z.union([z.number(), z.string()]).optional(),
  is_active: z.boolean().optional(),

  // Organization/company info
  organization: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  company: z.string().optional(),
  company_name: z.string().optional(),

  // Timestamps
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  posted_at: z.string().optional(),
  postedAt: z.string().optional(),

  // Stats (if included)
  accepted_count: z.number().optional(),
  declined_count: z.number().optional(),
  matching_candidates_count: z.number().optional(),

  // Skills - backend returns array of objects with id and name
  skills: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
  visa_required: z.boolean().optional(),

  // User who created the job
  user: z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    is_verified: z.boolean(),
    is_candidate: z.boolean(),
  }).optional(),

  // Ranking data
  candidate_ranking_data: z.any().optional(),
  ranking_status: z.string().optional(),
  ranking_task_id: z.string().nullable().optional(),
});

/**
 * Backend response can be:
 * - Array of jobs
 * - Object with results/jobs/data/job_posts array
 */
export const BackendJobsResponseSchema = z.union([
  z.array(BackendJobSchema),
  z.object({
    results: z.array(BackendJobSchema),
  }),
  z.object({
    jobs: z.array(BackendJobSchema),
  }),
  z.object({
    data: z.array(BackendJobSchema),
  }),
  z.object({
    job_posts: z.array(BackendJobSchema),
  }),
]);

/**
 * Frontend Job Form Values
 * Used for creating and editing jobs
 */
export const JobFormValuesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  workArrangement: z.string().min(1, "Work arrangement is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional().default(""),
  salary: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
});

/**
 * Backend Job Payload
 * What we send to the backend when creating/updating
 */
export const BackendJobPayloadSchema = z.object({
  title: z.string(),
  job_desc: z.string(),
  workplace_type: z.number().int().min(1).max(3),
  location: z.string(),
  job_type: z.number().int().min(1).max(4),
  estimated_salary: z.number().optional(),
  visa_required: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

/**
 * Type exports - auto-generated from schemas
 */
export type BackendJob = z.infer<typeof BackendJobSchema>;
export type BackendJobsResponse = z.infer<typeof BackendJobsResponseSchema>;
export type JobFormValues = z.infer<typeof JobFormValuesSchema>;
export type BackendJobPayload = z.infer<typeof BackendJobPayloadSchema>;
