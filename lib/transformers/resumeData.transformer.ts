/**
 * Resume Data Transformer
 * Converts backend resume_data format to frontend UserData format
 */

import type { UserData } from "@/lib/types/user";

/**
 * Deep partial type utility for nested objects
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<infer U>
      ? Array<U>
      : DeepPartial<T[P]>
    : T[P];
};

type ResumeSkills = {
  technical?: string[];
  technical_skills?: string[];
  technicalSkills?: string[];
  soft_skills?: string[];
  softSkills?: string[];
  categories?: Record<string, unknown>;
  skills?: string[];
};

type PersonalInfo = {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  github_url?: string;
  githubUrl?: string;
  portfolio_url?: string;
  portfolioUrl?: string;
};

type AdditionalInfo = {
  expected_salary_min?: number | string;
  expected_salary_max?: number | string;
  expected_salary_range?: string;
  preferred_work_mode?: string[] | string;
  notice_period?: string | number;
  willing_to_relocate?: boolean;
  visa_sponsorship_required?: boolean;
};

/**
 * Backend resume_data structure from Django API
 */
export type BackendResumeData = {
  // Basic info
  name?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
  linkedin?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  github?: string;
  github_url?: string;
  githubUrl?: string;
  portfolio?: string;
  portfolio_url?: string;
  portfolioUrl?: string;

  // Skills
  skills?: string | string[] | ResumeSkills;
  technical_skills?: string | string[];
  technicalSkills?: string | string[];

  // Work experience
  experience?: string | WorkExperience[];
  work_experience?: string | WorkExperience[];
  workExperience?: string | WorkExperience[];

  // Education
  education?: string | Education[];

  // Projects
  projects?: Project[];

  // Certifications
  certifications?: Certification[];
  certificates?: Certification[];

  // Summary/About
  summary?: string;
  about?: string;
  bio?: string;
  objective?: string;

  // Achievements
  achievements?: Achievement[];
  awards?: Achievement[];

  // Languages
  languages?: Array<Language | string>;

  // Parser nested fields
  personal_info?: PersonalInfo;
  additional_info?: AdditionalInfo;
  expected_salary_min?: number | string;
  expected_salary_max?: number | string;
  expected_salary_range?: string;
  preferred_work_mode?: string[] | string;
};

type WorkExperience = {
  company?: string;
  company_name?: string;
  companyName?: string;
  location?: string;
  role?: string;
  position?: string;
  title?: string;
  job_title?: string;
  jobTitle?: string;
  start_date?: string;
  startDate?: string;
  from?: string;
  end_date?: string;
  endDate?: string;
  to?: string;
  current?: boolean;
  is_current?: boolean;
  isCurrent?: boolean;
  description?: string;
  responsibilities?: string;
  duration?: string;
};

type Education = {
  institution?: string;
  school?: string;
  university?: string;
  degree?: string;
  course?: string;
  courseName?: string;
  course_name?: string;
  major?: string;
  field_of_study?: string;
  fieldOfStudy?: string;
  start_date?: string;
  startDate?: string;
  from?: string;
  end_date?: string;
  endDate?: string;
  to?: string;
  graduation_date?: string;
  graduationDate?: string;
  grade?: string;
  gpa?: string;
};

type Project = {
  name?: string;
  title?: string;
  project_name?: string;
  projectName?: string;
  raw_text?: string;
  description?: string;
  project_description?: string;
  projectDescription?: string;
  start_date?: string;
  startDate?: string;
  from?: string;
  end_date?: string;
  endDate?: string;
  to?: string;
  current?: boolean;
  is_current?: boolean;
  isCurrent?: boolean;
  technologies?: string | string[];
  tech_stack?: string | string[];
  techStack?: string | string[];
  url?: string;
  link?: string;
  project_url?: string;
  projectUrl?: string;
};

type Certification = {
  name?: string;
  title?: string;
  certification_name?: string;
  certificationName?: string;
  raw_text?: string;
  organization?: string;
  issuer?: string;
  issued_by?: string;
  issuedBy?: string;
  issue_date?: string;
  issueDate?: string;
  date?: string;
  expiry_date?: string;
  expiryDate?: string;
  expiration_date?: string;
  expirationDate?: string;
  credential_id?: string;
  credentialId?: string;
  credential_url?: string;
  credentialUrl?: string;
  url?: string;
};

