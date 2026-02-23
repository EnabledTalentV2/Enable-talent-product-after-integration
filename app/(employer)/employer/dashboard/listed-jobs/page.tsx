"use client";
import { scrollBehavior } from "@/lib/utils/scrollBehavior";

import { Suspense, useEffect, useMemo, useRef, useState, useCallback, FormEvent } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ListedJobCard from "@/components/employer/dashboard/ListedJobCard";
import JobDetailView from "@/components/employer/dashboard/JobDetailView";
import {
  ListedJobDetailSkeleton,
  ListedJobsListSkeleton,
} from "@/components/employer/dashboard/ListedJobsLoadingSkeleton";
import { useJobs, jobsKeys } from "@/lib/hooks/useJobs";
import { emptyJobStats, toJobDetail, toListedJob } from "@/lib/employerJobsUtils";
import { useEmployerJobsStore, setJobsCacheInvalidator } from "@/lib/employerJobsStore";
import type { JobStats } from "@/lib/employerJobsUtils";
import type { Application } from "@/components/employer/candidates/ApplicantsList";

function ListedJobsPageContent() {
  // Use React Query hook - automatic fetching, caching, and error handling
  const { data: jobs = [], isLoading, error } = useJobs();
  const { deleteJob } = useEmployerJobsStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");

  const [manualJobId, setManualJobId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobStatsMap, setJobStatsMap] = useState<Record<string, JobStats>>({});
  const didMountRef = useRef(false);

  // Derive the selected job ID from URL param, manual selection, or first job.
  // This replaces the previous useEffect that called setSelectedJobId in its body.
  const selectedJobId = useMemo<string | number | null>(() => {
    if (jobs.length === 0) return null;
    if (jobIdFromUrl) {
      const match = jobs.find((j) => String(j.id) === jobIdFromUrl);
      if (match) return match.id;
    }
    if (manualJobId !== null && jobs.some((j) => j.id === manualJobId)) {
      return manualJobId;
    }
    return jobs[0]?.id ?? null;
  }, [jobs, jobIdFromUrl, manualJobId]);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
  }, []);

  // Set up cache invalidator for Zustand store
  useEffect(() => {
    setJobsCacheInvalidator(() => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    });
  }, [queryClient]);

  const handleDeleteJob = async (jobId: string | number) => {
    try {
      await deleteJob(jobId);
      // If we deleted the selected job, clear selection
      if (selectedJobId === jobId) {
        setManualJobId(null);
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const getStatsForJob = useCallback(
    (jobId: string | number) => jobStatsMap[String(jobId)],
    [jobStatsMap]
  );

  const listedJobs = useMemo(() => {
    const allJobs = jobs.map((job) => {
      const base = toListedJob(job);
      const stats = getStatsForJob(job.id);
      if (!stats) {
        return base;
      }
      return {
        ...base,
        stats: {
          accepted: stats.accepted,
          declined: stats.declined,
          matching: stats.matchingCandidates,
        },
      };
    });
    if (!searchQuery.trim()) return allJobs;

    const query = searchQuery.toLowerCase();
    return allJobs.filter((job) => {
      const titleMatch = job.role?.toLowerCase().includes(query);
      const companyMatch = job.company?.toLowerCase().includes(query);
      const locationMatch = job.location?.toLowerCase().includes(query);
      return titleMatch || companyMatch || locationMatch;
    });
  }, [jobs, searchQuery, getStatsForJob]);
  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    const job = jobs.find((entry) => entry.id === selectedJobId);
    if (!job) return null;
    const base = toJobDetail(job);
    const stats = getStatsForJob(job.id);
    if (!stats) {
      return base;
    }
    return {
      ...base,
      stats: {
        accepted: stats.accepted,
        declined: stats.declined,
        requests: stats.requestsSent,
        matching: stats.matchingCandidates,
      },
    };
  }, [jobs, selectedJobId, getStatsForJob]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (!selectedJobId) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const targetId = isDesktop
      ? `listed-job-details-desktop-${selectedJobId}`
      : `listed-job-details-inline-${selectedJobId}`;

    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }

      if (!isDesktop) {
        target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      }

      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    });
  }, [selectedJobId]);

  useEffect(() => {
    let isMounted = true;

    const loadJobStats = async () => {
      const entries = await Promise.all(
        jobs.map(async (job) => {
          const stats = emptyJobStats();
          const jobId = job.id;

          try {
            const response = await fetch(`/api/jobs/${jobId}/applications`);
            if (response.ok) {
              const data = await response.json();
              const applications = Array.isArray(data) ? (data as Application[]) : [];

              applications.forEach((application) => {
                if (
                  application.status === "shortlisted" ||
                  application.status === "hired"
                ) {
                  stats.accepted += 1;
                } else if (application.status === "rejected") {
                  stats.declined += 1;
                } else if (application.status === "request_sent") {
                  stats.requestsSent += 1;
                }
              });
            }
          } catch (error) {
            console.error("Failed to load applications for job:", jobId, error);
          }

          try {
            const response = await fetch(`/api/jobs/${jobId}/ranking-data`);
            if (response.ok) {
              const data = await response.json();
              const rankedCandidates = Array.isArray(data?.ranked_candidates)
                ? data.ranked_candidates
                : [];
              stats.matchingCandidates = rankedCandidates.length;
            }
          } catch (error) {
            console.error("Failed to load ranking data for job:", jobId, error);
          }

          return [String(jobId), stats] as const;
        })
      );

      if (isMounted) {
        setJobStatsMap(Object.fromEntries(entries));
      }
    };

    loadJobStats();

    return () => {
      isMounted = false;
    };
  }, [jobs]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-360 mx-auto">
        <div className="sr-only">Loading listed jobs...</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-4">
            <div className="mb-6">
              <div className="h-11 w-full rounded-xl bg-slate-200 animate-pulse" />
            </div>
            <ListedJobsListSkeleton count={4} />
          </div>

          <div className="hidden lg:block lg:col-span-8 lg:pb-10">
            <ListedJobDetailSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4 text-slate-700">
        <p className="text-lg font-medium text-red-800">Failed to load jobs</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // Show empty state only when there are truly no jobs (not filtered by search)
  if (jobs.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-16 text-center">
        <div className="rounded-full bg-orange-50 px-6 py-2 text-sm font-semibold text-orange-900">
          No jobs posted yet
        </div>
        <p className="text-base text-slate-700">
          Post your first role to start reviewing candidates and tracking
          performance.
        </p>
        <Link
          href="/employer/dashboard/post-jobs"
          className="rounded-xl bg-orange-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Post a Job
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-360 mx-auto">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Job List */}
        <div className="flex flex-col lg:col-span-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your listed jobs"
                aria-label="Search your listed jobs"
                className="w-full bg-white pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C27803]/20 focus:border-[#C27803] transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-[#D95F35] text-white hover:bg-[#B84D28] transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Scrollable List */}
          <div className="space-y-4 lg:pr-2 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent">
            {listedJobs.length > 0 ? (
              listedJobs.map((job) => {
                const isSelected = selectedJobId === job.id;
                return (
                  <div key={job.id} className="space-y-4">
                    <ListedJobCard
                      job={job}
                      isSelected={isSelected}
                      onClick={() => setManualJobId(job.id)}
                    />
                    {isSelected && (
                      <div
                        id={`listed-job-details-inline-${job.id}`}
                        tabIndex={-1}
                        className="lg:hidden"
                      >
                        {selectedJob && (
                          <JobDetailView
                            job={selectedJob}
                            onDelete={handleDeleteJob}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-slate-700">
                  No related job found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Job Details */}
        {selectedJob && selectedJobId && (
          <div
            id={`listed-job-details-desktop-${selectedJobId}`}
            tabIndex={-1}
            className="hidden lg:block lg:col-span-8 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent pb-10"
          >
            <JobDetailView job={selectedJob} onDelete={handleDeleteJob} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListedJobsPage() {
  return (
    <Suspense fallback={null}>
      <ListedJobsPageContent />
    </Suspense>
  );
}
