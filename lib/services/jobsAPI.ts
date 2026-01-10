import { apiRequest } from "@/lib/api-client";
import type { JobFormValues } from "@/lib/schemas/job.schema";
import type { EmployerJob } from "@/lib/employerJobsTypes";
import { BackendJobsResponseSchema, BackendJobSchema } from "@/lib/schemas/job.schema";
import {
  transformJobsArray,
  transformJobFromBackend,
  transformJobToBackend,
} from "@/lib/transformers/job.transformer";

/**
 * Centralized Jobs API Service
 * Single source of truth for all job-related API operations
 */
export const jobsAPI = {
  /**
   * Fetch all jobs for the current organization
   */
  list: async (): Promise<EmployerJob[]> => {
    try {
      // Fetch raw data from backend
      const raw = await apiRequest<unknown>("/api/jobs", {
        method: "GET",
      });

      // Validate response structure with Zod
      const validated = BackendJobsResponseSchema.parse(raw);

      // Transform to frontend format
      return transformJobsArray(validated);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      throw error;
    }
  },

  /**
   * Fetch a single job by ID
   */
  get: async (id: string | number): Promise<EmployerJob> => {
    try {
      const raw = await apiRequest<unknown>(`/api/jobs/${id}`, {
        method: "GET",
      });

      // Validate response structure with Zod
      const validated = BackendJobSchema.parse(raw);

      // Transform single job
      return transformJobFromBackend(validated);
    } catch (error) {
      console.error(`Failed to fetch job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new job posting
   */
  create: async (values: JobFormValues): Promise<EmployerJob> => {
    try {
      // Transform form values to backend payload
      const payload = transformJobToBackend(values);

      // Send to backend
      const raw = await apiRequest<unknown>("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Validate response structure with Zod
      const validated = BackendJobSchema.parse(raw);

      // Transform response back to frontend format
      return transformJobFromBackend(validated);
    } catch (error) {
      console.error("Failed to create job:", error);
      throw error;
    }
  },

  /**
   * Update an existing job posting
   */
  update: async (
    id: string | number,
    values: JobFormValues
  ): Promise<EmployerJob> => {
    try {
      // Transform form values to backend payload
      const payload = transformJobToBackend(values);

      // Send PATCH request to backend
      const raw = await apiRequest<unknown>(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Validate response structure with Zod
      const validated = BackendJobSchema.parse(raw);

      // Transform response back to frontend format
      return transformJobFromBackend(validated);
    } catch (error) {
      console.error(`Failed to update job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a job posting
   */
  delete: async (id: string | number): Promise<void> => {
    try {
      await apiRequest<unknown>(`/api/jobs/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Failed to delete job ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get job statistics (candidates, invites, etc.)
   * TODO: Implement when backend endpoint is available
   */
  getStats: async (id: string | number) => {
    try {
      const raw = await apiRequest<unknown>(`/api/jobs/${id}/stats`, {
        method: "GET",
      });
      return raw;
    } catch (error) {
      console.error(`Failed to fetch job stats for ${id}:`, error);
      // Return empty stats for now
      return {
        accepted: 0,
        declined: 0,
        requestsSent: 0,
        matchingCandidates: 0,
      };
    }
  },
};
