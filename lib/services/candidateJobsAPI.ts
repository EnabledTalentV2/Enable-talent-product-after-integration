import { apiRequest } from "@/lib/api-client";
import type { EmployerJob } from "@/lib/employerJobsTypes";
import { BackendJobsResponseSchema } from "@/lib/schemas/job.schema";
import { transformJobsArray } from "@/lib/transformers/job.transformer";

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
};
