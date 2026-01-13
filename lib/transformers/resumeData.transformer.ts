/**
 * Resume Data Transformer
 * Converts backend resume_data format to frontend UserData format
 */

import type { UserData } from "@/lib/types/user";

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
  skills?: string | string[];
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
  languages?: Language[];
};

type WorkExperience = {
  company?: string;
  company_name?: string;
  companyName?: string;
  role?: string;
  position?: string;
  title?: string;
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
  organization?: string;
  issuer?: string;
  issued_by?: string;
  issuedBy?: string;
  issue_date?: string;
  issueDate?: string;
  date?: string;
  expiry_date?: string;
  expiryDate?: string;
  credential_id?: string;
  credentialId?: string;
  credential_url?: string;
  credentialUrl?: string;
  url?: string;
};

type Achievement = {
  title?: string;
  name?: string;
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

/**
 * Helper: Extract text value from unknown type
 */
const extractText = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
    return value[0].trim();
  }
  return "";
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
const normalizeSkills = (value: unknown): { skills: string; primaryList: string[] } => {
  if (Array.isArray(value)) {
    const list = value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
    return { skills: list.join(", "), primaryList: list };
  }

  if (typeof value === "string") {
    const text = value.trim();
    const list = text
      .split(/[,;\n]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return { skills: text, primaryList: list.length > 0 ? list : text ? [text] : [] };
  }

  return { skills: "", primaryList: [] };
};

/**
 * Helper: Format date to YYYY-MM format
 */
const formatDate = (value: unknown): string => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();

  // If already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;

  // If in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.substring(0, 7);
  }

  // Try to parse common date formats
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  return trimmed;
};

/**
 * Transform basic info from resume data
 */
const transformBasicInfo = (data: BackendResumeData): Partial<UserData["basicInfo"]> => {
  const fullName = extractText(data.name || data.full_name || data.fullName);
  const { firstName, lastName } = splitFullName(fullName);
  const email = extractText(data.email);
  const phone = extractText(data.phone || data.phone_number || data.phoneNumber);
  const location = extractText(data.location || data.address);
  const linkedin = extractText(data.linkedin || data.linkedin_url || data.linkedinUrl);
  const github = extractText(data.github || data.github_url || data.githubUrl);
  const portfolio = extractText(data.portfolio || data.portfolio_url || data.portfolioUrl);

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
    const from = formatDate(
      edu.start_date || edu.startDate || edu.from
    );
    const to = formatDate(
      edu.end_date || edu.endDate || edu.to || edu.graduation_date || edu.graduationDate
    );

    const education: Partial<UserData["education"]> = {};
    if (institution) education.institution = institution;
    if (courseName) education.courseName = courseName;
    if (major) education.major = major;
    if (grade) education.grade = grade;
    if (from) education.from = from;
    if (to) education.to = to;

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
  const experienceData =
    data.experience || data.work_experience || data.workExperience;

  // If work_experience is a string (backend returns unstructured text)
  // Just mark as experienced but don't add entries - user will fill manually
  if (typeof experienceData === "string" && experienceData.trim().length > 0) {
    return {
      experienceType: "experienced",
      entries: [],
    };
  }

  if (!experienceData) {
    return {};
  }

  if (Array.isArray(experienceData) && experienceData.length > 0) {
    const entries = experienceData
      .map((exp) => {
        const company = extractText(
          exp.company || exp.company_name || exp.companyName
        );
        const role = extractText(exp.role || exp.position || exp.title);
        const description = extractText(
          exp.description || exp.responsibilities
        );
        const from = formatDate(
          exp.start_date || exp.startDate || exp.from
        );
        const to = formatDate(
          exp.end_date || exp.endDate || exp.to
        );
        const current = Boolean(
          exp.current || exp.is_current || exp.isCurrent
        );

        if (!company || !role) return null;

        return {
          company,
          role,
          from,
          to: current ? "" : to,
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
  }

  return {};
};

/**
 * Transform skills from resume data
 */
const transformSkills = (data: BackendResumeData): Partial<UserData["skills"]> => {
  const skillsData = data.skills || data.technical_skills || data.technicalSkills;

  if (!skillsData) return {};

  const { skills, primaryList } = normalizeSkills(skillsData);

  if (skills || primaryList.length > 0) {
    return {
      skills,
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
      const projectName = extractText(
        proj.name || proj.title || proj.project_name || proj.projectName
      );
      const projectDescription = extractText(
        proj.description || proj.project_description || proj.projectDescription
      );
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
        cert.name || cert.title || cert.certification_name || cert.certificationName
      );
      const organization = extractText(
        cert.organization || cert.issuer || cert.issued_by || cert.issuedBy
      );
      const issueDate = formatDate(
        cert.issue_date || cert.issueDate || cert.date
      );
      const credentialIdUrl = extractText(
        cert.credential_url || cert.credentialUrl || cert.url || cert.credential_id || cert.credentialId
      );

      if (!name) return null;

      return {
        name,
        organization,
        issueDate,
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
      const title = extractText(achievement.title || achievement.name);
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

/**
 * Main transformer: Convert backend resume_data to UserData patch
 */
export function transformBackendResumeData(
  resumeData: BackendResumeData | unknown
): Partial<UserData> {
  if (!resumeData || typeof resumeData !== "object") {
    return {};
  }

  const data = resumeData as BackendResumeData;
  const patch: Partial<UserData> = {};

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

  const otherDetails = transformLanguages(data);
  if (Object.keys(otherDetails).length > 0) {
    patch.otherDetails = otherDetails;
  }

  return patch;
}