type Achievement = {
  title?: string;
  name?: string;
  raw_text?: string;
  description?: string;
  date?: string;
  issue_date?: string;
  issueDate?: string;
  issuer?: string;
  organization?: string;
};

type Language = {
  language?: string;
  name?: string;
  proficiency?: string;
  level?: string;
  speaking?: string;
  reading?: string;
  writing?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Helper: Extract text value from unknown type
 */
const extractText = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "string" || typeof first === "number") {
      return String(first).trim();
    }
  }
  return "";
};

const extractNumberText = (value: unknown): string => {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.trim();
  return "";
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string" || typeof entry === "number") {
          return String(entry).trim();
        }
        if (isRecord(entry)) {
          return extractText(entry.label ?? entry.name ?? entry.value);
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;\n]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * Helper: Split full name into first and last name
 */
const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

/**
 * Helper: Normalize skills from string or array to required format
 */
type SkillEntry = { name: string; level: "basic" | "intermediate" | "advanced" };

const normalizeSkills = (value: unknown): { skills: string; primaryList: SkillEntry[] } => {
  const toSkillEntry = (name: string): SkillEntry => ({
    name,
    level: "intermediate",
  });

  if (Array.isArray(value)) {
    const list = value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
    return { skills: list.join(", "), primaryList: list.map(toSkillEntry) };
  }

  if (typeof value === "string") {
    const text = value.trim();
    const list = text
      .split(/[,;\n]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return {
      skills: text,
      primaryList: list.length > 0 ? list.map(toSkillEntry) : text ? [toSkillEntry(text)] : [],
    };
  }

  return { skills: "", primaryList: [] };
};

/**
 * Helper: Format date to YYYY-MM-DD format
 */
const formatDate = (value: unknown): string => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;

  // Try to parse common date formats
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return trimmed;
};

const isPresentDate = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim().toLowerCase();
  return ["present", "current", "now"].some((keyword) =>
    trimmed.includes(keyword)
  );
};

const parseRawTextBlock = (
  value: unknown
): { title: string; description: string } => {
  const text = extractText(value);
  if (!text) return { title: "", description: "" };
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return { title: "", description: "" };
  return {
    title: lines[0],
    description: lines.slice(1).join("\n"),
  };
};

/**
 * Transform basic info from resume data
 */
const transformBasicInfo = (
  data: BackendResumeData
): Partial<UserData["basicInfo"]> => {
  const personalInfo = isRecord(data.personal_info)
    ? (data.personal_info as PersonalInfo)
    : null;
  const personalFullName = personalInfo
    ? [personalInfo.first_name, personalInfo.last_name]
        .map((value) => extractText(value))
        .filter(Boolean)
        .join(" ")
    : "";
  const fullName = extractText(
    data.name ||
      data.full_name ||
      data.fullName ||
      personalInfo?.full_name ||
      personalInfo?.fullName ||
      personalFullName
  );
  const { firstName, lastName } = splitFullName(fullName);
  const email = extractText(data.email || personalInfo?.email);
  const phone = extractText(
    data.phone || data.phone_number || data.phoneNumber || personalInfo?.phone
  );
  const location = extractText(
    data.location || data.address || personalInfo?.location
  );
  const linkedin = extractText(
    data.linkedin ||
      data.linkedin_url ||
      data.linkedinUrl ||
      personalInfo?.linkedin_url ||
      personalInfo?.linkedinUrl
  );
  const github = extractText(
    data.github ||
      data.github_url ||
      data.githubUrl ||
      personalInfo?.github_url ||
      personalInfo?.githubUrl
  );
  const portfolio = extractText(
    data.portfolio ||
      data.portfolio_url ||
      data.portfolioUrl ||
      personalInfo?.portfolio_url ||
      personalInfo?.portfolioUrl
  );

  const basicInfo: Partial<UserData["basicInfo"]> = {};

  if (firstName) basicInfo.firstName = firstName;
  if (lastName) basicInfo.lastName = lastName;
  if (email) basicInfo.email = email;
  if (phone) basicInfo.phone = phone;
  if (location) basicInfo.location = location;
  if (linkedin) basicInfo.linkedinUrl = linkedin;
  if (github) basicInfo.githubUrl = github;
  if (portfolio) basicInfo.portfolioUrl = portfolio;

  return basicInfo;
};

