"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, Globe, MapPin, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { useUserDataStore } from "@/lib/userDataStore";
import { computeDashboardProfileCompletion } from "@/lib/profileCompletion";
import { useAppliedJobsStore } from "@/lib/talentAppliedJobsStore";
import { initialUserData } from "@/lib/userDataDefaults";
import { useCandidateJobs, useApplyToJob } from "@/lib/hooks/useCandidateJobs";
import type { EmployerJob } from "@/lib/employerJobsTypes";

type CompanyProfile = {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  hiringCount: number;
  lastActive: string;
  hiringStatus: string;
  about: string[];
  details: {
    location: string;
    industry: string;
    founded: string;
    employeeSize: string;
    website: string;
  };
};

type CompanyJob = {
  id: string;
  title: string;
  status: "Active" | "Closed";
  location: string;
  match?: number;
  jobType: string;
  workMode: string;
  yearsExperience: string;
  salary: string;
  posted: string;
  description: string;
  requirements: string[];
  company: CompanyProfile;
};

const getStatusStyles = (status: CompanyJob["status"]) =>
  status === "Active"
    ? "bg-[#ECFDF5] text-[#10B981]"
    : "bg-slate-100 text-slate-500";

// Helper function to transform EmployerJob to CompanyJob format
const transformToCompanyJob = (job: EmployerJob): CompanyJob => {
  // Keep description as raw text; parse requirements into list items
  const descriptionText = job.description ?? "";
  const requirementsArray = job.requirements
    ? job.requirements.split(/\r?\n/).filter(line => line.trim())
    : [];

  return {
    id: String(job.id),
    title: job.title,
    status: job.status === "Active" || job.status === "Closed" ? job.status : "Active",
    location: job.location || "Not specified",
    match: undefined, // TODO: Calculate match percentage based on user profile
    jobType: job.employmentType || "Full-time",
    workMode: job.workArrangement || "Remote",
    yearsExperience: job.experience || "Not specified",
    salary: job.salary || "Not disclosed",
    posted: job.postedAt || "Recently posted",
    description: descriptionText,
    requirements: requirementsArray,
    company: {
      id: job.company || String(job.id),
      name: job.company || "Company Name",
      industry: "Technology", // TODO: Get from backend when available
      logo: undefined,
      hiringCount: 1, // TODO: Get actual count from backend
      lastActive: "Active now",
      hiringStatus: "Actively hiring",
      about: [job.description || "No description available"],
      details: {
        location: job.location || "Not specified",
        industry: "Technology", // TODO: Get from backend
        founded: "2020", // TODO: Get from backend
        employeeSize: "50-100", // TODO: Get from backend
        website: "example.com", // TODO: Get from backend
      },
    },
  };
};

