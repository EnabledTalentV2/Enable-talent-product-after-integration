import type { CandidateProfile } from "@/lib/types/candidateProfile";

/**
 * Backend response structure from /api/candidates/profiles/
 * Updated to match the actual API response format
 */
type BackendCandidateProfile = {
  id: number | string;
  slug: string;
  name?: string;
  title?: string | null;
  location?: string | null;
  about?: string | null;
  is_available?: boolean;
  matching_score?: number | null;
  work_preferences?: {
    employment_type?: string[];
    work_mode?: string[];
    relocation?: boolean;
    has_workvisa?: boolean;
  };
  skills?: string[];
  work_experience?: Array<{
    company?: string;
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    start_date?: string;
    end_date?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  created_at?: string;
  updated_at?: string;
};

/**
 * Parse name string into first and last name
 */
function parseName(name?: string): { first_name: string; last_name: string } {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { first_name: "", last_name: "" };
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: "" };
  }

  const first_name = parts[0];
  const last_name = parts.slice(1).join(" ");
  return { first_name, last_name };
}

/**
 * Format work experience for resume_parsed
 */
function formatExperience(
  experience?: BackendCandidateProfile["work_experience"]
): string | undefined {
  if (!experience || experience.length === 0) return undefined;

  return experience
    .map((exp) => {
      const parts = [exp.title, exp.company].filter(Boolean);
      return parts.join(" at ");
    })
    .filter(Boolean)
    .join("; ");
}

/**
 * Format education for resume_parsed
 */
function formatEducation(
  education?: BackendCandidateProfile["education"]
): string | undefined {
  if (!education || education.length === 0) return undefined;

  return education
    .map((edu) => {
      const parts = [edu.degree, edu.field, edu.institution].filter(Boolean);
      return parts.join(", ");
    })
    .filter(Boolean)
    .join("; ");
}

/**
 * Transform backend candidate profile to frontend format
 */
export function transformCandidateProfile(
  backend: BackendCandidateProfile
): CandidateProfile {
  const { first_name, last_name } = parseName(backend.name);

  return {
    id: String(backend.id),
    slug: backend.slug,
    user_id: String(backend.id),
    first_name,
    last_name,
    email: backend.links?.linkedin || "", // Using linkedin as email fallback since email isn't in response
    location: backend.location || undefined,

    // Resume parsed data from skills, work_experience, education
    resume_parsed: {
      skills: backend.skills,
      experience: formatExperience(backend.work_experience),
      education: formatEducation(backend.education),
      summary: backend.about || undefined,
    },

    // Work preferences
    job_type: backend.work_preferences?.employment_type?.[0],
    work_arrangement: backend.work_preferences?.work_mode?.[0],
    availability: backend.is_available ? "Available" : "Not available",
    visa_required: backend.work_preferences?.has_workvisa === false,
    willing_to_relocate: backend.work_preferences?.relocation,

    // Additional info
    bio: backend.about || undefined,
    linkedin: backend.links?.linkedin,
    github: backend.links?.github,
    portfolio: backend.links?.portfolio,

    // Timestamps
    created_at: backend.created_at,
    updated_at: backend.updated_at,
  };
}

/**
 * Transform array of backend candidate profiles
 */
export function transformCandidateProfiles(
  backendProfiles: BackendCandidateProfile[]
): CandidateProfile[] {
  return backendProfiles.map(transformCandidateProfile);
}
