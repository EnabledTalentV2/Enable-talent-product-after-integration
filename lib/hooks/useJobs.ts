import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "@/lib/services/jobsAPI";
import type { JobFormValues } from "@/lib/schemas/job.schema";

/**
 * Query keys for jobs
 * Centralized to ensure consistency across the app
 */
export const jobsKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobsKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...jobsKeys.lists(), filters] as const,
  details: () => [...jobsKeys.all, "detail"] as const,
  detail: (id: string | number) => [...jobsKeys.details(), id] as const,
  stats: (id: string | number) => [...jobsKeys.all, "stats", id] as const,
};

/**
 * Fetch all jobs for the current organization
 *
 * @example
 * const { data: jobs, isLoading, error } = useJobs();
 */
export function useJobs() {
  return useQuery({
    queryKey: jobsKeys.lists(),
    queryFn: jobsAPI.list,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single job by ID
 *
 * @example
 * const { data: job, isLoading } = useJob(jobId);
 */
export function useJob(id: string | number | undefined) {
  return useQuery({
    queryKey: jobsKeys.detail(id as string),
    queryFn: () => jobsAPI.get(id as string),
    enabled: !!id, // Only fetch if ID is provided
  });
}

/**
 * Create a new job posting
 * Automatically invalidates the jobs list on success
 *
 * @example
 * const createJob = useCreateJob();
 * createJob.mutate(formValues, {
 *   onSuccess: (newJob) => {
 *     console.log("Created job:", newJob);
 *     router.push(`/jobs/${newJob.id}`);
 *   },
 * });
 */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: () => {
      // Invalidate and refetch jobs list
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

/**
 * Update an existing job posting
 * Automatically invalidates affected queries on success
 *
 * @example
 * const updateJob = useUpdateJob();
 * updateJob.mutate(
 *   { id: jobId, values: formValues },
 *   {
 *     onSuccess: (updatedJob) => {
 *       console.log("Updated job:", updatedJob);
 *     },
 *   }
 * );
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: JobFormValues }) =>
      jobsAPI.update(id, values),
    onSuccess: (_, { id }) => {
      // Invalidate both the list and the specific job detail
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(id) });
    },
  });
}

/**
 * Delete a job posting
 * Automatically invalidates the jobs list on success
 *
 * @example
 * const deleteJob = useDeleteJob();
 * deleteJob.mutate(jobId, {
 *   onSuccess: () => {
 *     console.log("Job deleted");
 *   },
 * });
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobsAPI.delete,
    onSuccess: (_, id) => {
      // Remove the job from cache and invalidate list
      queryClient.removeQueries({ queryKey: jobsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

/**
 * Fetch job statistics
 *
 * @example
 * const { data: stats } = useJobStats(jobId);
 */
export function useJobStats(id: string | number | undefined) {
  return useQuery({
    queryKey: jobsKeys.stats(id as string),
    queryFn: () => jobsAPI.getStats(id as string),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds (stats change frequently)
  });
}
