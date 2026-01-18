"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useCandidateProfiles } from "@/lib/hooks/useCandidateProfiles";
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
import type { CandidateProfile } from "@/lib/types/candidateProfile";

const ITEMS_PER_PAGE = 12;

const hasValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
};

const getCandidateProfileScore = (candidate: CandidateProfile) => {
  const fields = [
    candidate.bio,
    candidate.location,
    candidate.resume_url,
    candidate.resume_parsed?.summary,
    candidate.resume_parsed?.skills?.length,
    candidate.resume_parsed?.experience,
    candidate.resume_parsed?.education,
    candidate.job_type,
    candidate.work_arrangement,
    candidate.availability,
    candidate.salary_min ?? candidate.salary_max,
    candidate.linkedin,
    candidate.github,
    candidate.portfolio,
    candidate.video_pitch,
  ];

  const filled = fields.filter(hasValue).length;
  if (!fields.length) return 0;
  const score = Math.round((filled / fields.length) * 100);
  return Math.max(35, score);
};

export default function CandidatesListPage() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("search") || "";
  const { data: candidates = [], isLoading, error } = useCandidateProfiles();
  const {
    fetchJobs,
    hasFetched: hasFetchedJobs,
    isLoading: isJobsLoading,
  } = useEmployerJobsStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [localQuery, setLocalQuery] = useState(queryFromUrl);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null
  );
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const didMountRef = useRef(false);

  useEffect(() => {
    setLocalQuery(queryFromUrl);
  }, [queryFromUrl]);

  const filteredCandidates = useMemo(() => {
    if (!localQuery.trim()) return candidates;

    const query = localQuery.toLowerCase();
    return candidates.filter((candidate) => {
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
    });
  }, [candidates, localQuery]);

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

  const profileScores = useMemo(() => {
    const scores = new Map<string, number>();
    filteredCandidates.forEach((candidate) => {
      scores.set(candidate.id, getCandidateProfileScore(candidate));
    });
    return scores;
  }, [filteredCandidates]);

  useEffect(() => {
    setCurrentPage(1);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
              className="flex items-center gap-2 rounded-xl bg-[#D95F35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B84D28]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </form>

          <div className="space-y-4 lg:pr-2 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent">
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => {
                const isSelected = selectedCandidateId === candidate.id;
                const profileScore = profileScores.get(candidate.id) ?? 0;

                return (
                  <div key={candidate.id} className="space-y-4">
                    <CandidateDirectoryCard
                      candidate={candidate}
                      isSelected={isSelected}
                      profileScore={profileScore}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                    />
                    {isSelected && selectedCandidate && (
                      <div
                        id={`candidate-details-inline-${candidate.id}`}
                        tabIndex={-1}
                        className="lg:hidden"
                      >
                        <CandidateDetailPanel
                          candidate={selectedCandidate}
                          profileScore={profileScore}
                          onInviteClick={handleInviteClick}
                        />
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
          {selectedCandidate ? (
            <div
              id={`candidate-details-desktop-${selectedCandidateId}`}
              tabIndex={-1}
            >
              <CandidateDetailPanel
                candidate={selectedCandidate}
                profileScore={profileScores.get(selectedCandidate.id) ?? 0}
                onInviteClick={handleInviteClick}
              />
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
