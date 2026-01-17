"use client";

import { useEffect, useMemo, useRef, useState, useCallback, FormEvent } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import ListedJobCard from "@/components/employer/dashboard/ListedJobCard";
import JobDetailView from "@/components/employer/dashboard/JobDetailView";
import { useJobs, jobsKeys } from "@/lib/hooks/useJobs";
import { toJobDetail, toListedJob } from "@/lib/employerJobsUtils";
import { useEmployerJobsStore, setJobsCacheInvalidator } from "@/lib/employerJobsStore";

const brandStyles: Record<string, string> = {
  Meta: "bg-blue-100 text-blue-700",
  Google: "bg-amber-100 text-amber-700",
  Amazon: "bg-orange-100 text-orange-700",
};

const getBrandKey = (company: string) => company.split(" ")[0] || company;

const getBrandStyle = (company: string) =>
  brandStyles[getBrandKey(company)] ?? "bg-slate-100 text-slate-700";

export default function ListedJobsPage() {
  // Use React Query hook - automatic fetching, caching, and error handling
  const { data: jobs = [], isLoading, error } = useJobs();
  const { deleteJob } = useEmployerJobsStore();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");

  const [selectedJobId, setSelectedJobId] = useState<string | number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const didMountRef = useRef(false);

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
        setSelectedJobId(null);
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  const listedJobs = useMemo(() => {
    const allJobs = jobs.map(toListedJob);
    if (!searchQuery.trim()) return allJobs;

    const query = searchQuery.toLowerCase();
    return allJobs.filter((job) => {
      const titleMatch = job.role?.toLowerCase().includes(query);
      const companyMatch = job.company?.toLowerCase().includes(query);
      const locationMatch = job.location?.toLowerCase().includes(query);
      return titleMatch || companyMatch || locationMatch;
    });
  }, [jobs, searchQuery]);
  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    const job = jobs.find((entry) => entry.id === selectedJobId);
    return job ? toJobDetail(job) : null;
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (jobs.length === 0) {
      setSelectedJobId(null);
      return;
    }

    // If jobId is in URL, select that job
    if (jobIdFromUrl) {
      const jobExists = jobs.some((job) => String(job.id) === jobIdFromUrl);
      if (jobExists) {
        setSelectedJobId(jobIdFromUrl);
        return;
      }
    }

    setSelectedJobId((current) => {
      if (current && jobs.some((job) => job.id === current)) {
        return current;
      }
      return jobs[0].id;
    });
  }, [jobs, jobIdFromUrl]);

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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    });
  }, [selectedJobId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center text-slate-500">
        Loading listed jobs...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4 text-slate-500">
        <p className="text-lg font-medium text-red-600">Failed to load jobs</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  // Show empty state only when there are truly no jobs (not filtered by search)
  if (jobs.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-16 text-center">
        <div className="rounded-full bg-orange-50 px-6 py-2 text-sm font-semibold text-orange-700">
          No jobs posted yet
        </div>
        <p className="text-base text-slate-500">
          Post your first role to start reviewing candidates and tracking
          performance.
        </p>
        <Link
          href="/employer/dashboard/post-jobs"
          className="rounded-xl bg-[#D98836] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
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
                className="w-full bg-white pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
                      onClick={() => setSelectedJobId(job.id)}
                      getBrandStyle={getBrandStyle}
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
                            getBrandStyle={getBrandStyle}
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
                <p className="text-slate-600">
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
            <JobDetailView job={selectedJob} getBrandStyle={getBrandStyle} onDelete={handleDeleteJob} />
          </div>
        )}
      </div>
    </div>
  );
}
