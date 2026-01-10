import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateJobsAPI } from "@/lib/services/candidateJobsAPI";

/**
 * React Query keys for candidate job operations
 */
export const candidateJobsKeys = {
  all: ["candidate-jobs"] as const,
  browse: () => [...candidateJobsKeys.all, "browse"] as const,
  search: (query: string) => [...candidateJobsKeys.all, "search", query] as const,
};

/**
 * Hook to browse available jobs for candidates
 * Uses the candidate-specific browse endpoint
 */
export function useCandidateJobs() {
  return useQuery({
    queryKey: candidateJobsKeys.browse(),
    queryFn: candidateJobsAPI.browse,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to search jobs with a query
 * TODO: Implement when backend supports search
 */
export function useSearchCandidateJobs(query: string) {
  return useQuery({
    queryKey: candidateJobsKeys.search(query),
    queryFn: () => candidateJobsAPI.search(query),
    enabled: !!query.trim(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to apply to a job
 * Mutation that submits job application and invalidates queries
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string | number) => candidateJobsAPI.apply(jobId),
    onSuccess: () => {
      // Invalidate browse query to refresh job list
      queryClient.invalidateQueries({ queryKey: candidateJobsKeys.browse() });
    },
  });
}