/**
 * Transform education from resume data
 */
const transformEducation = (data: BackendResumeData): Partial<UserData["education"]> => {
  if (!data.education || typeof data.education === "string") {
    return {};
  }

  if (Array.isArray(data.education) && data.education.length > 0) {
    const edu = data.education[0];
    const institution = extractText(
      edu.institution || edu.school || edu.university
    );
    const courseName = extractText(
      edu.degree || edu.course || edu.courseName || edu.course_name
    );
    const major = extractText(
      edu.major || edu.field_of_study || edu.fieldOfStudy
    );
    const grade = extractText(edu.grade || edu.gpa);
    const from = formatDate(edu.start_date || edu.startDate || edu.from);
    const endRaw =
      edu.end_date || edu.endDate || edu.to || edu.graduation_date || edu.graduationDate;
    const to = formatDate(endRaw);
    const graduationDate = formatDate(
      edu.graduation_date || edu.graduationDate || endRaw
    );

    const education: Partial<UserData["education"]> = {};
    if (institution) education.institution = institution;
    if (courseName) education.courseName = courseName;
    if (major) education.major = major;
    if (grade) education.grade = grade;
    if (from) education.from = from;
    if (to) education.to = to;
    if (graduationDate) education.graduationDate = graduationDate;

    return education;
  }

  return {};
};

/**
 * Transform work experience from resume data
 */
