import { apiRequest } from "@/lib/api-client";
import type { EmployerJob } from "@/lib/employerJobsTypes";
import { BackendJobsResponseSchema } from "@/lib/schemas/job.schema";
import { transformJobsArray } from "@/lib/transformers/job.transformer";
import type { CandidateApplication } from "@/lib/types/candidate-applications";

/**
 * Candidate Jobs API Service
 * For candidates browsing and searching available jobs
 * Uses /api/channels/jobs/browse/ endpoint (NOT the employer endpoint)
 */
export const candidateJobsAPI = {
  /**
   * Browse all available jobs for candidates
   * Uses the candidate-specific browse endpoint
   */
  browse: async (): Promise<EmployerJob[]> => {
    try {
      // Fetch from candidate browse endpoint
      const raw = await apiRequest<unknown>("/api/jobs/browse", {
        method: "GET",
      });

      // Validate response structure with Zod
      const validated = BackendJobsResponseSchema.parse(raw);

      // Transform to frontend format
      return transformJobsArray(validated);
    } catch (error) {
      console.error("Failed to fetch job listings for candidate:", error);
      throw error;
    }
  },

  /**
   * Search jobs with filters
   * TODO: Implement when backend supports search parameters
   */
  search: async (query: string): Promise<EmployerJob[]> => {
    try {
      const raw = await apiRequest<unknown>(
        `/api/jobs/browse?search=${encodeURIComponent(query)}`,
        {
          method: "GET",
        }
      );

      const validated = BackendJobsResponseSchema.parse(raw);
      return transformJobsArray(validated);
    } catch (error) {
      console.error("Failed to search jobs:", error);
      throw error;
    }
  },

  /**
   * Apply to a job
   * Submits candidate application to a specific job posting
   */
  apply: async (jobId: string | number): Promise<{
    message: string;
    application_id: number;
    status: string;
  }> => {
    try {
      const response = await apiRequest<{
        message: string;
        application_id: number;
        status: string;
      }>(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      console.error(`Failed to apply to job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch candidate's job applications
   * Returns all applications submitted by the current candidate
   */
  fetchApplications: async (): Promise<CandidateApplication[]> => {
    try {
      const response = await apiRequest<CandidateApplication[]>(
        "/api/candidate/applications",
        {
          method: "GET",
        }
      );

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Failed to fetch candidate applications:", error);
      throw error;
    }
  },
};
