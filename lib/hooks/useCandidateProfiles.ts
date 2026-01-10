import { useQuery } from "@tanstack/react-query";
import { candidateProfilesAPI } from "@/lib/services/candidateProfilesAPI";

/**
 * React Query keys for candidate profile operations
 */
export const candidateProfilesKeys = {
  all: ["candidate-profiles"] as const,
  list: () => [...candidateProfilesKeys.all, "list"] as const,
  detail: (slug: string) => [...candidateProfilesKeys.all, "detail", slug] as const,
  search: (query: string) => [...candidateProfilesKeys.all, "search", query] as const,
};

/**
 * Hook to fetch all candidate profiles
 */
export function useCandidateProfiles() {
  return useQuery({
    queryKey: candidateProfilesKeys.list(),
    queryFn: candidateProfilesAPI.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single candidate profile
 */
export function useCandidateProfile(slug: string) {
  return useQuery({
    queryKey: candidateProfilesKeys.detail(slug),
    queryFn: () => candidateProfilesAPI.get(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to search candidates
 * TODO: Implement when needed
 */
export function useSearchCandidates(query: string) {
  return useQuery({
    queryKey: candidateProfilesKeys.search(query),
    queryFn: () => candidateProfilesAPI.search(query),
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000,
  });
}