const transformWorkExperience = (
  data: BackendResumeData
): Partial<UserData["workExperience"]> => {
  const experienceArray =
    (Array.isArray(data.work_experience) && data.work_experience) ||
    (Array.isArray(data.workExperience) && data.workExperience) ||
    (Array.isArray(data.experience) && data.experience) ||
    null;

  if (experienceArray && experienceArray.length > 0) {
    const entries = experienceArray
      .map((exp) => {
        const company = extractText(
          exp.company || exp.company_name || exp.companyName
        );
        const role = extractText(exp.role || exp.position || exp.title || exp.job_title || exp.jobTitle);
        const description = extractText(
          exp.description || exp.responsibilities
        );
        const from = formatDate(exp.start_date || exp.startDate || exp.from);
        const endRaw = exp.end_date || exp.endDate || exp.to;
        const current = Boolean(
          exp.current || exp.is_current || exp.isCurrent
        ) || isPresentDate(endRaw);
        const to = current ? "" : formatDate(endRaw);

        if (!company || !role) return null;

        return {
          company,
          role,
          from,
          to,
          current,
          description,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (entries.length > 0) {
      return {
        experienceType: "experienced",
        entries,
      };
    }
    return {
      experienceType: "experienced",
      entries: [],
    };
  }

  const experienceText =
    (typeof data.work_experience === "string" && data.work_experience) ||
    (typeof data.workExperience === "string" && data.workExperience) ||
    (typeof data.experience === "string" && data.experience) ||
    "";

  // If work_experience is a string (backend returns unstructured text)
  // Just mark as experienced but don't add entries - user will fill manually
  if (experienceText.trim().length > 0) {
    return {
      experienceType: "experienced",
      entries: [],
    };
  }

  return {};
};

/**
 * Transform skills from resume data
 */
const transformSkills = (data: BackendResumeData): Partial<UserData["skills"]> => {
  const skillsData = data.skills || data.technical_skills || data.technicalSkills;

  if (!skillsData) return {};

  if (isRecord(skillsData)) {
    const combined = [
      ...toStringArray(
        skillsData.technical ??
          skillsData.technical_skills ??
          skillsData.technicalSkills
      ),
      ...toStringArray(skillsData.soft_skills ?? skillsData.softSkills),
      ...toStringArray(skillsData.skills),
    ];
    const uniqueSkills = Array.from(new Set(combined));
    const normalized = normalizeSkills(uniqueSkills);
    if (normalized.skills || normalized.primaryList.length > 0) {
      // Return only primaryList, keep input field empty
      return {
        skills: "",
        primaryList: normalized.primaryList,
      };
    }
    return {};
  }

  const { skills, primaryList } = normalizeSkills(skillsData);

  if (skills || primaryList.length > 0) {
    // Return only primaryList, keep input field empty
    return {
      skills: "",
      primaryList,
    };
  }

  return {};
};

/**
 * Transform projects from resume data
 */
const transformProjects = (data: BackendResumeData): Partial<UserData["projects"]> => {
  if (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
    return {};
  }

  const entries = data.projects
    .map((proj) => {
      let projectName = extractText(
        proj.name || proj.title || proj.project_name || proj.projectName
      );
      let projectDescription = extractText(
        proj.description || proj.project_description || proj.projectDescription
      );
      if (proj.raw_text) {
        const parsed = parseRawTextBlock(proj.raw_text);
        if (!projectName && parsed.title) projectName = parsed.title;
        if (!projectDescription && parsed.description) {
          projectDescription = parsed.description;
        }
      }
      const from = formatDate(
        proj.start_date || proj.startDate || proj.from
      );
      const to = formatDate(
        proj.end_date || proj.endDate || proj.to
      );
      const current = Boolean(
        proj.current || proj.is_current || proj.isCurrent
      );

      if (!projectName) return null;

      return {
        projectName,
        projectDescription,
        from,
        to: current ? "" : to,
        current,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (entries.length > 0) {
    return {
      noProjects: false,
      entries,
    };
  }

  return {};
};

/**
 * Transform certifications from resume data
 */
const transformCertifications = (
  data: BackendResumeData
): Partial<UserData["certification"]> => {
  const certData = data.certifications || data.certificates;

  if (!certData || !Array.isArray(certData) || certData.length === 0) {
    return {};
  }

  const entries = certData
    .map((cert) => {
      const name = extractText(
        cert.name ||
          cert.title ||
          cert.certification_name ||
          cert.certificationName ||
          cert.raw_text
      );
      const organization = extractText(
        cert.organization || cert.issuer || cert.issued_by || cert.issuedBy
      );
      const issueDate = formatDate(
        cert.issue_date || cert.issueDate || cert.date
      );
      const expiryDate = formatDate(
        cert.expiry_date ||
          cert.expiryDate ||
          cert.expiration_date ||
          cert.expirationDate
      );
      const credentialIdUrl = extractText(
        cert.credential_url || cert.credentialUrl || cert.url || cert.credential_id || cert.credentialId
      );

      if (!name) return null;

      return {
        name,
        organization,
        issueDate,
        expiryDate,
        credentialIdUrl,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (entries.length > 0) {
    return {
      noCertification: false,
      entries,
    };
  }

  return {};
};

/**
 * Transform achievements from resume data
 */
const transformAchievements = (
  data: BackendResumeData
): Partial<UserData["achievements"]> => {
  const achievementData = data.achievements || data.awards;

  if (!achievementData || !Array.isArray(achievementData) || achievementData.length === 0) {
    return {};
  }

  const entries = achievementData
    .map((achievement) => {
      const title = extractText(
        achievement.title || achievement.name || achievement.raw_text
      );
      const description = extractText(achievement.description);
      const issueDate = formatDate(
        achievement.date || achievement.issue_date || achievement.issueDate
      );

      if (!title) return null;

      return {
        title,
        description,
        issueDate,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (entries.length > 0) {
    return {
      entries,
    };
  }

  return {};
};

/**
 * Transform languages from resume data
 */
const transformLanguages = (data: BackendResumeData): Partial<UserData["otherDetails"]> => {
  if (!data.languages || !Array.isArray(data.languages) || data.languages.length === 0) {
    return {};
  }

  const languages = data.languages
    .map((lang) => {
      if (typeof lang === "string") {
        const language = lang.trim();
        if (!language) return null;
        return {
          language,
          speaking: "",
          reading: "",
          writing: "",
        };
      }

      const language = extractText(lang.language || lang.name);
      const proficiency = extractText(lang.proficiency || lang.level);

      // Map proficiency to speaking/reading/writing levels
      const speaking = extractText(lang.speaking) || proficiency;
      const reading = extractText(lang.reading) || proficiency;
      const writing = extractText(lang.writing) || proficiency;

      if (!language) return null;

      return {
        language,
        speaking,
        reading,
        writing,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (languages.length > 0) {
    return {
      languages,
    };
  }

  return {};
};

const getAdditionalInfo = (data: BackendResumeData): AdditionalInfo | null => {
  if (!data.additional_info || !isRecord(data.additional_info)) {
    return null;
  }
  return data.additional_info as AdditionalInfo;
};

const extractDesiredSalary = (data: BackendResumeData): string => {
  const additionalInfo = getAdditionalInfo(data);
  const range = extractNumberText(
    data.expected_salary_range || additionalInfo?.expected_salary_range
  );
  if (range) return range;

  const min = extractNumberText(
    data.expected_salary_min || additionalInfo?.expected_salary_min
  );
  const max = extractNumberText(
    data.expected_salary_max || additionalInfo?.expected_salary_max
  );

  if (min && max) return `${min}-${max}`;
  return min || max;
};

const transformPreference = (
  data: BackendResumeData
): Partial<UserData["preference"]> => {
  const additionalInfo = getAdditionalInfo(data);
  const jobSearch = toStringArray(
    data.preferred_work_mode || additionalInfo?.preferred_work_mode
  );

  if (jobSearch.length > 0) {
    return { jobSearch };
  }

  return {};
};

const transformOtherDetails = (
  data: BackendResumeData
): Partial<UserData["otherDetails"]> => {
  const otherDetails = transformLanguages(data);
  const desiredSalary = extractDesiredSalary(data);

  if (desiredSalary) {
    otherDetails.desiredSalary = desiredSalary;
  }

  return otherDetails;
};

/**
 * Main transformer: Convert backend resume_data to UserData patch
 */
const unwrapResumeData = (value: unknown): BackendResumeData | null => {
  if (!isRecord(value)) return null;

  const resumeData =
    (isRecord(value.resume_data) && value.resume_data) ||
    (isRecord(value.resumeData) && value.resumeData) ||
    null;

  if (resumeData) {
    const nested =
      (isRecord(resumeData.resume_data) && resumeData.resume_data) ||
      (isRecord(resumeData.resumeData) && resumeData.resumeData) ||
      null;
    return (nested || resumeData) as BackendResumeData;
  }

  return value as BackendResumeData;
};

export function transformBackendResumeData(
  resumeData: BackendResumeData | unknown
): DeepPartial<UserData> {
  const data = unwrapResumeData(resumeData);
  if (!data) return {};
  const patch: DeepPartial<UserData> = {};

  // Transform each section
  const basicInfo = transformBasicInfo(data);
  if (Object.keys(basicInfo).length > 0) {
    patch.basicInfo = basicInfo;
  }

  const education = transformEducation(data);
  if (Object.keys(education).length > 0) {
    patch.education = education;
  }

  const workExperience = transformWorkExperience(data);
  if (Object.keys(workExperience).length > 0) {
    patch.workExperience = workExperience;
  }

  const skills = transformSkills(data);
  if (Object.keys(skills).length > 0) {
    patch.skills = skills;
  }

  const projects = transformProjects(data);
  if (Object.keys(projects).length > 0) {
    patch.projects = projects;
  }

  const certifications = transformCertifications(data);
  if (Object.keys(certifications).length > 0) {
    patch.certification = certifications;
  }

  const achievements = transformAchievements(data);
  if (Object.keys(achievements).length > 0) {
    patch.achievements = achievements;
  }

  const preference = transformPreference(data);
  if (Object.keys(preference).length > 0) {
    patch.preference = preference;
  }

  const otherDetails = transformOtherDetails(data);
  if (Object.keys(otherDetails).length > 0) {
    patch.otherDetails = otherDetails;
  }

  return patch;
}
