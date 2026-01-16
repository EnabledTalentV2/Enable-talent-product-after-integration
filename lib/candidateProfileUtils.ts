import type { UserData } from "@/lib/types/user";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toTrimmedString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (typeof entry === "number") return String(entry);
      if (isRecord(entry)) {
        return (
          toTrimmedString(entry.label) ||
          toTrimmedString(entry.name) ||
          toTrimmedString(entry.value)
        );
      }
      return "";
    })
    .filter(Boolean);
};

const toLower = (value: string) => value.toLowerCase();

const normalizeEmploymentType = (value: string) => {
  const normalized = toLower(value);
  if (normalized.includes("full")) return "Full time";
  if (normalized.includes("part")) return "Part time";
  if (normalized.includes("contract")) return "Contract";
  if (normalized.includes("intern")) return "Intern";
  return value;
};

const toEmploymentTypeValue = (value: string) => {
  const normalized = toLower(value);
  if (normalized.includes("full")) return "full-time";
  if (normalized.includes("part")) return "part-time";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("intern")) return "intern";
  return value;
};

const toExpectedSalary = (value: unknown): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (!isRecord(value)) return "";
  const min = toTrimmedString(value.min ?? value.minimum ?? value.from);
  const max = toTrimmedString(value.max ?? value.maximum ?? value.to);
  const currency = toTrimmedString(value.currency ?? value.currency_code);

  if (min && max) {
    return currency ? `${currency} ${min}-${max}` : `${min}-${max}`;
  }
  if (min || max) {
    return currency ? `${currency} ${min || max}` : `${min || max}`;
  }
  return "";
};

const hasValue = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== null && value !== undefined;
};

export type DeepPartialUserData = {
  basicInfo?: Partial<UserData["basicInfo"]>;
  education?: Partial<UserData["education"]>;
  workExperience?: Partial<UserData["workExperience"]>;
  skills?: Partial<UserData["skills"]>;
  projects?: Partial<UserData["projects"]>;
  achievements?: Partial<UserData["achievements"]>;
  certification?: Partial<UserData["certification"]>;
  preference?: Partial<UserData["preference"]>;
  otherDetails?: Partial<UserData["otherDetails"]>;
  reviewAgree?: Partial<UserData["reviewAgree"]>;
  accessibilityNeeds?: Partial<NonNullable<UserData["accessibilityNeeds"]>>;
};

export const mapCandidateProfileToUserData = (
  payload: unknown
): DeepPartialUserData => {
  if (!isRecord(payload)) return {};

  const user = isRecord(payload.user) ? payload.user : null;
  const profile = user && isRecord(user.profile) ? user.profile : null;

  const basicInfo: Partial<UserData["basicInfo"]> = {};
  const firstName = toTrimmedString(user?.first_name ?? user?.firstName);
  const lastName = toTrimmedString(user?.last_name ?? user?.lastName);
  const email = toTrimmedString(user?.email);
  const avatar = toTrimmedString(profile?.avatar);

  if (firstName) basicInfo.firstName = firstName;
  if (lastName) basicInfo.lastName = lastName;
  if (email) basicInfo.email = email;
  if (avatar) basicInfo.profilePhoto = avatar;

  const employmentTypes = toStringArray(
    payload.employment_type_preferences
  ).map(normalizeEmploymentType);
  const workModes = toStringArray(payload.work_mode_preferences);
  const preference: Partial<UserData["preference"]> = {};

  if (employmentTypes.length > 0) {
    preference.jobType = employmentTypes;
  }
  if (workModes.length > 0) {
    preference.jobSearch = workModes;
  }

  const otherDetails: Partial<UserData["otherDetails"]> = {};
  const desiredSalary = toExpectedSalary(payload.expected_salary_range);
  if (desiredSalary) {
    otherDetails.desiredSalary = desiredSalary;
  }
  if (typeof payload.is_available === "boolean" && payload.is_available) {
    otherDetails.availability = "Immediately / Available now";
  }

  const result: DeepPartialUserData = {};
  if (hasValue(basicInfo)) {
    result.basicInfo = basicInfo;
  }
  if (hasValue(preference)) {
    result.preference = preference;
  }
  if (hasValue(otherDetails)) {
    result.otherDetails = otherDetails;
  }

  return result;
};

