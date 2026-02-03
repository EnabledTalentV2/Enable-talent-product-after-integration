"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  useCandidateProfile,
  useCandidateProfiles,
} from "@/lib/hooks/useCandidateProfiles";
import { useCandidateInsight } from "@/lib/hooks/useCandidateInsight";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import Pagination from "@/components/ui/Pagination";
import CandidateDirectoryCard from "@/components/employer/candidates/CandidateDirectoryCard";
import CandidateDetailPanel from "@/components/employer/candidates/CandidateDetailPanel";
import {
  CandidateDetailSkeleton,
  CandidateListSkeleton,
} from "@/components/employer/candidates/CandidateLoadingSkeleton";
import SendInvitesModal from "@/components/employer/candidates/SendInvitesModal";
import SuccessModal from "@/components/employer/candidates/SuccessModal";

const ITEMS_PER_PAGE = 12;

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

export default function CandidatesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const queryFromUrl = searchParams.get("search") || "";
  const pageFromUrl = useMemo(() => {
    const value = searchParams.get("page");
    const parsed = value ? Number(value) : 1;
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  }, [searchParams]);
  const { data: candidates = [], isLoading, error } = useCandidateProfiles();
  const {
    fetchJobs,
    hasFetched: hasFetchedJobs,
    isLoading: isJobsLoading,
  } = useEmployerJobsStore();
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [localQuery, setLocalQuery] = useState(queryFromUrl);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>({
    availability: [],
    jobType: [],
    workArrangement: [],
    verifiedOnly: false,
  });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const didMountRef = useRef(false);
  const didInitQueryRef = useRef(false);
  const updatePageParamRef = useRef<(page: number) => void>(() => undefined);

  useEffect(() => {
    setLocalQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  const availabilityOptions = useMemo(() => {
    const values = candidates.map((candidate) => candidate.availability);
    return mergeOptions([], values).sort();
  }, [candidates]);

  const jobTypeOptions = useMemo(() => {
    const values = candidates.map((candidate) => candidate.job_type);
    return mergeOptions(DEFAULT_JOB_TYPES, values);
  }, [candidates]);

  const workArrangementOptions = useMemo(() => {
    const values = candidates.map((candidate) => candidate.work_arrangement);
    return mergeOptions(DEFAULT_WORK_ARRANGEMENTS, values);
  }, [candidates]);

  const hasActiveFilters =
    filters.verifiedOnly ||
    filters.availability.length > 0 ||
    filters.jobType.length > 0 ||
    filters.workArrangement.length > 0;

  const filteredCandidates = useMemo(() => {
    const query = localQuery.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesQuery = !query
        ? true
        : (() => {
            const nameMatch = `${candidate.first_name} ${candidate.last_name}`
              .toLowerCase()
              .includes(query);
            const emailMatch = candidate.email?.toLowerCase().includes(query);
            const locationMatch = candidate.location?.toLowerCase().includes(query);
            const summaryMatch =
              candidate.bio?.toLowerCase().includes(query) ||
              candidate.resume_parsed?.summary?.toLowerCase().includes(query);
            const preferenceMatch =
              candidate.job_type?.toLowerCase().includes(query) ||
              candidate.work_arrangement?.toLowerCase().includes(query);
            const skillsMatch =
              candidate.resume_parsed?.skills?.some((skill) =>
                skill.toLowerCase().includes(query)
              ) || false;

            return (
              nameMatch ||
              emailMatch ||
              locationMatch ||
              summaryMatch ||
              preferenceMatch ||
              skillsMatch
            );
          })();

      if (!matchesQuery) return false;

      if (filters.verifiedOnly && !candidate.is_verified) {
        return false;
      }

      if (filters.availability.length > 0) {
        const availability = normalizeFilterValue(candidate.availability);
        const matchesAvailability = filters.availability.some(
          (value) => normalizeFilterValue(value) === availability
        );
        if (!matchesAvailability) return false;
      }

      if (filters.jobType.length > 0) {
        const jobType = normalizeFilterValue(candidate.job_type);
        const matchesJobType = filters.jobType.some(
          (value) => normalizeFilterValue(value) === jobType
        );
        if (!matchesJobType) return false;
      }

      if (filters.workArrangement.length > 0) {
        const workArrangement = normalizeFilterValue(candidate.work_arrangement);
        const matchesArrangement = filters.workArrangement.some(
          (value) => normalizeFilterValue(value) === workArrangement
        );
        if (!matchesArrangement) return false;
      }

      return true;
    });
  }, [candidates, localQuery, filters]);

  const totalItems = filteredCandidates.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCandidates.slice(startIndex, endIndex);
  }, [filteredCandidates, currentPage]);

  const selectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null;
    return (
      filteredCandidates.find((candidate) => candidate.id === selectedCandidateId) ||
      null
    );
  }, [filteredCandidates, selectedCandidateId]);

  const selectedCandidateSlug = selectedCandidate?.slug ?? "";
  const {
    data: selectedCandidateProfile,
    isLoading: isCandidateLoading,
    isFetching: isCandidateFetching,
    error: candidateError,
  } = useCandidateProfile(selectedCandidateSlug);
  const candidateId = selectedCandidate?.id;
  const {
    data: insight,
    isLoading: isInsightLoading,
    error: insightError,
  } = useCandidateInsight(candidateId);
  const isCandidateDetailLoading = isCandidateLoading || isCandidateFetching;
  const isProfileReady =
    Boolean(selectedCandidateProfile) &&
    selectedCandidateProfile?.slug === selectedCandidateSlug;
  const insightText = insight?.employer_insight?.trim();
  const profileHref = useMemo(() => {
    if (!selectedCandidateSlug) return undefined;
    const params = new URLSearchParams();
    if (queryFromUrl) params.set("search", queryFromUrl);
    if (currentPage > 1) params.set("page", String(currentPage));
    const query = params.toString();
    return query
      ? `/employer/dashboard/candidates/profile/${selectedCandidateSlug}?${query}`
      : `/employer/dashboard/candidates/profile/${selectedCandidateSlug}`;
  }, [selectedCandidateSlug, queryFromUrl, currentPage]);

  const updatePageParam = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParamsString);
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const query = params.toString();
      const nextHref = query
        ? `/employer/dashboard/candidates?${query}`
        : "/employer/dashboard/candidates";
      if (query === searchParamsString) {
        return;
      }
      router.push(nextHref);
    },
    [router, searchParamsString]
  );

  useEffect(() => {
    updatePageParamRef.current = updatePageParam;
  }, [updatePageParam]);

  useEffect(() => {
    if (!didInitQueryRef.current) {
      didInitQueryRef.current = true;
      return;
    }
    setCurrentPage(1);
    updatePageParamRef.current(1);
  }, [localQuery]);

  useEffect(() => {
    if (paginatedCandidates.length === 0) {
      setSelectedCandidateId(null);
      return;
    }

    if (
      !selectedCandidateId ||
      !paginatedCandidates.some((candidate) => candidate.id === selectedCandidateId)
    ) {
      setSelectedCandidateId(paginatedCandidates[0].id);
    }
  }, [paginatedCandidates, selectedCandidateId]);

  useEffect(() => {
    if (!selectedCandidateId) return;
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (typeof window === "undefined") return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const targetId = isDesktop
      ? `candidate-details-desktop-${selectedCandidateId}`
      : `candidate-details-inline-${selectedCandidateId}`;

    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      if (!isDesktop) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    });
  }, [selectedCandidateId]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updatePageParam(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [updatePageParam]);

  const handleInviteClick = useCallback(() => {
    if (!hasFetchedJobs && !isJobsLoading) {
      fetchJobs();
    }
    setIsInviteModalOpen(true);
  }, [fetchJobs, hasFetchedJobs, isJobsLoading]);

  const handleSendInvites = useCallback((selectedJobIds: string[]) => {
    setIsInviteModalOpen(false);
    if (selectedJobIds.length > 0) {
      setIsSuccessModalOpen(true);
    }
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

  if (error) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4 text-slate-500">
        <p className="text-lg font-medium text-red-600">
          Failed to load candidates
        </p>
        <p className="text-sm">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-360 mx-auto">
        <div className="sr-only">Loading candidates...</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col lg:col-span-4">
            <div className="mb-4 space-y-2">
              <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
              <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
            </div>

            <div className="mb-5 flex items-center gap-2">
              <div className="h-11 flex-1 rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-11 w-24 rounded-xl bg-slate-200 animate-pulse" />
            </div>

            <CandidateListSkeleton count={6} />
          </div>

          <div className="hidden lg:block lg:col-span-8 lg:pb-10">
            <CandidateDetailSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-orange-50 px-6 py-2 text-sm font-semibold text-orange-700">
          No candidates available
        </div>
        <p className="text-base text-slate-500">
          Once candidates create profiles, they will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-360 mx-auto">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-slate-900">Candidates</h1>
            <p className="text-sm text-slate-500">
              Showing {filteredCandidates.length} candidate
              {filteredCandidates.length !== 1 ? "s" : ""}
            </p>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="mb-5 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={localQuery}
                onChange={(event) => setLocalQuery(event.target.value)}
                placeholder="Search by skills, role, or location"
                aria-label="Search candidates"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-700 shadow-sm focus:border-[#C27803] focus:outline-none focus:ring-2 focus:ring-[#C27803]/20"
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() => setIsFiltersOpen((prev) => !prev)}
              aria-expanded={isFiltersOpen}
              aria-controls="candidate-filters"
              className="flex items-center gap-2 rounded-xl bg-[#D95F35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B84D28]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{hasActiveFilters ? ` (${filters.availability.length + filters.jobType.length + filters.workArrangement.length + (filters.verifiedOnly ? 1 : 0)})` : ""}
            </button>
          </form>

          {isFiltersOpen && (
            <div
              id="candidate-filters"
              className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Availability
                  </legend>
                  {availabilityOptions.length > 0 ? (
                    availabilityOptions.map((option) => {
                      const id = `filter-availability-${normalizeFilterValue(option)}`;
                      return (
                        <label
                          key={option}
                          htmlFor={id}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={filters.availability.includes(option)}
                            onChange={() => toggleFilter("availability", option)}
                            className="h-4 w-4 rounded border-slate-300 text-[#C27803] focus:ring-[#C27803]"
                          />
                          {option}
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400">No availability data yet.</p>
                  )}
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Work Arrangement
                  </legend>
                  {workArrangementOptions.length > 0 ? (
                    workArrangementOptions.map((option) => {
                      const id = `filter-work-${normalizeFilterValue(option)}`;
                      return (
                        <label
                          key={option}
                          htmlFor={id}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={filters.workArrangement.includes(option)}
                            onChange={() => toggleFilter("workArrangement", option)}
                            className="h-4 w-4 rounded border-slate-300 text-[#C27803] focus:ring-[#C27803]"
                          />
                          {option}
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400">No work modes listed.</p>
                  )}
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Job Type
                  </legend>
                  {jobTypeOptions.length > 0 ? (
                    jobTypeOptions.map((option) => {
                      const id = `filter-job-${normalizeFilterValue(option)}`;
                      return (
                        <label
                          key={option}
                          htmlFor={id}
                          className="flex items-center gap-2 text-sm text-slate-600"
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
                    <p className="text-xs text-slate-400">No job types listed.</p>
                  )}
                </fieldset>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Verification
                  </legend>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
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

          <div className="space-y-4 lg:pr-2 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent">
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => {
                const isSelected = selectedCandidateId === candidate.id;

                return (
                  <div key={candidate.id} className="space-y-4">
                    <CandidateDirectoryCard
                      candidate={candidate}
                      isSelected={isSelected}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                    />
                    {isSelected && selectedCandidate && (
                      <div
                        id={`candidate-details-inline-${candidate.id}`}
                        tabIndex={-1}
                        className="lg:hidden"
                      >
                        {isProfileReady && selectedCandidateProfile ? (
                          <CandidateDetailPanel
                            candidate={selectedCandidateProfile}
                            profileHref={profileHref}
                            onInviteClick={handleInviteClick}
                            showInsight
                            insightText={insightText}
                            isInsightLoading={isInsightLoading}
                            insightError={insightError}
                          />
                        ) : isCandidateDetailLoading ? (
                          <CandidateDetailSkeleton />
                        ) : candidateError ? (
                          <div className="rounded-[28px] bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                            Unable to load candidate details.
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">
                  {localQuery
                    ? `No candidates found matching "${localQuery}"`
                    : "No candidates available"}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
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
        </div>

        <div className="hidden lg:block lg:col-span-8 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent pb-10">
          {isProfileReady && selectedCandidateProfile ? (
            <div
              id={`candidate-details-desktop-${selectedCandidateId}`}
              tabIndex={-1}
            >
              <CandidateDetailPanel
                candidate={selectedCandidateProfile}
                profileHref={profileHref}
                onInviteClick={handleInviteClick}
                showInsight
                insightText={insightText}
                isInsightLoading={isInsightLoading}
                insightError={insightError}
              />
            </div>
          ) : isCandidateDetailLoading ? (
            <CandidateDetailSkeleton />
          ) : selectedCandidate ? (
            <div className="rounded-[28px] bg-white p-8 text-center text-slate-500 shadow-sm">
              {candidateError
                ? "Unable to load candidate details."
                : "Select a candidate to view their profile details."}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-8 text-center text-slate-500 shadow-sm">
              Select a candidate to view their profile details.
            </div>
          )}
        </div>
      </div>

      <SendInvitesModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvites={handleSendInvites}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
