import type { CandidateProfile } from "@/lib/types/candidateProfile";

/**
 * Backend response structure from /api/candidates/
 * Updated to match the actual API response format
 */
type BackendCandidateProfile = {
  id: number | string;
  slug: string;
  user?: {
    id: number | string;
    first_name?: string;
    last_name?: string;
    email?: string;
    is_active?: boolean;
    is_verified?: boolean;
    is_candidate?: boolean;
    profile?: {
      avatar?: string | null;
      phone?: string | null;
      location?: string | null;
      citizenship_status?: string | null;
      gender?: string | null;
      ethnicity?: string | null;
      linkedin_url?: string | null;
      github_url?: string | null;
      portfolio_url?: string | null;
      current_status?: string | null;
      referral_code?: string | null;
      total_referrals?: number;
    };
  };
  organization?: unknown;
  resume_file?: string | null;
  resume_data?: {
    resume_data?: {
      skills?: {
        technical?: string[];
        categories?: Record<string, unknown>;
        soft_skills?: string[];
      };
      summary?: string | null;
      projects?: Array<{ raw_text?: string | null }>;
      education?: Array<{
        grade?: string | null;
        degree?: string | null;
        end_date?: string | null;
        raw_text?: string | null;
        start_date?: string | null;
        description?: string | null;
        institution?: string | null;
        field_of_study?: string | null;
      }>;
      languages?: string[];
      achievements?: Array<{ raw_text?: string | null }>;
      personal_info?: {
        email?: string | null;
        phone?: string | null;
        location?: string | null;
        last_name?: string | null;
        first_name?: string | null;
        github_url?: string | null;
        linkedin_url?: string | null;
        portfolio_url?: string | null;
      };
      certifications?: Array<{ raw_text?: string | null }>;
      additional_info?: {
        notice_period?: string | null;
        expected_salary_max?: number | null;
        expected_salary_min?: number | null;
        preferred_work_mode?: string[];
        willing_to_relocate?: boolean | null;
        visa_sponsorship_required?: boolean | null;
      };
      work_experience?: Array<{
        company?: string | null;
        end_date?: string | null;
        location?: string | null;
        position?: string | null;
        raw_text?: string | null;
        start_date?: string | null;
        description?: string | null;
      }>;
    };
    parsing_metadata?: {
      parsing_date?: string;
      fields_failed?: string[];
      schema_version?: string;
      confidence_score?: number;
      fields_extracted?: string[];
    };
  };
  willing_to_relocate?: boolean;
  employment_type_preferences?: string[];
  work_mode_preferences?: string[];
  has_workvisa?: boolean;
  expected_salary_range?: string | null;
  video_pitch?: string | null;
  is_available?: boolean;
  get_all_notes?: unknown[];
  disability_categories?: string[];
  accommodation_needs?: string | null;
  workplace_accommodations?: string[];
  created_at?: string;
  updated_at?: string;
};

/**
 * Parse salary range string to min/max values
 */
function parseSalaryRange(
  salaryRange?: string | null
): { min?: number; max?: number } {
  if (!salaryRange) return {};

  // Handle formats like "< 40000", "40000-60000", "> 100000"
  if (salaryRange.startsWith("<")) {
    const max = parseInt(salaryRange.replace(/[<\s]/g, ""), 10);
    return { max: isNaN(max) ? undefined : max };
  }
  if (salaryRange.startsWith(">")) {
    const min = parseInt(salaryRange.replace(/[>\s]/g, ""), 10);
    return { min: isNaN(min) ? undefined : min };
  }
  if (salaryRange.includes("-")) {
    const [minStr, maxStr] = salaryRange.split("-");
    const min = parseInt(minStr.trim(), 10);
    const max = parseInt(maxStr.trim(), 10);
    return {
      min: isNaN(min) ? undefined : min,
      max: isNaN(max) ? undefined : max,
    };
  }

  return {};
}

/**
 * Extract first name from various possible locations in the backend data
 */
function extractFirstName(backend: any): string {
  return (
    backend.user?.first_name ||
    backend.first_name ||
    (backend.name ? backend.name.trim().split(/\s+/)[0] : "") ||
    ""
  );
}

/**
 * Extract last name from various possible locations in the backend data
 */
function extractLastName(backend: any): string {
  if (backend.user?.last_name) return backend.user.last_name;
  if (backend.last_name) return backend.last_name;
  if (backend.name) {
    const parts = backend.name.trim().split(/\s+/);
    return parts.slice(1).join(" ") || "";
  }
  return "";
}

/**
 * Extract email from various possible locations
 */
function extractEmail(backend: any): string {
  return (
    backend.user?.email ||
    backend.email ||
    ""
  );
}

/**
 * Extract location from various possible locations
 */
function extractLocation(backend: any): string | undefined {
  return (
    backend.user?.profile?.location ||
    backend.location ||
    undefined
  );
}

/**
 * Extract LinkedIn URL from various possible locations
 */
function extractLinkedIn(backend: any): string | undefined {
  return (
    backend.user?.profile?.linkedin_url ||
    backend.links?.linkedin ||
    backend.linkedin_url ||
    backend.linkedin ||
    undefined
  );
}

