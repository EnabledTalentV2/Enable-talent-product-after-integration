"use client";

import { useCallback, useState } from "react";
import { apiRequest, getApiErrorMessage, type ApiResult } from "@/lib/api-client";

export type CandidateProfileSummary = {
  raw: unknown;
  profile: Record<string, unknown> | null;
  email: string;
  slug: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeCandidateProfile = (data: unknown): CandidateProfileSummary => {
  let profile: Record<string, unknown> | null = null;

  if (Array.isArray(data)) {
    profile = isRecord(data[0]) ? data[0] : null;
  } else if (isRecord(data)) {
    if (Array.isArray(data.results)) {
      const first = data.results[0];
      profile = isRecord(first) ? first : data;
    } else {
      profile = data;
    }
  }

  const email =
    profile &&
    (typeof profile.email === "string"
      ? profile.email
      : isRecord(profile.user) && typeof profile.user.email === "string"
      ? profile.user.email
      : "");
  const slug =
    profile &&
    (typeof profile.slug === "string"
      ? profile.slug
      : typeof profile.candidateSlug === "string"
      ? profile.candidateSlug
      : typeof profile.candidate_slug === "string"
      ? profile.candidate_slug
      : null);

  return {
    raw: data,
    profile,
    email: email || "",
    slug: slug ?? null,
  };
};

export function useFetchCandidateProfile() {
  const [data, setData] = useState<CandidateProfileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCandidateProfile = useCallback(
    async (slug?: string): Promise<ApiResult<CandidateProfileSummary>> => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = slug
          ? `/api/candidates/profiles/${slug}/`
          : "/api/candidates/profiles/";
        const raw = await apiRequest<unknown>(endpoint, { method: "GET" });
        const summary = normalizeCandidateProfile(raw);
        setData(summary);
        return { data: summary, error: null };
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Failed to fetch candidate profile."
        );
        setError(message);
        return { data: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { data, error, isLoading, fetchCandidateProfile, clearError };
}