const normalizeSkills = (skillsText: string, primaryList?: string[]) => {
  const splitter = (value: string) =>
    value
      .split(/[,;\n]+/)
      .map((skill) => skill.trim())
      .filter(Boolean);

  const textEntries = splitter(skillsText || "");
  const primaryEntries = Array.isArray(primaryList)
    ? primaryList.flatMap(splitter)
    : [];

  return Array.from(new Set([...primaryEntries, ...textEntries]));
};

const toYearMonth = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d{4}-\d{2})/);
  return match ? match[1] : trimmed;
};

const getCurrentYearMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

export const buildVerifyProfilePayload = (data: UserData) => {
  const payload: Record<string, unknown> = {};

  // Basic Info
  const basicInfo: Record<string, unknown> = {};
  if (data.basicInfo.firstName.trim()) {
    basicInfo.first_name = data.basicInfo.firstName.trim();
  }
  if (data.basicInfo.lastName.trim()) {
    basicInfo.last_name = data.basicInfo.lastName.trim();
  }
  if (data.basicInfo.phone.trim()) {
    basicInfo.phone = data.basicInfo.phone.trim();
  }
  if (data.basicInfo.location.trim()) {
    basicInfo.location = data.basicInfo.location.trim();
  }
  if (data.basicInfo.citizenshipStatus.trim()) {
    basicInfo.citizenship_status = data.basicInfo.citizenshipStatus.trim();
  }
  if (data.basicInfo.gender.trim()) {
    basicInfo.gender = data.basicInfo.gender.trim();
  }
  if (data.basicInfo.ethnicity.trim()) {
    basicInfo.ethnicity = data.basicInfo.ethnicity.trim();
  }
  const linkedin = (
    data.basicInfo.linkedinUrl || data.basicInfo.socialProfile || ""
  ).trim();
  if (linkedin) {
    basicInfo.linkedin_url = linkedin;
  }
  if (data.basicInfo.githubUrl.trim()) {
    basicInfo.github_url = data.basicInfo.githubUrl.trim();
  }
  if (data.basicInfo.portfolioUrl.trim()) {
    basicInfo.portfolio_url = data.basicInfo.portfolioUrl.trim();
  }
  if (data.basicInfo.currentStatus.trim()) {
    basicInfo.current_status = data.basicInfo.currentStatus.trim();
  }
  if (data.basicInfo.profilePhoto?.trim()) {
    basicInfo.profile_photo = data.basicInfo.profilePhoto.trim();
  }
  if (Object.keys(basicInfo).length > 0) {
    payload.basic_info = basicInfo;
  }

  // Education
  const education: Record<string, unknown> = {};
  if (data.education.courseName.trim()) {
    education.course_name = data.education.courseName.trim();
  }
  if (data.education.major.trim()) {
    education.major = data.education.major.trim();
  }
  if (data.education.institution.trim()) {
    education.institution = data.education.institution.trim();
  }
  if (data.education.graduationDate.trim()) {
    education.graduation_date = toYearMonth(data.education.graduationDate);
  }
  if (data.education.grade.trim()) {
    education.grade = data.education.grade.trim();
  }
  if (data.education.from.trim()) {
    education.start_date = toYearMonth(data.education.from);
  }
  if (data.education.to.trim()) {
    education.end_date = toYearMonth(data.education.to);
  }
  if (Object.keys(education).length > 0) {
    payload.education = education;
  }

  // Work Experience
  const workEntries =
    data.workExperience.experienceType === "fresher"
      ? []
      : data.workExperience.entries;
  const workExperience = workEntries
    .map((entry) => {
      const startDate = toYearMonth(entry.from);
      const endDate = entry.current
        ? getCurrentYearMonth()
        : toYearMonth(entry.to);

      return {
        company: entry.company.trim(),
        role: entry.role.trim(),
        start_date: startDate,
        end_date: endDate || undefined,
        current: entry.current || false,
        description: entry.description.trim() || undefined,
      };
    })
    .filter((entry) => entry.company && entry.role && entry.start_date);
  if (workExperience.length > 0) {
    payload.work_experience = workExperience;
  }

  // Skills
  const skills = normalizeSkills(data.skills.skills, data.skills.primaryList);
  if (skills.length > 0) {
    payload.skills = skills;
  }

  // Projects
  if (!data.projects.noProjects) {
    const projects = data.projects.entries
      .map((entry) => {
        const startDate = toYearMonth(entry.from);
        const endDate = entry.current
          ? getCurrentYearMonth()
          : toYearMonth(entry.to);

        return {
          project_name: entry.projectName.trim(),
          description: entry.projectDescription.trim(),
          start_date: startDate,
          end_date: endDate || undefined,
          current: entry.current || false,
        };
      })
      .filter((entry) => entry.project_name && entry.start_date);
    if (projects.length > 0) {
      payload.projects = projects;
    }
  }

  // Achievements
  const achievements = data.achievements.entries
    .map((entry) => ({
      title: entry.title.trim(),
      issue_date: toYearMonth(entry.issueDate),
      description: entry.description.trim(),
    }))
    .filter((entry) => entry.title);
  if (achievements.length > 0) {
    payload.achievements = achievements;
  }

  // Certifications
  if (!data.certification.noCertification) {
    const certifications = data.certification.entries
      .map((entry) => ({
        name: entry.name.trim(),
        issue_date: toYearMonth(entry.issueDate),
        organization: entry.organization.trim(),
        credential_id_url: entry.credentialIdUrl.trim(),
      }))
      .filter((entry) => entry.name);
    if (certifications.length > 0) {
      payload.certifications = certifications;
    }
  }

  // Preferences
  const preferences: Record<string, unknown> = {};
  if (data.preference.companySize.length > 0) {
    preferences.company_size = data.preference.companySize;
  }
  if (data.preference.jobType.length > 0) {
    preferences.job_type = data.preference.jobType;
  }
  if (data.preference.jobSearch.length > 0) {
    preferences.job_search_status = data.preference.jobSearch;
  }
  if (Object.keys(preferences).length > 0) {
    payload.preferences = preferences;
  }

  // Languages
  const languages = data.otherDetails.languages
    .map((entry) => ({
      language: entry.language.trim(),
      speaking: entry.speaking.trim(),
      reading: entry.reading.trim(),
      writing: entry.writing.trim(),
    }))
    .filter((entry) => entry.language);
  if (languages.length > 0) {
    payload.languages = languages;
  }

  // Other Details
  const otherDetails: Record<string, unknown> = {};
  if (data.otherDetails.careerStage.trim()) {
    otherDetails.career_stage = data.otherDetails.careerStage.trim();
  }
  if (data.otherDetails.availability.trim()) {
    otherDetails.availability = data.otherDetails.availability.trim();
  }
  if (data.otherDetails.desiredSalary.trim()) {
    otherDetails.desired_salary = data.otherDetails.desiredSalary.trim();
  }
  if (Object.keys(otherDetails).length > 0) {
    payload.other_details = otherDetails;
  }

  // Accessibility Needs
  if (data.accessibilityNeeds) {
    const accessibilityNeeds: Record<string, unknown> = {};
    if (data.accessibilityNeeds.categories.length > 0) {
      accessibilityNeeds.categories = data.accessibilityNeeds.categories;
    }
    if (data.accessibilityNeeds.accommodationNeed.trim()) {
      accessibilityNeeds.accommodation_need =
        data.accessibilityNeeds.accommodationNeed.trim();
    }
    if (data.accessibilityNeeds.disclosurePreference.trim()) {
      accessibilityNeeds.disclosure_preference =
        data.accessibilityNeeds.disclosurePreference.trim();
    }
    if (data.accessibilityNeeds.accommodations.length > 0) {
      accessibilityNeeds.accommodations = data.accessibilityNeeds.accommodations;
    }
    if (Object.keys(accessibilityNeeds).length > 0) {
      payload.accessibility_needs = accessibilityNeeds;
    }
  }

  // How discovered and comments (from reviewAgree)
  if (data.reviewAgree.discover.trim()) {
    payload.how_discovered = data.reviewAgree.discover.trim();
  }
  if (data.reviewAgree.comments.trim()) {
    payload.comments = data.reviewAgree.comments.trim();
  }

  return payload;
};

export const buildCandidateProfileUpdatePayload = (
  data: UserData
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const employmentTypes = data.preference.jobType
    .map((value) => toEmploymentTypeValue(value.trim()))
    .filter(Boolean);
  const workModes = data.preference.jobSearch
    .map((value) => value.trim())
    .filter(Boolean);
  const desiredSalary = data.otherDetails.desiredSalary.trim();
  const availability = data.otherDetails.availability.trim();

  if (employmentTypes.length > 0) {
    payload.employment_type_preferences = employmentTypes;
  }

  if (workModes.length > 0) {
    payload.work_mode_preferences = workModes;
  }

  if (desiredSalary) {
    payload.expected_salary_range = desiredSalary;
  }

  if (availability) {
    payload.is_available = true;
  }

  return payload;
};
