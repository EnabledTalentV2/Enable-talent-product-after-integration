"use client";
import { scrollBehavior } from "@/lib/utils/scrollBehavior";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import JobHeader from "@/components/employer/candidates/JobHeader";
import CandidateSummaryCard from "@/components/employer/candidates/CandidateSummaryCard";
import CandidateDetailPanel from "@/components/employer/candidates/CandidateDetailPanel";
import CandidateDecisionButtons from "@/components/employer/candidates/CandidateDecisionButtons";
import {
  CandidateDetailSkeleton,
  CandidateListSkeleton,
} from "@/components/employer/candidates/CandidateLoadingSkeleton";
import SendInvitesModal from "@/components/employer/candidates/SendInvitesModal";
import SuccessModal from "@/components/employer/candidates/SuccessModal";
import Toast from "@/components/Toast";
import Pagination from "@/components/ui/Pagination";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { emptyJobStats, toJobHeaderInfo } from "@/lib/employerJobsUtils";
import {
  useCandidateProfiles,
  useCandidateProfile,
} from "@/lib/hooks/useCandidateProfiles";
import { useAIRanking } from "@/lib/hooks/useAIRanking";
import { getApiErrorMessage } from "@/lib/api-client";
import { invitesAPI } from "@/lib/services/invitesAPI";
import type { CandidateProfile } from "@/lib/types/candidateProfile";
import type { Application } from "@/components/employer/candidates/ApplicantsList";

const TABS = [
  { id: "ai_ranking", label: <><abbr title="Artificial Intelligence">AI</abbr> Ranking</>, status: null },
  { id: "applicants", label: "Applicants", status: "applied" },
  { id: "shortlisted", label: "Shortlisted", status: "shortlisted" },
  { id: "declined", label: "Rejected", status: "rejected" },
  { id: "hired", label: "Hired", status: "hired" },
  { id: "request_sent", label: "Request sent", status: "request_sent" },
] as const;

const ITEMS_PER_PAGE = 10;

const DEFAULT_JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
  "Freelance",
];

const DEFAULT_WORK_ARRANGEMENTS = [
  "Remote",
  "Hybrid",
  "On-site",
  "In-person",
  "Flexible",
];

const normalizeFilterValue = (value?: string) =>
  value ? value.toLowerCase().replace(/[\s_-]+/g, "") : "";

