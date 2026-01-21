"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Briefcase, DollarSign, Calendar, Check } from "lucide-react";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { CandidateMyJobsSkeleton } from "@/components/CandidateDashboardSkeletons";
import { useUserDataStore } from "@/lib/userDataStore";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useAppliedJobsStore } from "@/lib/talentAppliedJobsStore";
import { initialUserData } from "@/lib/userDataDefaults";
import {
  useCandidateJobs,
  useCandidateApplications,
  useApplyToJob,
} from "@/lib/hooks/useCandidateJobs";
import { JobApplicationTab } from "@/lib/types/candidate-applications";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary?: string;
  posted: string;
  status: "Active" | "Closed" | "Applied" | "Shortlisted" | "Rejected" | "Accepted";
  applicationStatus?: "Applied" | "Accepted" | "Rejected";
  description?: string[];
  requirements?: string[];
  match?: number;
  appliedAt?: string;
};

const filters: readonly JobApplicationTab[] = [
  "All",
  "Applied",
  "Accepted",
  "Rejected",
] as const;

const getStatusStyles = (status: Job["status"]) => {
  switch (status) {
    case "Active":
      return "bg-[#ECFDF5] text-[#10B981]";
    case "Applied":
      return "bg-[#EFF6FF] text-[#3B82F6]";
    case "Shortlisted":
      return "bg-[#FEF3C7] text-[#F59E0B]";
    case "Accepted":
      return "bg-[#ECFDF5] text-[#10B981]";
    case "Rejected":
      return "bg-[#FEE2E2] text-[#EF4444]";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

const formatPostedDate = (dateString: string | undefined): string => {
  if (!dateString) return "Recently posted";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  } catch {
    return dateString;
  }
};

export default function MyJobsPage() {
  const { data: jobsData, isLoading: isLoadingJobs } = useCandidateJobs();
  const {
    data: applications = [],
    isLoading: isLoadingApplications,
  } = useCandidateApplications();
  const { mutate: applyToJob, isPending: isApplying } = useApplyToJob();

  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const rawUserData = useUserDataStore((s) => s.userData);
  const userData = useMemo(
    () => ({
      ...initialUserData,
      ...rawUserData,
      basicInfo: { ...initialUserData.basicInfo, ...rawUserData?.basicInfo },
      workExperience: {
        ...initialUserData.workExperience,
        ...rawUserData?.workExperience,
      },
      education: { ...initialUserData.education, ...rawUserData?.education },
      skills: { ...initialUserData.skills, ...rawUserData?.skills },
      projects: { ...initialUserData.projects, ...rawUserData?.projects },
      achievements: {
        ...initialUserData.achievements,
        ...rawUserData?.achievements,
      },
      certification: {
        ...initialUserData.certification,
        ...rawUserData?.certification,
      },
      preference: { ...initialUserData.preference, ...rawUserData?.preference },
      otherDetails: {
        ...initialUserData.otherDetails,
        ...rawUserData?.otherDetails,
      },
      accessibilityNeeds: {
        ...(initialUserData.accessibilityNeeds ?? {
          categories: [],
          accommodationNeed: "",
          disclosurePreference: "",
          accommodations: [],
        }),
        ...rawUserData?.accessibilityNeeds,
      },
      reviewAgree: {
        ...initialUserData.reviewAgree,
        ...rawUserData?.reviewAgree,
      },
    }),
    [rawUserData]
  );

  const appliedJobsStore = useAppliedJobsStore((s) => s.appliedJobs);
  const { percent: profilePercent } = useMemo(
    () => computeProfileCompletion(userData),
    [userData]
  );


  // Transform applications to Job format
  const applicationJobs = useMemo(
    () =>
      applications.map((app) => {
        // Map backend status to UI applicationStatus
        const getApplicationStatus = (): Job["applicationStatus"] => {
          if (app.status === "hired" || app.status === "shortlisted" || app.status === "accepted") {
            return "Accepted";
          }
          if (app.status === "rejected") {
            return "Rejected";
          }
          return "Applied";
        };

        // Map backend status to display status
        const getDisplayStatus = (): Job["status"] => {
          if (app.status === "hired") return "Accepted";
          if (app.status === "shortlisted") return "Shortlisted";
          if (app.status === "rejected") return "Rejected";
          if (app.status === "accepted") return "Accepted";
          return "Applied";
        };

        return {
          id: `app-${app.id}`,
          title: app.job.title,
          company: app.job.organization.name,
          location: app.job.location,
          jobType: app.job.job_type,
          salary: undefined,
          posted: new Date(app.applied_at).toLocaleDateString(),
          status: getDisplayStatus(),
          applicationStatus: getApplicationStatus(),
          description: undefined,
          requirements: undefined,
          appliedAt: new Date(app.applied_at).toLocaleDateString(),
        };
      }),
    [applications]
  );

  // Transform optimistic applied jobs from store (not yet confirmed by server)
  const optimisticAppliedJobs = useMemo(() => {
    // Get IDs already in server applications to avoid duplicates
    const serverAppliedIds = new Set(applications.map(app => String(app.job.id)));

    return appliedJobsStore
      .filter(job => !serverAppliedIds.has(job.id)) // Only show if not yet in server response
      .map((job) => ({
        id: `app-optimistic-${job.id}`,
        title: job.title,
        company: job.companyName,
        location: job.location,
        jobType: job.jobType || "Full-time",
        salary: job.salary,
        posted: job.posted || "Just now",
        status: "Applied" as Job["status"],
        applicationStatus: "Applied" as Job["applicationStatus"],
        description: job.description,
        requirements: job.requirements,
        appliedAt: "Just now",
      }));
  }, [appliedJobsStore, applications]);

  // Transform browse jobs
  const browseJobs = useMemo(() => {
    if (!jobsData) return [];

    // Combine server applications AND optimistic store for filtering
    const allAppliedIds = new Set([
      ...applications.map(app => Number(app.job.id)),
      ...appliedJobsStore.map(job => Number(job.id)),
    ]);

    return jobsData
      .filter(job => !allAppliedIds.has(Number(job.id)))
      .map((job) => ({
        id: String(job.id),
        title: job.title,
        company: job.company || "Company Name",
        location: job.location || "Not specified",
        jobType: job.employmentType || "Full-time",
        salary: job.salary || "Not disclosed",
        posted: formatPostedDate(job.postedAt),
        status: (job.status === "Active" || job.status === "Closed" ? job.status : "Active") as Job["status"],
        applicationStatus: undefined,
        description: job.description?.split('\n').filter(line => line.trim()),
        requirements: job.requirements?.split('\n').filter(line => line.trim()),
        appliedAt: undefined,
      }));
  }, [jobsData, applications, appliedJobsStore]);

  // Combine all jobs (server applications + optimistic + browse)
  const allJobs = useMemo(() => {
    // Combine server applications with optimistic ones
    const allApplicationJobs = [...optimisticAppliedJobs, ...applicationJobs];

    if (activeFilter === "All") {
      return [...allApplicationJobs, ...browseJobs];
    }
    return allApplicationJobs.filter(job => job.applicationStatus === activeFilter);
  }, [activeFilter, applicationJobs, optimisticAppliedJobs, browseJobs]);

  // Filter jobs based on search
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) {
      return allJobs;
    }

    const query = searchQuery.toLowerCase();
    return allJobs.filter((job) => {
      const titleMatch = job.title.toLowerCase().includes(query);
      const companyMatch = job.company.toLowerCase().includes(query);
      const locationMatch = job.location.toLowerCase().includes(query);
      const jobTypeMatch = job.jobType.toLowerCase().includes(query);

      return titleMatch || companyMatch || locationMatch || jobTypeMatch;
    });
  }, [allJobs, searchQuery]);

  // Set initial selection
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedId) {
      setSelectedId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedId]);

  const activeJob = useMemo(
    () => filteredJobs.find((job) => job.id === selectedId) ?? filteredJobs[0],
    [filteredJobs, selectedId]
  );

  // Create a set of actual job IDs that have been applied to (not application IDs)
  const appliedJobIds = useMemo(
    () => new Set([
      ...appliedJobsStore.map(j => j.id),
      // Extract the actual job IDs from applications
      ...applications.map(app => String(app.job.id)),
    ]),
    [appliedJobsStore, applications]
  );

  // Check if job is applied
  const isApplied = useMemo(() => {
    if (!activeJob) return false;

    // Check direct ID match
    if (appliedJobIds.has(activeJob.id)) return true;

    // Check if this is an application job (has "app-" prefix)
    if (activeJob.id.startsWith('app-')) {
      return true; // Application jobs are by definition already applied
    }

    return false;
  }, [activeJob, appliedJobIds]);

  const canApply = Boolean(activeJob) && activeJob.status === "Active" && !isApplied;
  const hasJobs = filteredJobs.length > 0;
  const isLoading = isLoadingJobs || isLoadingApplications;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const handleApply = () => {
    if (!activeJob || !canApply) {
      return;
    }

    // Prepare job data for optimistic update
    const jobData = {
      id: activeJob.id,
      title: activeJob.title,
      status: "Active" as const,
      location: activeJob.location,
      companyId: activeJob.id,
      companyName: activeJob.company,
      posted: activeJob.posted,
      salary: activeJob.salary,
      jobType: activeJob.jobType,
      description: activeJob.description,
      requirements: activeJob.requirements,
    };

    applyToJob(
      { jobId: activeJob.id, jobData },
      {
        onError: (error: any) => {
          console.error("Failed to apply to job:", error);

          const status = error?.status;
          const message = error?.message || "Failed to submit application";

          if (status === 409) {
            alert("You have already applied to this job.");
          } else if (status === 401) {
            alert("Please log in to apply for this job.");
          } else {
            alert(message || "Failed to submit application. Please try again.");
          }
        },
      }
    );
  };

  if (isLoading) {
    return <CandidateMyJobsSkeleton />;
  }

  return (
    <section className="mx-auto max-w-360 space-y-6 py-10">
      <DashboardProfilePrompt percent={profilePercent} />
      <div>
          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-xl px-6 py-2.5 text-base font-bold transition ${
                  activeFilter === filter
                    ? "bg-[#C27803] text-white"
                    : "bg-[#E2E8F0] text-slate-900 hover:bg-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-6">
              <p className="text-sm text-slate-600">
                Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            </div>
          )}

          {/* Jobs List and Details */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Jobs List */}
            <div className="w-full space-y-4 lg:w-[450px] lg:shrink-0">
              {hasJobs ? (
                filteredJobs.map((job) => {
                  const isSelected = selectedId === job.id;
                  const jobIsApplied = job.appliedAt || job.applicationStatus;

                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => handleSelect(job.id)}
                      className={`relative w-full rounded-[32px] border-2 bg-white p-5 text-left shadow-sm transition-all sm:p-6 ${
                        isSelected ? "border-[#C27803]" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-slate-400">
                          {job.appliedAt ? `Applied: ${job.appliedAt}` : job.posted}
                        </span>
                        <div className="flex items-center gap-2">
                          {jobIsApplied && job.status !== "Applied" && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                              <Check size={14} />
                              Applied
                            </span>
                          )}
                          <span
                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${getStatusStyles(
                              job.status
                            )}`}
                          >
                            {jobIsApplied && job.status === "Applied" && <Check size={14} />}
                            {job.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-xl font-bold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="mt-1 font-medium text-slate-500">
                          {job.company}
                        </p>
                      </div>

                      <div className="mt-6 space-y-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={18} className="text-orange-400" />
                          <span className="text-base font-medium">
                            {job.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <Briefcase size={18} className="text-orange-400" />
                          <span className="text-base font-medium">
                            {job.jobType}
                          </span>
                        </div>

                        {job.salary && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <DollarSign size={18} className="text-orange-400" />
                            <span className="text-base font-medium">
                              {job.salary}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[32px] bg-white p-6 text-sm text-slate-500 shadow-sm">
                  {searchQuery
                    ? `No jobs found matching "${searchQuery}". Try a different search term.`
                    : activeFilter === "All"
                    ? "No job opportunities available yet."
                    : `No ${activeFilter.toLowerCase()} applications yet.`}
                </div>
              )}
            </div>

            {/* Job Details */}
            <div
              ref={detailsRef}
              className="w-full rounded-[40px] bg-white p-6 shadow-sm md:p-10 lg:flex-1"
            >
              {activeJob ? (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">
                        {activeJob.title}
                      </h2>
                      <p className="mt-2 text-xl font-medium text-slate-500">
                        {activeJob.company}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`rounded-full px-4 py-1 text-base font-bold ${getStatusStyles(
                          activeJob.status
                        )}`}
                      >
                        {activeJob.status}
                      </span>
                      {activeJob.status === "Active" && (
                        <button
                          type="button"
                          onClick={handleApply}
                          disabled={!canApply || isApplying}
                          className={`flex items-center gap-2 rounded-full px-6 py-2 text-base font-bold transition ${
                            canApply && !isApplying
                              ? "bg-[#C27803] text-white hover:bg-[#A56303]"
                              : "cursor-not-allowed bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isApplying ? (
                            "Applying..."
                          ) : isApplied ? (
                            <>
                              <Check size={18} />
                              Applied
                            </>
                          ) : (
                            "Apply now"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Job Info Card */}
                  <div className="rounded-[28px] bg-[#FFFBEB] p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-400">Location</p>
                          <p className="font-bold text-slate-900">{activeJob.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Briefcase size={20} className="text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-400">Job Type</p>
                          <p className="font-bold text-slate-900">{activeJob.jobType}</p>
                        </div>
                      </div>

                      {activeJob.salary && (
                        <div className="flex items-center gap-3">
                          <DollarSign size={20} className="text-orange-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-400">Salary</p>
                            <p className="font-bold text-slate-900">{activeJob.salary}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-400">Posted</p>
                          <p className="font-bold text-slate-900">{activeJob.posted}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {activeJob.description && activeJob.description.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-slate-900">
                        Job Description
                      </h4>
                      <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                        {activeJob.description.map((item, index) => (
                          <li key={`desc-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements */}
                  {activeJob.requirements && activeJob.requirements.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-slate-900">
                        Requirements
                      </h4>
                      <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                        {activeJob.requirements.map((item, index) => (
                          <li key={`req-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Applied Info */}
                  {activeJob.appliedAt && (
                    <div className="rounded-[28px] bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900">
                        You applied for this position on {activeJob.appliedAt}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  {hasJobs
                    ? "Select a job to view details."
                    : "No job details yet."}
                </div>
              )}
            </div>
          </div>
      </div>
    </section>
  );
}