/**
 * Extract GitHub URL from various possible locations
 */
function extractGitHub(backend: any): string | undefined {
  return (
    backend.user?.profile?.github_url ||
    backend.links?.github ||
    backend.github_url ||
    backend.github ||
    undefined
  );
}

/**
 * Extract Portfolio URL from various possible locations
 */
function extractPortfolio(backend: any): string | undefined {
  return (
    backend.user?.profile?.portfolio_url ||
    backend.links?.portfolio ||
    backend.portfolio_url ||
    backend.portfolio ||
    undefined
  );
}

/**
 * Extract skills from various possible locations
 */
function extractSkills(backend: any): string[] {
  // Try nested resume_data structure first
  if (backend.resume_data?.resume_data?.skills?.technical) {
    return backend.resume_data.resume_data.skills.technical;
  }
  // Try flat skills array
  if (Array.isArray(backend.skills)) {
    return backend.skills;
  }
  return [];
}

/**
 * Extract work experience from various possible locations
 */
function extractWorkExperience(backend: any): any[] | undefined {
  return (
    backend.resume_data?.resume_data?.work_experience ||
    backend.work_experience ||
    undefined
  );
}

/**
 * Extract education from various possible locations
 */
function extractEducation(backend: any): any[] | undefined {
  return (
    backend.resume_data?.resume_data?.education ||
    backend.education ||
    undefined
  );
}

/**
 * Extract certifications from various possible locations
 */
function extractCertifications(backend: any): any[] | undefined {
  return (
    backend.resume_data?.resume_data?.certifications ||
    backend.certifications ||
    undefined
  );
}

/**
 * Extract bio/summary from various possible locations
 */
function extractBio(backend: any): string | undefined {
  return (
    backend.user?.profile?.current_status ||
    backend.resume_data?.resume_data?.summary ||
    backend.about ||
    backend.bio ||
    undefined
  );
}

/**
 * Check if the backend response uses the list format (simplified)
 * List format has: name, about, skills (flat array), links object
 */
function isListFormat(backend: any): boolean {
  return (
    typeof backend.name === "string" ||
    (Array.isArray(backend.skills) && backend.skills.length > 0 && typeof backend.skills[0] === "string") ||
    (backend.links && typeof backend.links === "object")
  );
}

/**
 * Transform backend candidate profile to frontend format
 * Uses flexible extractors to handle various API response structures
 */
export function transformCandidateProfile(
  backend: BackendCandidateProfile
): CandidateProfile {
  const skills = extractSkills(backend);
  const workExperience = extractWorkExperience(backend);
  const education = extractEducation(backend);
  const certifications = extractCertifications(backend);
  const salaryRange = parseSalaryRange(backend.expected_salary_range);

  // Format work experience - each job on its own line
  const experienceStr = workExperience?.map((exp: any) => {
    const role = exp.role || exp.position || exp.title;
    const company = exp.company;
    if (role && company) {
      return `${role} at ${company}`;
    }
    return role || company || "";
  }).filter(Boolean).join("\n");

  // Format education - each entry on its own line
  const educationStr = education?.map((edu: any) => {
    const degree = edu.degree || edu.course_name;
    const field = edu.field_of_study || edu.field || edu.major;
    const institution = edu.institution;
    const parts = [degree, field, institution].filter(Boolean);
    return parts.join(", ");
  }).filter(Boolean).join("\n");

  // Format certifications - each on its own line
  const certificationsStr = certifications?.map((cert: any) => {
    return cert.name || cert.title || "";
  }).filter(Boolean).join("\n");

  const firstName = extractFirstName(backend);
  const lastName = extractLastName(backend);

  return {
    id: String(backend.id),
    slug: backend.slug,
    user_id: String(backend.user?.id || backend.id),
    first_name: firstName,
    last_name: lastName,
    email: extractEmail(backend),
    phone: backend.user?.profile?.phone || undefined,
    location: extractLocation(backend),
    title: (backend as any).title || undefined,

    // Resume
    resume_url: backend.resume_file || undefined,
    resume_file: backend.resume_file || undefined,

    // Resume parsed data
    resume_parsed: {
      skills: skills.length > 0 ? skills : undefined,
      experience: experienceStr || undefined,
      education: educationStr || undefined,
      certifications: certificationsStr || undefined,
      summary: extractBio(backend),
    },

    // Verified data
    is_verified: backend.user?.is_verified,

    // Work preferences - check multiple locations
    job_type: backend.employment_type_preferences?.[0] || (backend as any).work_preferences?.employment_type?.[0],
    work_arrangement: backend.work_mode_preferences?.[0] || (backend as any).work_preferences?.work_mode?.[0],
    availability: backend.is_available ? "Available" : "Not available",
    salary_min: salaryRange.min,
    salary_max: salaryRange.max,
    visa_required: backend.has_workvisa === false || (backend as any).work_preferences?.has_workvisa === false,
    willing_to_relocate: backend.willing_to_relocate ?? (backend as any).work_preferences?.relocation,

    // Additional info
    video_pitch: backend.video_pitch || undefined,
    bio: extractBio(backend),
    linkedin: extractLinkedIn(backend),
    github: extractGitHub(backend),
    portfolio: extractPortfolio(backend),

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
