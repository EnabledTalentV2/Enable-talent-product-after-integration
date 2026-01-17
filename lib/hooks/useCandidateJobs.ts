import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateJobsAPI } from "@/lib/services/candidateJobsAPI";
import { useAppliedJobsStore, AppliedJob } from "@/lib/talentAppliedJobsStore";

/**
 * React Query keys for candidate job operations
 */
export const candidateJobsKeys = {
  all: ["candidate-jobs"] as const,
  browse: () => [...candidateJobsKeys.all, "browse"] as const,
  search: (query: string) => [...candidateJobsKeys.all, "search", query] as const,
  applications: () => ["candidate-applications"] as const,
};

export type ApplyToJobParams = {
  jobId: string | number;
  jobData: AppliedJob;
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
 * Hook to apply to a job with optimistic updates
 * Immediately updates UI and rolls back on error
 */
export function useApplyToJob() {
  const queryClient = useQueryClient();
  const applyJob = useAppliedJobsStore((s) => s.applyJob);
  const removeJob = useAppliedJobsStore((s) => s.removeJob);

  return useMutation({
    mutationFn: ({ jobId }: ApplyToJobParams) => candidateJobsAPI.apply(jobId),
    onMutate: async ({ jobId, jobData }) => {
      // Optimistically add job to applied jobs store immediately
      applyJob(jobData);

      // Return context for potential rollback
      return { jobId: String(jobId), jobData };
    },
    onError: (error: any, _variables, context) => {
      // Don't rollback on 409 - it means already applied (keep in applied state)
      const status = error?.status || error?.response?.status;
      if (status === 409) {
        // Already applied - keep the optimistic state
        return;
      }

      // Rollback: remove job from store on actual errors
      if (context?.jobId) {
        removeJob(context.jobId);
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: candidateJobsKeys.browse() });
      queryClient.invalidateQueries({ queryKey: candidateJobsKeys.applications() });
    },
  });
}
