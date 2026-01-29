/**
 * Candidate Profile Types
 * Based on backend API response structure
 */

export type CandidateProfile = {
  id: string;
  slug: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  title?: string;

  // Resume
  resume_url?: string;
  resume_file?: string;

  // Parsed resume data
  resume_parsed?: {
    skills?: string[];
    experience?: string;
    education?: string;
    certifications?: string;
    summary?: string;
    experience_entries?: CandidateExperienceEntry[];
    education_entries?: CandidateEducationEntry[];
    certification_entries?: CandidateCertificationEntry[];
  };

  // Verified data
  is_verified?: boolean;
  verified_at?: string;

  // Work preferences
  job_type?: string;
  work_arrangement?: string;
  availability?: string;
  salary_min?: number;
  salary_max?: number;
  visa_required?: boolean;
  willing_to_relocate?: boolean;

  // Additional info
  video_pitch?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;

  // Notes (from employer)
  notes?: CandidateNote[];

  // Timestamps
  created_at?: string;
  updated_at?: string;
};

export type CandidateExperienceEntry = {
  role?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  raw_text?: string;
};

export type CandidateEducationEntry = {
  degree?: string;
  field_of_study?: string;
  institution?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  description?: string;
  raw_text?: string;
};

export type CandidateCertificationEntry = {
  name?: string;
  issuer?: string;
  issued_date?: string;
  raw_text?: string;
};

export type CandidateNote = {
  id: string;
  identifier: string;
  note: string;
  section?: string;
  selected_text?: string;
  context?: string;
  note_file?: string;
  created_at: string;
  updated_at: string;
};

export type CandidateListItem = Pick<
  CandidateProfile,
  | 'id'
  | 'slug'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'location'
  | 'resume_url'
  | 'is_verified'
  | 'job_type'
  | 'work_arrangement'
  | 'availability'
  | 'salary_min'
  | 'salary_max'
  | 'created_at'
>;
