"use client";

import { create } from "zustand";
import { apiRequest } from "@/lib/api-client";

// Types matching the API response
export type SelectedCandidateJob = {
  id: number;
  title: string;
};

export type SelectedCandidate = {
  id: number;
  candidateId: number;
  candidateSlug: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  matchPercent: number;
  status: "accepted" | "Active" | "Inactive";
  avatarUrl: string | null;
  job: SelectedCandidateJob;
  acceptedAt: string;
};

export type SelectedCandidatesPagination = {
  page: number;
  pageSize: number;
  total: number;
};

// Backend response types
type BackendSelectedCandidate = {
  id: number;
  candidate_id: number;
  candidate_slug: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  match_percent: number;
  status: string;
  avatar_path: string | null;
  job: {
    id: number;
    title: string;
  };
  accepted_at: string;
};

type BackendResponse = {
  media_base_url: string;
  results: BackendSelectedCandidate[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
};

// Transform backend response to frontend format
function parseSelectedCandidate(
  candidate: BackendSelectedCandidate,
  mediaBaseUrl: string
): SelectedCandidate {
  return {
    id: candidate.id,
    candidateId: candidate.candidate_id,
    candidateSlug: candidate.candidate_slug,
    name: candidate.name,
    role: candidate.role,
    location: candidate.location,
    experience: candidate.experience,
    matchPercent: candidate.match_percent,
    status: candidate.status as SelectedCandidate["status"],
    avatarUrl: candidate.avatar_path
      ? `${mediaBaseUrl}${candidate.avatar_path}`
      : null,
    job: candidate.job,
    acceptedAt: candidate.accepted_at,
  };
}

type SelectedCandidatesStore = {
  candidates: SelectedCandidate[];
  pagination: SelectedCandidatesPagination | null;
  isLoading: boolean;
  hasFetched: boolean;
  fetchSelectedCandidates: () => Promise<void>;
  resetSelectedCandidates: () => void;
};

export const useSelectedCandidatesStore = create<SelectedCandidatesStore>(
  (set) => ({
    candidates: [],
    pagination: null,
    isLoading: false,
    hasFetched: false,
    fetchSelectedCandidates: async () => {
      set({ isLoading: true });
      try {
        console.log("[Selected Candidates Store] Fetching from API...");
        const data = await apiRequest<BackendResponse>(
          `/api/organization/selected-candidates/`,
          { method: "GET" }
        );
        console.log("[Selected Candidates Store] Received data:", data);

        const mediaBaseUrl = data.media_base_url || "";
        const parsedCandidates = data.results.map((candidate) =>
          parseSelectedCandidate(candidate, mediaBaseUrl)
        );

        console.log(
          "[Selected Candidates Store] Parsed candidates:",
          parsedCandidates.length
        );

        set({
          candidates: parsedCandidates,
          pagination: {
            page: data.pagination.page,
            pageSize: data.pagination.page_size,
            total: data.pagination.total,
          },
          hasFetched: true,
          isLoading: false,
        });
      } catch (error) {
        console.error(
          "[Selected Candidates Store] Failed to fetch candidates:",
          error
        );
        set({ candidates: [], pagination: null, hasFetched: true, isLoading: false });
      }
    },
    resetSelectedCandidates: () =>
      set({ candidates: [], pagination: null, isLoading: false, hasFetched: false }),
  })
);