const mergeOptions = (
  defaults: string[],
  values: Array<string | undefined>
) => {
  const result: string[] = [];
  const seen = new Set<string>();

  const add = (value?: string) => {
    if (!value) return;
    const key = normalizeFilterValue(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(value);
  };

  defaults.forEach(add);
  values.forEach(add);

  return result;
};

type CandidateFilters = {
  availability: string[];
  jobType: string[];
  workArrangement: string[];
  verifiedOnly: boolean;
};

const STATUS_BADGES: Record<
  Application["status"],
  { label: string; className: string }
> = {
  applied: { label: "Applied", className: "bg-blue-50 text-blue-700" },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-emerald-50 text-emerald-900",
  },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700" },
  hired: { label: "Hired", className: "bg-green-50 text-green-900" },
  request_sent: {
    label: "Request sent",
    className: "bg-orange-50 text-orange-900",
  },
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getRankingScorePercent = (score: number) =>
  score > 1 ? Math.round(score) : Math.round(score * 100);

const getRankingBadge = (scorePercent: number, index: number) => {
  if (index === 0 && scorePercent >= 90) return "Best Match";
  if (index === 1 && scorePercent >= 80) return "Great Match";
  if (index === 2 && scorePercent >= 70) return "Good Match";
  return "";
};

const fetchApplications = async (
  jobId: string,
): Promise<{ data: Application[]; error?: string }> => {
  try {
    const response = await fetch(`/api/jobs/${jobId}/applications`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        `HTTP ${response.status}: Failed to fetch applications`;
      return { data: [], error: errorMessage };
    }

    const data = await response.json();
    return { data, error: undefined };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error";
    return { data: [], error: errorMessage };
  }
};

export default function CandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const jobIdParam = Array.isArray(params.jobId)
    ? params.jobId[0]
    : params.jobId;
  const currentJobId = typeof jobIdParam === "string" ? jobIdParam : "";
  const {
    jobs,
    hasFetched,
    fetchJobs,
    isLoading: isJobsLoading,
  } = useEmployerJobsStore();

  const currentJob = useMemo(() => {
    if (!currentJobId) return null;
    return jobs.find((job) => job.id === currentJobId) ?? null;
  }, [currentJobId, jobs]);

  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("ai_ranking");
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [applicationsError, setApplicationsError] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>({
    availability: [],
    jobType: [],
    workArrangement: [],
    verifiedOnly: false,
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    number | null
  >(null);
  const [selectedRankingId, setSelectedRankingId] = useState<number | null>(
    null,
  );
  const [selectedCandidateSlug, setSelectedCandidateSlug] = useState<
    string | null
  >(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const didMountRef = useRef(false);

  const { data: candidateProfiles = [] } = useCandidateProfiles();
  const candidateProfilesBySlug = useMemo(() => {
    const map = new Map<string, CandidateProfile>();
    candidateProfiles.forEach((profile) => {
      map.set(profile.slug, profile);
    });
    return map;
  }, [candidateProfiles]);

  const availabilityOptions = useMemo(() => {
    const values = candidateProfiles.map((profile) => profile.availability);
    return mergeOptions([], values).sort();
  }, [candidateProfiles]);

  const jobTypeOptions = useMemo(() => {
    const values = candidateProfiles.map((profile) => profile.job_type);
    return mergeOptions(DEFAULT_JOB_TYPES, values);
  }, [candidateProfiles]);

  const workArrangementOptions = useMemo(() => {
    const values = candidateProfiles.map((profile) => profile.work_arrangement);
    return mergeOptions(DEFAULT_WORK_ARRANGEMENTS, values);
  }, [candidateProfiles]);

  const hasActiveFilters =
    filters.verifiedOnly ||
    filters.availability.length > 0 ||
    filters.jobType.length > 0 ||
    filters.workArrangement.length > 0;

  const activeFilterCount =
    filters.availability.length +
    filters.jobType.length +
    filters.workArrangement.length +
    (filters.verifiedOnly ? 1 : 0);

  const {
    isRanking,
    rankingStatus,
    rankedCandidates,
    isFetchingRankingData,
    error: rankingError,
    triggerRanking,
    clearError,
  } = useAIRanking();

  const {
    data: selectedCandidateProfile,
    isLoading: isCandidateLoading,
    error: candidateError,
  } = useCandidateProfile(selectedCandidateSlug || "");

  const filteredApplications = useMemo(() => {
    const currentTabConfig = TABS.find((tab) => tab.id === activeTab);
    const status = currentTabConfig?.status;
    const baseList = status
      ? allApplications.filter((app) => app.status === status)
      : allApplications;

    if (!searchQuery.trim()) return baseList;

    const query = searchQuery.toLowerCase();
    return baseList.filter((app) => {
      const profile = candidateProfilesBySlug.get(app.candidate.slug);
      const nameMatch = app.candidate.name.toLowerCase().includes(query);
      const emailMatch = app.candidate.email.toLowerCase().includes(query);
      const locationMatch = profile?.location?.toLowerCase().includes(query);
      const roleMatch =
        profile?.job_type?.toLowerCase().includes(query) ||
        profile?.work_arrangement?.toLowerCase().includes(query);
      const matchesQuery =
        nameMatch || emailMatch || locationMatch || roleMatch;

      if (!matchesQuery) return false;

      if (filters.verifiedOnly && !profile?.is_verified) {
        return false;
      }

      if (filters.availability.length > 0) {
        const availability = normalizeFilterValue(profile?.availability);
        const matchesAvailability = filters.availability.some(
          (value) => normalizeFilterValue(value) === availability
        );
        if (!matchesAvailability) return false;
      }

      if (filters.jobType.length > 0) {
        const jobType = normalizeFilterValue(profile?.job_type);
        const matchesJobType = filters.jobType.some(
          (value) => normalizeFilterValue(value) === jobType
        );
        if (!matchesJobType) return false;
      }

      if (filters.workArrangement.length > 0) {
        const workArrangement = normalizeFilterValue(profile?.work_arrangement);
        const matchesArrangement = filters.workArrangement.some(
          (value) => normalizeFilterValue(value) === workArrangement
        );
        if (!matchesArrangement) return false;
      }

      return true;
    });
  }, [allApplications, activeTab, searchQuery, candidateProfilesBySlug, filters]);

  const totalItems = filteredApplications.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredApplications.slice(startIndex, endIndex);
  }, [filteredApplications, currentPage]);

  const selectedApplication = useMemo(() => {
    if (!selectedApplicationId) return null;
    return (
      filteredApplications.find((app) => app.id === selectedApplicationId) ??
      null
    );
  }, [filteredApplications, selectedApplicationId]);

  const selectedRankedCandidate = useMemo(() => {
    if (!selectedRankingId) return null;
    return (
      rankedCandidates.find(
        (candidate) => candidate.candidate_id === selectedRankingId,
      ) ?? null
    );
  }, [rankedCandidates, selectedRankingId]);

  const selectedListKey = useMemo(() => {
    if (activeTab === "ai_ranking") {
      return selectedRankingId ? `ranking-${selectedRankingId}` : null;
    }
    return selectedApplicationId
      ? `application-${selectedApplicationId}`
      : null;
  }, [activeTab, selectedRankingId, selectedApplicationId]);

  const profileHref = useMemo(() => {
    if (
      !selectedCandidateProfile ||
      selectedCandidateProfile.slug !== selectedCandidateSlug
    ) {
      return undefined;
    }
    const applicationId =
      activeTab === "ai_ranking"
        ? selectedRankedCandidate?.application_id
        : selectedApplication?.id;
    const query = applicationId
      ? `?jobId=${currentJobId}&applicationId=${applicationId}`
      : `?jobId=${currentJobId}`;
    return `/employer/dashboard/candidates/profile/${selectedCandidateProfile.slug}${query}`;
  }, [
    selectedCandidateProfile,
    selectedCandidateSlug,
    selectedRankedCandidate,
    selectedApplication,
    activeTab,
    currentJobId,
  ]);

  const rankingInsightBase =
    selectedRankedCandidate?.match_reason ||
    (Array.isArray(selectedRankedCandidate?.reasons)
      ? selectedRankedCandidate?.reasons.join("\n")
      : undefined);
  const rankingScorePercent =
    typeof selectedRankedCandidate?.score === "number"
      ? getRankingScorePercent(selectedRankedCandidate.score)
      : null;
  const rankingInsight = rankingInsightBase
    ? rankingScorePercent !== null
      ? `Matching score: ${rankingScorePercent}%\n\n${rankingInsightBase}`
      : rankingInsightBase
    : rankingScorePercent !== null
    ? `Matching score: ${rankingScorePercent}%`
    : undefined;
  const showRankingInsight =
    activeTab === "ai_ranking" && Boolean(rankingInsight);

  const inviteCandidateId =
    selectedCandidateProfile?.id ??
    selectedRankedCandidate?.candidate_id ??
    selectedApplication?.candidate.id ??
    "";

  const canSendInvites = useMemo(
    () => activeTab === "ai_ranking" || activeTab === "shortlisted",
    [activeTab],
  );

  const jobStats = useMemo(() => {
    const stats = emptyJobStats();
    allApplications.forEach((application) => {
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
    stats.matchingCandidates = rankedCandidates.length;
    return stats;
  }, [allApplications, rankedCandidates]);

  useEffect(() => {
    if (!currentJobId) return;
    if (hasFetched && !currentJob) {
      router.replace("/employer/dashboard/listed-jobs");
    }
  }, [currentJobId, currentJob, hasFetched, router]);

  useEffect(() => {
    if (!currentJobId || !currentJob) {
      return;
    }

    let isMounted = true;
    const showLoading = activeTab !== "ai_ranking";
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    setApplicationsError(undefined);

    const loadData = async () => {
      try {
        const result = await fetchApplications(currentJobId);
        if (isMounted) {
          setAllApplications(result.data);
          setApplicationsError(result.error);
        }
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        if (isMounted && showLoading) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, currentJobId, currentJob]);


  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filters]);

  useEffect(() => {
    setSelectedCandidateSlug(null);
    setSelectedApplicationId(null);
    setSelectedRankingId(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "ai_ranking") return;
    if (paginatedApplications.length === 0) {
      setSelectedApplicationId(null);
      setSelectedCandidateSlug(null);
      return;
    }

    const selected = paginatedApplications.find(
      (app) => app.id === selectedApplicationId,
    );
    if (selected) {
      setSelectedCandidateSlug(selected.candidate.slug);
      return;
    }

    const first = paginatedApplications[0];
    setSelectedApplicationId(first.id);
    setSelectedCandidateSlug(first.candidate.slug);
  }, [activeTab, paginatedApplications, selectedApplicationId]);

  useEffect(() => {
    if (activeTab !== "ai_ranking") return;
    if (rankedCandidates.length === 0) {
      setSelectedRankingId(null);
      setSelectedCandidateSlug(null);
      return;
    }

    const selected = rankedCandidates.find(
      (candidate) => candidate.candidate_id === selectedRankingId,
    );
    if (selected) {
      setSelectedCandidateSlug(selected.candidate_slug ?? null);
      return;
    }

    const first = rankedCandidates[0];
    setSelectedRankingId(first.candidate_id);
    setSelectedCandidateSlug(first.candidate_slug ?? null);
  }, [activeTab, rankedCandidates, selectedRankingId]);

  useEffect(() => {
    if (!selectedListKey) return;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (typeof window === "undefined") return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const targetId = isDesktop
      ? `job-candidate-details-desktop-${selectedListKey}`
      : `job-candidate-details-inline-${selectedListKey}`;

    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      if (!isDesktop) {
        target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      }

      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    });
  }, [selectedListKey]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  }, []);

  const toggleFilter = useCallback(
    (key: keyof Omit<CandidateFilters, "verifiedOnly">, value: string) => {
      setFilters((prev) => {
        const currentValues = prev[key];
        const nextValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];
        return { ...prev, [key]: nextValues };
      });
    },
    []
  );

  const handleVerifiedToggle = useCallback(() => {
    setFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      availability: [],
      jobType: [],
      workArrangement: [],
      verifiedOnly: false,
    });
  }, []);

  const handleInviteClick = useCallback(() => {
    if (!hasFetched && !isJobsLoading) {
      fetchJobs();
    }
    setIsInviteModalOpen(true);
  }, [fetchJobs, hasFetched, isJobsLoading]);

  const handleSendInvites = useCallback(
    async (selectedJobIds: string[]) => {
      if (!inviteCandidateId) {
        setToastMessage("Unable to send invites. Candidate not available.");
        return;
      }
      if (selectedJobIds.length === 0 || isSendingInvites) {
        return;
      }

      setToastMessage(null);
      setInviteMessage(null);
      setIsSendingInvites(true);

      try {
        const results = await Promise.allSettled(
          selectedJobIds.map((jobId) =>
            invitesAPI.sendJobInvite(jobId, inviteCandidateId)
          )
        );

        const messages: string[] = [];
        const errors: string[] = [];

        results.forEach((result, index) => {
          const jobId = selectedJobIds[index];
          if (result.status === "fulfilled") {
            const detail = result.value?.detail || "Invite sent successfully";
            messages.push(`Job ${jobId}: ${detail}`);
          } else {
            errors.push(
              `Job ${jobId}: ${getApiErrorMessage(
                result.reason,
                "Failed to send invite"
              )}`
            );
          }
        });

        if (messages.length > 0) {
          setInviteMessage(messages.join("\n"));
          setIsSuccessModalOpen(true);
          setIsInviteModalOpen(false);
        }

        if (errors.length > 0) {
          setToastMessage(errors.join(" "));
        }
      } finally {
        setIsSendingInvites(false);
      }
    },
    [inviteCandidateId, isSendingInvites]
  );

  if (!currentJobId || !hasFetched) {
    return (
      <div className="flex h-full items-center justify-center text-slate-700">
        Loading candidates...
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="flex h-full items-center justify-center text-slate-700">
        Redirecting to listed jobs...
      </div>
    );
  }

  const jobHeaderInfo = toJobHeaderInfo(currentJob);
  const isProfileReady =
    Boolean(selectedCandidateProfile) &&
    selectedCandidateProfile?.slug === selectedCandidateSlug;

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-360 flex-col gap-6 p-4 sm:p-6">
      <div className="shrink-0">
        <JobHeader jobInfo={jobHeaderInfo} stats={jobStats} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#C27803] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col lg:col-span-4">
            {activeTab !== "ai_ranking" ? (
              <>
                <form
                  onSubmit={(event) => event.preventDefault()}
                  className="mb-5 flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search candidates"
                      aria-label="Search candidates"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-700 shadow-sm focus:border-[#C27803] focus:outline-none focus:ring-2 focus:ring-[#C27803]/20"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFiltersOpen((prev) => !prev)}
                    aria-expanded={isFiltersOpen}
                    aria-controls="job-candidate-filters"
                    className="flex items-center gap-2 rounded-xl bg-[#D95F35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B84D28]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters{hasActiveFilters ? ` (${activeFilterCount})` : ""}
                  </button>
                </form>

                {isFiltersOpen && (
                  <div
                    id="job-candidate-filters"
                    className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold text-slate-900">
                        Filters
                      </h2>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-700"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <fieldset className="space-y-2">
                        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Availability
                        </legend>
                        {availabilityOptions.length > 0 ? (
                          availabilityOptions.map((option) => {
                            const id = `job-filter-availability-${normalizeFilterValue(option)}`;
                            return (
                              <label
                                key={option}
                                htmlFor={id}
                                className="flex items-center gap-2 text-sm text-slate-700"
                              >
                                <input
                                  id={id}
                                  type="checkbox"
                                  checked={filters.availability.includes(option)}
                                  onChange={() =>
                                    toggleFilter("availability", option)
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-[#C27803] focus:ring-[#C27803]"
                                />
                                {option}
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400">
                            No availability data yet.
                          </p>
                        )}
                      </fieldset>

                      <fieldset className="space-y-2">
                        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Work Arrangement
                        </legend>
                        {workArrangementOptions.length > 0 ? (
                          workArrangementOptions.map((option) => {
                            const id = `job-filter-work-${normalizeFilterValue(option)}`;
                            return (
                              <label
                                key={option}
                                htmlFor={id}
                                className="flex items-center gap-2 text-sm text-slate-700"
                              >
                                <input
                                  id={id}
                                  type="checkbox"
                                  checked={filters.workArrangement.includes(option)}
                                  onChange={() =>
                                    toggleFilter("workArrangement", option)
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-[#C27803] focus:ring-[#C27803]"
                                />
                                {option}
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400">
                            No work modes listed.
                          </p>
                        )}
                      </fieldset>

                      <fieldset className="space-y-2">
                        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Job Type
                        </legend>
                        {jobTypeOptions.length > 0 ? (
                          jobTypeOptions.map((option) => {
                            const id = `job-filter-type-${normalizeFilterValue(option)}`;
                            return (
                              <label
                                key={option}
                                htmlFor={id}
                                className="flex items-center gap-2 text-sm text-slate-700"
                              >
                                <input
                                  id={id}
                                  type="checkbox"
                                  checked={filters.jobType.includes(option)}
                                  onChange={() => toggleFilter("jobType", option)}
                                  className="h-4 w-4 rounded border-slate-300 text-[#C27803] focus:ring-[#C27803]"
                                />
                                {option}
                              </label>
                            );
                          })
                        ) : (
                          <p className="text-xs text-slate-400">
                            No job types listed.
                          </p>
                        )}
                      </fieldset>

                      <fieldset className="space-y-2">
                        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Verification
                        </legend>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={handleVerifiedToggle}
                            className="h-4 w-4 rounded border-slate-300 text-[#C27803] focus:ring-[#C27803]"
                          />
                          Verified candidates only
                        </label>
                      </fieldset>
                    </div>
                  </div>
                )}

                {applicationsError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <p className="font-semibold">Failed to load applications</p>
                    <p className="mt-1">{applicationsError}</p>
                    <button
                      onClick={() => {
                        setApplicationsError(undefined);
                        fetchApplications(currentJobId).then((result) => {
                          setAllApplications(result.data);
                          setApplicationsError(result.error);
                        });
                      }}
                      className="mt-3 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 lg:pr-2 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent">
                    {isLoading ? (
                      <CandidateListSkeleton count={5} />
                    ) : paginatedApplications.length > 0 ? (
                      paginatedApplications.map((application) => {
                        const profile = candidateProfilesBySlug.get(
                          application.candidate.slug,
                        );
                        const headlineParts = [
                          profile?.job_type,
                          profile?.work_arrangement,
                        ].filter(Boolean);
                        const subtitle =
                          headlineParts.length > 0
                            ? headlineParts.join(" • ")
                            : application.candidate.email;
                        const meta = [
                          profile?.location && {
                            icon: (
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            ),
                            text: profile.location,
                          },
                          profile?.job_type && {
                            icon: (
                              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                            ),
                            text: profile.job_type,
                          },
                          application.applied_at && {
                            icon: (
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                            ),
                            text: `Applied ${formatDate(application.applied_at)}`,
                          },
                        ].filter(Boolean) as {
                          icon: React.ReactNode;
                          text: string;
                        }[];
                        const statusBadge = STATUS_BADGES[application.status];
                        const listKey = `application-${application.id}`;

                        return (
                          <div key={application.id} className="space-y-4">
                            <CandidateSummaryCard
                              name={application.candidate.name}
                              subtitle={subtitle}
                              avatarUrl={application.candidate.avatar}
                              badges={[
                                {
                                  label: statusBadge.label,
                                  className: statusBadge.className,
                                },
                              ]}
                              meta={meta}
                              isSelected={
                                selectedApplicationId === application.id
                              }
                              onClick={() => {
                                setSelectedApplicationId(application.id);
                                setSelectedCandidateSlug(
                                  application.candidate.slug,
                                );
                              }}
                            />
                            {selectedApplicationId === application.id && (
                              <div
                                id={`job-candidate-details-inline-${listKey}`}
                                tabIndex={-1}
                                className="lg:hidden"
                              >
                                {isProfileReady && selectedCandidateProfile ? (
                                  <div className="space-y-4">
                                    {application.status === "applied" && (
                                      <div className="rounded-2xl bg-white p-4 shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-900">
                                          Candidate actions
                                        </h3>
                                        <div className="mt-3">
                                          <CandidateDecisionButtons
                                            jobId={currentJobId}
                                            applicationId={application.id}
                                            variant="compact"
                                            currentStatus={undefined}
                                            onDecisionUpdate={() => {
                                              fetchApplications(
                                                currentJobId,
                                              ).then((result) => {
                                                setAllApplications(result.data);
                                                setApplicationsError(
                                                  result.error,
                                                );
                                              });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                    <CandidateDetailPanel
                                      candidate={selectedCandidateProfile}
                                      profileHref={profileHref}
                                      onInviteClick={
                                        canSendInvites
                                          ? handleInviteClick
                                          : undefined
                                      }
                                    />
                                  </div>
                                ) : isCandidateLoading ? (
                                  <CandidateDetailSkeleton />
                                ) : null}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <p className="text-slate-700">
                          No candidates found in this category.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {totalPages > 1 && !applicationsError && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={totalItems}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-0 flex-col gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        AI Candidate Ranking
                      </p>
                      <p className="text-xs text-slate-700">
                        Let AI analyze and rank candidates for this job.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto">
                      {isFetchingRankingData && !isRanking && (
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-[#C27803]"></span>
                          Loading ranking data...
                        </div>
                      )}
                      <button
                        onClick={() => triggerRanking(currentJobId)}
                        disabled={isRanking}
                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                          isRanking
                            ? "bg-slate-200 text-slate-400"
                            : "bg-[#C27803] text-white hover:bg-orange-950"
                        }`}
                      >
                        {isRanking ? "Ranking..." : "Rank Candidates"}
                      </button>
                    </div>
                  </div>
                </div>

                {rankingError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <div className="flex items-center justify-between gap-3">
                      <p>{rankingError}</p>
                      <button
                        onClick={clearError}
                        className="text-xs font-semibold text-red-800"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 lg:pr-2 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent">
                  {isRanking ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      AI is ranking candidates...
                    </div>
                  ) : isFetchingRankingData ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      Loading ranking data...
                    </div>
                  ) : rankedCandidates.length > 0 ? (
                    rankedCandidates.map((candidate, index) => {
                      const profile = candidate.candidate_slug
                        ? candidateProfilesBySlug.get(candidate.candidate_slug)
                        : undefined;
                      const scorePercent = getRankingScorePercent(
                        candidate.score,
                      );
                      const badge = getRankingBadge(scorePercent, index);
                      const headlineParts = [
                        profile?.job_type,
                        profile?.work_arrangement,
                      ].filter(Boolean);
                      const subtitle =
                        headlineParts.length > 0
                          ? headlineParts.join(" • ")
                          : `Candidate ID ${candidate.candidate_id}`;
                      const meta = [
                        profile?.location && {
                          icon: (
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          ),
                          text: profile.location,
                        },
                        profile?.job_type && {
                          icon: (
                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          ),
                          text: profile.job_type,
                        },
                      ].filter(Boolean) as {
                        icon: React.ReactNode;
                        text: string;
                      }[];
                      const listKey = `ranking-${candidate.candidate_id}`;

                      return (
                        <div key={candidate.candidate_id} className="space-y-4">
                          <CandidateSummaryCard
                            name={
                              profile
                                ? `${profile.first_name} ${profile.last_name}`
                                : `Candidate ${candidate.candidate_id}`
                            }
                            subtitle={subtitle}
                            badges={
                              badge
                                ? [
                                    {
                                      label: badge,
                                      className:
                                        "bg-emerald-50 text-emerald-900",
                                    },
                                  ]
                                : []
                            }
                            meta={meta}
                            score={{ value: scorePercent, label: "Matching" }}
                            isSelected={
                              selectedRankingId === candidate.candidate_id
                            }
                            onClick={() => {
                              setSelectedRankingId(candidate.candidate_id);
                              setSelectedCandidateSlug(
                                candidate.candidate_slug ?? null,
                              );
                            }}
                          />
                          {selectedRankingId === candidate.candidate_id && (
                            <div
                              id={`job-candidate-details-inline-${listKey}`}
                              tabIndex={-1}
                              className="lg:hidden"
                            >
                              {isProfileReady && selectedCandidateProfile ? (
                                <div className="space-y-4">
                                  <CandidateDetailPanel
                                    candidate={selectedCandidateProfile}
                                    profileHref={profileHref}
                                    onInviteClick={
                                      canSendInvites
                                        ? handleInviteClick
                                        : undefined
                                    }
                                    showInsight={showRankingInsight}
                                    insightText={rankingInsight}
                                    insightTitle="Match reason"
                                    insightPlacement="top"
                                  />
                                </div>
                              ) : isCandidateLoading ? (
                                <CandidateDetailSkeleton />
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : rankingStatus === "not_started" ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      Click &quot;Rank Candidates&quot; to start AI ranking.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      No ranked candidates available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:col-span-8 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent pb-10">
            {isProfileReady && selectedCandidateProfile ? (
              <div
                id={
                  selectedListKey
                    ? `job-candidate-details-desktop-${selectedListKey}`
                    : undefined
                }
                tabIndex={-1}
                className="space-y-4"
              >
                {activeTab !== "ai_ranking" &&
                  selectedApplication?.status === "applied" && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Candidate actions
                      </h3>
                      <div className="mt-3">
                        <CandidateDecisionButtons
                          jobId={currentJobId}
                          applicationId={selectedApplication.id}
                          variant="full"
                          currentStatus={undefined}
                          onDecisionUpdate={() => {
                            fetchApplications(currentJobId).then((result) => {
                              setAllApplications(result.data);
                              setApplicationsError(result.error);
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}

                <CandidateDetailPanel
                  candidate={selectedCandidateProfile}
                  profileHref={profileHref}
                  onInviteClick={canSendInvites ? handleInviteClick : undefined}
                  showInsight={showRankingInsight}
                  insightText={rankingInsight}
                  insightTitle="Match reason"
                  insightPlacement="top"
                />
              </div>
            ) : isCandidateLoading ? (
              <CandidateDetailSkeleton />
            ) : (
              <div className="rounded-[28px] bg-white p-8 text-center text-slate-700 shadow-sm">
                {candidateError
                  ? "Unable to load candidate details."
                  : "Select a candidate to view their profile."}
              </div>
            )}
          </div>
        </div>
      </div>

      <SendInvitesModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvites={handleSendInvites}
        restrictToJobId={currentJobId || undefined}
        isSending={isSendingInvites}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={inviteMessage ?? undefined}
      />
      {toastMessage && (
        <Toast
          tone="error"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
