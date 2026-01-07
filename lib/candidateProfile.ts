import { apiRequest } from "@/lib/api-client";

const PROFILE_ENDPOINT = "/api/candidates/profiles/";

export const DEFAULT_ACCOMMODATION_NEEDS = "PREFER_TO_DISCUSS_LATER";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeCandidateProfileRecord = (
  payload: unknown
): Record<string, unknown> | null => {
  if (Array.isArray(payload)) {
    const first = payload[0];
    return isRecord(first) ? first : null;
  }

  if (!isRecord(payload)) return null;

  if (Array.isArray(payload.results)) {
    const first = payload.results[0];
    if (isRecord(first)) {
      return first;
    }
  }

  return payload;
};

export const getCandidateSlug = (payload: unknown): string | null => {
  if (Array.isArray(payload)) {
    const first = payload[0];
    return isRecord(first)
      ? typeof first.slug === "string"
        ? first.slug
        : typeof first.candidateSlug === "string"
        ? first.candidateSlug
        : typeof first.candidate_slug === "string"
        ? first.candidate_slug
        : null
      : null;
  }

  if (!isRecord(payload)) return null;

  if (Array.isArray(payload.results)) {
    const first = payload.results[0];
    if (isRecord(first)) {
      return typeof first.slug === "string"
        ? first.slug
        : typeof first.candidateSlug === "string"
        ? first.candidateSlug
        : typeof first.candidate_slug === "string"
        ? first.candidate_slug
        : null;
    }
  }

  return typeof payload.slug === "string"
    ? payload.slug
    : typeof payload.candidateSlug === "string"
    ? payload.candidateSlug
    : typeof payload.candidate_slug === "string"
    ? payload.candidate_slug
    : null;
};

type EnsureCandidateProfileSlugOptions = {
  accommodationNeeds?: string;
  initialProfiles?: unknown;
  logLabel?: string;
};

const warnWithLabel = (
  label: string | undefined,
  message: string,
  error?: unknown
) => {
  const prefix = label ? `[${label}] ` : "";
  if (error !== undefined) {
    console.warn(`${prefix}${message}`, error);
  } else {
    console.warn(`${prefix}${message}`);
  }
};

export async function ensureCandidateProfileSlug(
  options: EnsureCandidateProfileSlugOptions = {}
): Promise<string | null> {
  const { accommodationNeeds, initialProfiles, logLabel } = options;

  const fetchProfiles = async (): Promise<unknown | null> => {
    try {
      return await apiRequest<unknown>(PROFILE_ENDPOINT, { method: "GET" });
    } catch (error) {
      warnWithLabel(logLabel, "Failed to fetch candidate profile", error);
      return null;
    }
  };

  const profiles = initialProfiles ?? (await fetchProfiles());
  const initialSlug = getCandidateSlug(profiles);
  if (initialSlug) {
    return initialSlug;
  }

  let createdSlug: string | null = null;
  try {
    const formData = new FormData();
    formData.append(
      "accommodation_needs",
      accommodationNeeds || DEFAULT_ACCOMMODATION_NEEDS
    );
    const created = await apiRequest<unknown>(PROFILE_ENDPOINT, {
      method: "POST",
      body: formData,
    });
    createdSlug = getCandidateSlug(created);
  } catch (error) {
    warnWithLabel(logLabel, "Failed to create candidate profile", error);
    return null;
  }

  const refreshedProfiles = await fetchProfiles();
  const refreshedSlug = getCandidateSlug(refreshedProfiles);
  return refreshedSlug ?? createdSlug ?? null;
}

export async function fetchCandidateProfileDetail(
  slug: string,
  logLabel?: string
): Promise<Record<string, unknown> | null> {
  try {
    const data = await apiRequest<unknown>(`${PROFILE_ENDPOINT}${slug}/`, {
      method: "GET",
    });
    const profile = normalizeCandidateProfileRecord(data);
    if (!profile) {
      warnWithLabel(logLabel, "Unexpected candidate profile response");
    }
    return profile;
  } catch (error) {
    warnWithLabel(logLabel, "Failed to fetch candidate profile detail", error);
    return null;
  }
}
