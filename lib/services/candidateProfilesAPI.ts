import { apiRequest } from "@/lib/api-client";
import type { CandidateProfile, CandidateListItem } from "@/lib/types/candidateProfile";
import { transformCandidateProfiles } from "@/lib/transformers/candidateProfile.transformer";

/**
 * Candidate Profiles API Service
 * For employers to browse and manage candidate profiles
 */
export const candidateProfilesAPI = {
  /**
   * Fetch all candidate profiles
   */
  list: async (): Promise<CandidateProfile[]> => {
    try {
      const response = await apiRequest<unknown>("/api/candidates", {
        method: "GET",
      });

      // Handle both paginated response and flat array
      let rawProfiles: unknown[];
      if (Array.isArray(response)) {
        rawProfiles = response;
      } else if (
        response &&
        typeof response === "object" &&
        "results" in response &&
        Array.isArray((response as { results: unknown[] }).results)
      ) {
        // Paginated response from Django REST Framework
        rawProfiles = (response as { results: unknown[] }).results;
      } else {
        console.error("[candidateProfilesAPI] Unexpected response format:", response);
        rawProfiles = [];
      }

      // Filter out any profiles that don't have the expected structure (id and slug are required)
      const validProfiles = rawProfiles.filter(
        (profile): profile is { id: number | string; slug: string } =>
          profile !== null &&
          typeof profile === "object" &&
          "id" in profile &&
          "slug" in profile
      );

      // Transform backend response to frontend format
      const profiles = transformCandidateProfiles(validProfiles as any[]);
      return profiles;
    } catch (error) {
      console.error("Failed to fetch candidate profiles:", error);
      throw error;
    }
  },

  /**
   * Fetch a single candidate profile by slug
   */
  get: async (slug: string): Promise<CandidateProfile> => {
    try {
      const response = await apiRequest<unknown>(`/api/candidates/${slug}`, {
        method: "GET",
      });

      // Transform backend response to frontend format
      const { transformCandidateProfile } = await import(
        "@/lib/transformers/candidateProfile.transformer"
      );
      return transformCandidateProfile(response as any);
    } catch (error) {
      console.error(`Failed to fetch candidate profile ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Search candidates with AI
   * TODO: Implement when needed
   */
  search: async (query: string): Promise<CandidateProfile[]> => {
    try {
      const response = await apiRequest<{ candidates: CandidateProfile[] }>(
        "/api/candidates/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      return response.candidates;
    } catch (error) {
      console.error("Failed to search candidates:", error);
      throw error;
    }
  },
};