function CompaniesPageContent() {
  const { data: jobsData, isLoading, error } = useCandidateJobs();
  const { mutate: applyToJob, isPending: isApplying } = useApplyToJob();
  const allJobs = useMemo(
    () => (jobsData || []).map(transformToCompanyJob),
    [jobsData]
  );

  const [selectedId, setSelectedId] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
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
  const appliedJobs = useAppliedJobsStore((s) => s.appliedJobs);
  const { percent: profilePercent } = useMemo(
    () => computeDashboardProfileCompletion(userData),
    [userData]
  );

  // Filter jobs based on search query
  const jobs = useMemo(() => {
    if (!searchQuery.trim()) {
      return allJobs;
    }

    const query = searchQuery.toLowerCase();
    return allJobs.filter((job) => {
      const titleMatch = job.title.toLowerCase().includes(query);
      const companyMatch = job.company.name.toLowerCase().includes(query);
      const locationMatch = job.location.toLowerCase().includes(query);
      const jobTypeMatch = job.jobType.toLowerCase().includes(query);
      const workModeMatch = job.workMode.toLowerCase().includes(query);

      return titleMatch || companyMatch || locationMatch || jobTypeMatch || workModeMatch;
    });
  }, [allJobs, searchQuery]);

  // Set initial selection when jobs load
  useEffect(() => {
    if (jobs.length > 0 && !selectedId) {
      setSelectedId(jobs[0].id);
    }
  }, [jobs, selectedId]);

  const activeJob = useMemo(
    () => jobs.find((job) => job.id === selectedId) ?? jobs[0],
    [jobs, selectedId]
  );
  const activeCompany = activeJob?.company;
  const appliedJobIds = useMemo(
    () => new Set(appliedJobs.map((job) => job.id)),
    [appliedJobs]
  );
  const isApplied = activeJob ? appliedJobIds.has(activeJob.id) : false;
  const canApply =
    Boolean(activeJob) && activeJob.status === "Active" && !isApplied;
  const descriptionText = activeJob?.description ?? "";
  const descriptionLines = descriptionText.split(/\r?\n/);
  const hasDescription = descriptionText.trim().length > 0;
  const canToggleDescription = descriptionLines.length > 2;
  const visibleDescriptionText = showFullDescription
    ? descriptionText
    : descriptionLines.slice(0, 2).join("\n");
  const hasJobs = jobs.length > 0;

  useEffect(() => {
    setShowFullDescription(false);
  }, [activeJob?.id]);

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
    if (!activeJob || !activeCompany || !canApply) {
      return;
    }

    // Prepare job data for optimistic update
    const jobData = {
      id: activeJob.id,
      title: activeJob.title,
      status: activeJob.status,
      location: activeJob.location,
      match: activeJob.match,
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      companyLogo: activeCompany.logo,
      companyIndustry: activeCompany.industry,
      hiringCount: activeCompany.hiringCount,
      lastActive: activeCompany.lastActive,
      posted: activeJob.posted,
      salary: activeJob.salary,
      jobType: activeJob.jobType,
      workMode: activeJob.workMode,
      yearsExperience: activeJob.yearsExperience,
      about: activeCompany.about[0],
      description: activeJob.description,
      requirements: activeJob.requirements,
    };

    // Optimistic update - UI updates immediately
    applyToJob(
      { jobId: activeJob.id, jobData },
      {
        onError: (error) => {
          console.error("Failed to apply to job:", error);
          alert("Failed to submit application. Please try again.");
        },
      }
    );
  };

  return (
    <section className="mx-auto max-w-360 space-y-6">
      <DashboardProfilePrompt percent={profilePercent} />

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C27803] border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading job opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-[32px] bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-800">Failed to load jobs</p>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      )}

      {/* Jobs Content */}
      {!isLoading && !error && (
        <div>
          <div className="mx-auto max-w-360">
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mb-6">
                <p className="text-sm text-slate-600">
                  Found {jobs.length} job{jobs.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </p>
              </div>
            )}

            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="w-full space-y-4 lg:w-[450px] lg:shrink-0">
                {hasJobs ? (
                jobs.map((job) => {
                  const isSelected = selectedId === job.id;
                  const matchLabel =
                    typeof job.match === "number" ? `${job.match}%` : "--";

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
                          {job.company.lastActive}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${getStatusStyles(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        {job.company.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.name}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                            {job.company.name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="truncate text-xl font-bold text-slate-900">
                            {job.title}
                          </h3>
                          <p className="truncate font-medium text-slate-500">
                            {job.company.name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={18} className="text-orange-400" />
                            <span className="text-base font-medium">
                              {job.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-500">
                            <Users size={18} className="text-orange-400" />
                            <span className="text-base font-medium">
                              {job.company.hiringCount} Hiring
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#FEF3C7] px-4 py-3 text-center">
                          <p className="text-lg font-bold text-slate-900">
                            {matchLabel}
                          </p>
                          <p className="text-sm font-bold uppercase tracking-wider text-slate-700">
                            Matching
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[32px] bg-white p-6 text-sm text-slate-500 shadow-sm">
                  {searchQuery
                    ? `No jobs found matching "${searchQuery}". Try a different search term.`
                    : "No job opportunities available yet."}
                </div>
              )}
            </div>

            <div
              ref={detailsRef}
              className="w-full rounded-[40px] bg-white p-6 shadow-sm md:p-10 lg:flex-1"
            >
              {activeJob && activeCompany ? (
                <div className="space-y-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {activeCompany.logo ? (
                        <img
                          src={activeCompany.logo}
                          alt={activeCompany.name}
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-600">
                          {activeCompany.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-3xl font-bold text-slate-900">
                          {activeCompany.name}
                        </h2>
                        <p className="truncate text-lg font-medium text-slate-500">
                          {activeCompany.industry}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`rounded-full px-4 py-1 text-base font-bold ${getStatusStyles(
                          activeJob.status
                        )}`}
                      >
                        {activeJob.status}
                      </span>
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={!canApply || isApplying}
                        className={`rounded-full px-6 py-2 text-base font-bold transition ${
                          canApply && !isApplying
                            ? "bg-[#C27803] text-white hover:bg-[#A56303]"
                            : "cursor-not-allowed bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isApplying
                          ? "Applying..."
                          : isApplied
                          ? "Applied"
                          : activeJob.status === "Active"
                          ? "Apply now"
                          : "Closed"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#FFFBEB] p-5">
                    <p className="text-base font-medium text-slate-400">Role</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {activeJob.title}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-6 text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-orange-400" />
                        <span>{activeJob.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-orange-400" />
                        <span>{activeCompany.hiringCount} Hiring</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-slate-900">
                      Job description
                    </h4>
                    {hasDescription ? (
                      <div className="text-slate-600 prose prose-slate max-w-none">
                        <ReactMarkdown
                          rehypePlugins={[rehypeSanitize]}
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 underline hover:text-orange-700"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {visibleDescriptionText}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-600">
                        Details will be shared after you apply.
                      </p>
                    )}
                    {hasDescription && canToggleDescription && (
                      <button
                        type="button"
                        onClick={() => setShowFullDescription((prev) => !prev)}
                        className="text-sm font-semibold text-[#C27803] transition hover:text-[#A56303]"
                      >
                        {showFullDescription ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-10 md:grid-cols-4">
                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">
                        Location
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.location}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">
                        Industry
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.industry}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">
                        Founded year
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.founded}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">
                        Employee size
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.employeeSize}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-base font-medium text-slate-400">
                      Open roles / Hiring
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {activeCompany.hiringCount}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-slate-900">
                      About the company
                    </h4>
                    <div className="space-y-4 leading-relaxed text-slate-600">
                      {activeCompany.about.map((paragraph, i) => (
                        <p key={`${activeCompany.id}-about-${i}`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-slate-900">
                      Company details
                    </h4>

                    <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                      <li className="flex items-center gap-2">
                        <Globe size={16} className="text-orange-400" />
                        <a
                          href={`https://${activeCompany.details.website}`}
                          className="font-semibold text-slate-900 transition hover:text-[#C27803]"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {activeCompany.details.website}
                        </a>
                      </li>

                      <li className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-400" />
                        <span>Last active: {activeCompany.lastActive}</span>
                      </li>

                      <li className="flex items-center gap-2">
                        <Users size={16} className="text-orange-400" />
                        <span>Hiring status: {activeCompany.hiringStatus}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  {hasJobs
                    ? "Select a company to view details."
                    : "No company details yet."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </section>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={null}>
      <CompaniesPageContent />
    </Suspense>
  );
}
