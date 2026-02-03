import { apiRequest } from "@/lib/api-client";
import type { CandidateInsight } from "@/lib/types/candidateInsight";

/**
 * Candidate Insight API Service
 * For employers to view AI-generated candidate insights
 */
export const candidateInsightsAPI = {
  /**
   * Fetch employer insight for a candidate by ID
   */
  get: async (candidateId: string | number): Promise<CandidateInsight> => {
    try {
      const safeId = encodeURIComponent(String(candidateId));
      const response = await apiRequest<CandidateInsight>(
        `/api/organization/test/candidate-insight/${safeId}`,
        {
          method: "GET",
        }
      );

      return response;
    } catch (error) {
      console.error(`Failed to fetch candidate insight ${candidateId}:`, error);
      throw error;
    }
  },
};
