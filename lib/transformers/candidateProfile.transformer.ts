import type { CandidateProfile } from "@/lib/types/candidateProfile";

/**
 * Backend response structure from /api/candidates/profiles/
 */
type BackendCandidateProfile = {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
  };
  slug: string;
  resume_file?: string;
  resume_data?: {
    skills?: string[];
    experience?: string;
    education?: string;
    summary?: string;
  };
  employment_type_preferences?: string[];
  work_mode_preferences?: string[];
  expected_salary_range?: string;
  is_available?: boolean;
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  video_pitch?: string;
  visa_sponsorship_required?: boolean;
  willing_to_relocate?: boolean;
  organization?: {
    id: string;
    name: string;
    headquarter_location?: string;
  };
  created_at?: string;
  updated_at?: string;
};

/**
 * Parse salary range string (e.g., "60000-80000") to min/max numbers
 */
function parseSalaryRange(range?: string): {
  salary_min?: number;
  salary_max?: number;
} {
  if (!range || typeof range !== "string") {
    return {};
  }

  const parts = range.split("-").map((s) => s.trim());
  if (parts.length !== 2) {
    return {};
  }

  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);

  return {
    salary_min: isNaN(min) ? undefined : min,
    salary_max: isNaN(max) ? undefined : max,
  };
}

/**
 * Transform backend candidate profile to frontend format
 */
export function transformCandidateProfile(
  backend: BackendCandidateProfile
): CandidateProfile {
  const salary = parseSalaryRange(backend.expected_salary_range);

  return {
    id: backend.user.id,
    slug: backend.slug,
    user_id: backend.user.id,
    first_name: backend.user.first_name || "",
    last_name: backend.user.last_name || "",
    email: backend.user.email,
    location: backend.organization?.headquarter_location,

    // Resume
    resume_url: backend.resume_file,
    resume_file: backend.resume_file,
    resume_parsed: backend.resume_data,

    // Verified data
    is_verified: backend.user.is_verified,

    // Work preferences
    job_type: backend.employment_type_preferences?.[0],
    work_arrangement: backend.work_mode_preferences?.[0],
    availability: backend.is_available ? "Available" : "Not available",
    salary_min: salary.salary_min,
    salary_max: salary.salary_max,
    visa_required: backend.visa_sponsorship_required,
    willing_to_relocate: backend.willing_to_relocate,

    // Additional info
    video_pitch: backend.video_pitch,
    bio: backend.bio,
    linkedin: backend.linkedin,
    github: backend.github,
    portfolio: backend.portfolio,

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
