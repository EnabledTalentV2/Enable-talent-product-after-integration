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

const toTitleCase = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

const normalizeLanguageLevelFromBackend = (value: unknown): string => {
  const trimmed = toTrimmedString(value);
  if (!trimmed) return "";
  const normalized = toLower(trimmed);
  if (normalized === "basic") return "Basic";
  if (normalized === "intermediate") return "Intermediate";
  if (normalized === "advanced") return "Fluent";
  return toTitleCase(trimmed);
};

const normalizeLanguageLevelForBackend = (value: unknown): string => {
  const trimmed = toTrimmedString(value);
  if (!trimmed) return "";
  const normalized = toLower(trimmed);
  if (normalized.startsWith("basic")) return "basic";
  if (normalized.startsWith("intermediate")) return "intermediate";
  if (
    normalized.startsWith("advanced") ||
    normalized.startsWith("proficient") ||
    normalized.startsWith("fluent") ||
    normalized.startsWith("expert")
  ) {
    return "advanced";
  }
  return normalized;
};

const normalizeAccommodationNeed = (value: string) => {
  const normalized = toLower(value);
  if (normalized.includes("discuss")) return "discuss_later";
  if (normalized === "yes") return "yes";
  if (normalized === "no") return "no";
  return value;
};

const toAccommodationNeedValue = (value: string) => {
  const normalized = toLower(value);
  if (normalized === "yes") return "YES";
  if (normalized === "no") return "NO";
  if (normalized.includes("discuss")) return "PREFER_TO_DISCUSS_LATER";
  return value.toUpperCase();
};

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

const extractYear = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const match = value.trim().match(/\b(\d{4})\b/);
    if (match) {
      const year = Number(match[1]);
      return Number.isFinite(year) ? year : null;
    }
  }
  return null;
};

const toDateFromYear = (value: unknown): string => {
  const year = extractYear(value);
  return year ? `${year}-01-01` : "";
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
  const verifiedProfile = isRecord(payload.verified_profile)
    ? payload.verified_profile
    : isRecord(payload.verifiedProfile)
    ? payload.verifiedProfile
    : null;

  const basicInfo: Partial<UserData["basicInfo"]> = {};
  const firstName = toTrimmedString(user?.first_name ?? user?.firstName);
  const lastName = toTrimmedString(user?.last_name ?? user?.lastName);
  const email = toTrimmedString(user?.email);
  const avatar = toTrimmedString(profile?.avatar);

  if (firstName) basicInfo.firstName = firstName;
  if (lastName) basicInfo.lastName = lastName;
  if (email) basicInfo.email = email;
  if (avatar) basicInfo.profilePhoto = avatar;

  const preferenceSource =
    (verifiedProfile &&
      isRecord(verifiedProfile.preferences) &&
      verifiedProfile.preferences) ||
    payload;
  const employmentTypes = toStringArray(
    (preferenceSource as Record<string, unknown>)?.employment_type_preferences
  ).map(normalizeEmploymentType);
  const workModes = toStringArray(
    (preferenceSource as Record<string, unknown>)?.work_mode_preferences
  );
  const preference: Partial<UserData["preference"]> = {};

  if (employmentTypes.length > 0) {
    preference.jobType = employmentTypes;
  }
  if (workModes.length > 0) {
    preference.jobSearch = workModes;
  }

  // Read relocation and work visa preferences
  const willingToRelocate =
    (preferenceSource as Record<string, unknown>)?.willing_to_relocate ??
    payload.willing_to_relocate;
  if (typeof willingToRelocate === "boolean") {
    preference.willingToRelocate = willingToRelocate;
  }

  const hasWorkVisa =
    (preferenceSource as Record<string, unknown>)?.has_workvisa ??
    payload.has_workvisa;
  if (typeof hasWorkVisa === "boolean") {
    preference.hasWorkVisa = hasWorkVisa;
  }

  const otherDetails: Partial<UserData["otherDetails"]> = {};
  const desiredSalary = toExpectedSalary(payload.expected_salary_range);
  if (desiredSalary) {
    otherDetails.desiredSalary = desiredSalary;
  }
  if (typeof payload.is_available === "boolean" && payload.is_available) {
    otherDetails.availability = "Immediately / Available now";
  }

  const accessibilitySource =
    (verifiedProfile &&
      isRecord(verifiedProfile.accessibility_needs) &&
      verifiedProfile.accessibility_needs) ||
    (isRecord(payload.accessibility_needs) && payload.accessibility_needs) ||
    (isRecord(payload.accessibilityNeeds) && payload.accessibilityNeeds) ||
    (isRecord(user?.accessibility_needs) && user.accessibility_needs) ||
    (isRecord(user?.accessibilityNeeds) && user.accessibilityNeeds) ||
    (isRecord(profile?.accessibility_needs) && profile.accessibility_needs) ||
    (isRecord(profile?.accessibilityNeeds) && profile.accessibilityNeeds) ||
    null;
  const accessibilityNeeds: Partial<
    NonNullable<UserData["accessibilityNeeds"]>
  > = {};
  if (accessibilitySource) {
    const categories = toStringArray(
      (accessibilitySource as Record<string, unknown>).disability_categories ??
        (accessibilitySource as Record<string, unknown>).categories
    );
    const accommodations = toStringArray(
      (accessibilitySource as Record<string, unknown>).workplace_accommodations ??
        (accessibilitySource as Record<string, unknown>).accommodations
    );
    const accommodationNeed = toTrimmedString(
      (accessibilitySource as Record<string, unknown>).accommodation_needs ??
        (accessibilitySource as Record<string, unknown>).accommodationNeed ??
        (accessibilitySource as Record<string, unknown>).accommodation_need
    );
    const disclosurePreference = toTrimmedString(
      (accessibilitySource as Record<string, unknown>).disclosure_preference ??
        (accessibilitySource as Record<string, unknown>).disclosurePreference
    );

    if (categories.length > 0) accessibilityNeeds.categories = categories;
    if (accommodationNeed)
      accessibilityNeeds.accommodationNeed =
        normalizeAccommodationNeed(accommodationNeed);
    if (disclosurePreference)
      accessibilityNeeds.disclosurePreference = disclosurePreference;
    if (accommodations.length > 0)
      accessibilityNeeds.accommodations = accommodations;
  }

  const education: Partial<UserData["education"]> = {};
  const educationSource = Array.isArray(verifiedProfile?.education)
    ? verifiedProfile?.education
    : [];
  if (educationSource.length > 0) {
    const first = educationSource.find(isRecord);
    if (first) {
      const courseName = toTrimmedString(
        first.course_name ?? first.courseName ?? first.degree ?? first.course
      );
      const major = toTrimmedString(first.major ?? first.field_of_study);
      const institution = toTrimmedString(first.institution ?? first.school);
      const graduationDate =
        toDateFromYear(first.end_year ?? first.graduation_year) || "";

      if (courseName) education.courseName = courseName;
      if (major) education.major = major;
      if (institution) education.institution = institution;
      if (graduationDate) education.graduationDate = graduationDate;
    }
  }

  const skillSource = Array.isArray(verifiedProfile?.skills)
    ? verifiedProfile?.skills
    : [];
  const normalizeSkillLevel = (
    level: unknown
  ): "basic" | "intermediate" | "advanced" => {
    const trimmed = toTrimmedString(level).toLowerCase();
    if (trimmed === "basic" || trimmed === "beginner") return "basic";
    if (trimmed === "advanced" || trimmed === "expert") return "advanced";
    return "intermediate";
  };
  const mappedSkills = skillSource
    .map((entry) => {
      if (!isRecord(entry)) {
        const name = toTrimmedString(entry);
        return name ? { name, level: "intermediate" as const } : null;
      }
      const name = toTrimmedString(entry.name ?? entry.skill ?? entry.title);
      if (!name) return null;
      return {
        name,
        level: normalizeSkillLevel(entry.level),
      };
    })
    .filter(Boolean) as Array<{
    name: string;
    level: "basic" | "intermediate" | "advanced";
  }>;

  const languageSource = Array.isArray(verifiedProfile?.languages)
    ? verifiedProfile?.languages
    : [];
  const mappedLanguages = languageSource
    .map((entry) => {
      if (!isRecord(entry)) {
        const label = toTrimmedString(entry);
        return label
          ? {
              language: label,
              speaking: "",
              reading: "",
              writing: "",
            }
          : null;
      }
      const language = toTrimmedString(entry.language ?? entry.name);
      if (!language) return null;
      return {
        language,
        speaking: normalizeLanguageLevelFromBackend(entry.speaking),
        reading: normalizeLanguageLevelFromBackend(entry.reading),
        writing: normalizeLanguageLevelFromBackend(entry.writing),
      };
    })
    .filter(Boolean) as UserData["otherDetails"]["languages"];

  const result: DeepPartialUserData = {};
  if (hasValue(basicInfo)) {
    result.basicInfo = basicInfo;
  }
  if (hasValue(education)) {
    result.education = education;
  }
  if (hasValue(preference)) {
    result.preference = preference;
  }
  if (hasValue(otherDetails)) {
    result.otherDetails = otherDetails;
  }
  if (mappedSkills.length > 0) {
    // Deduplicate by skill name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueSkills = mappedSkills.filter((skill) => {
      const key = skill.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    result.skills = {
      primaryList: uniqueSkills,
      skills: "",
    };
  }
  if (mappedLanguages.length > 0) {
    const otherDetailsPatch: Partial<UserData["otherDetails"]> =
      result.otherDetails ?? {};
    otherDetailsPatch.languages = mappedLanguages;
    result.otherDetails = otherDetailsPatch;
  }
  if (hasValue(accessibilityNeeds)) {
    result.accessibilityNeeds = accessibilityNeeds;
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
  if (data.basicInfo.email.trim()) {
    basicInfo.email = data.basicInfo.email.trim();
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
  const skillNames = (data.skills.primaryList ?? []).map((skill) => skill.name);
  if (skillNames.length > 0) {
    payload.skills = skillNames;
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

  // Relocation and work visa preferences
  payload.willing_to_relocate = data.preference.willingToRelocate;
  if (data.preference.hasWorkVisa !== null) {
    payload.has_workvisa = data.preference.hasWorkVisa;
  }

  if (data.accessibilityNeeds) {
    const categories = data.accessibilityNeeds.categories;
    const accommodations = data.accessibilityNeeds.accommodations;
    const accommodationNeed = data.accessibilityNeeds.accommodationNeed.trim();

    if (categories.length > 0) {
      payload.disability_categories = categories;
    }
    if (accommodationNeed) {
      payload.accommodation_needs = toAccommodationNeedValue(accommodationNeed);
    }
    if (accommodations.length > 0) {
      payload.workplace_accommodations = accommodations;
    }
  }

  return payload;
};

export const buildCandidateProfileCorePayload = (
  data: UserData
): Record<string, unknown> => buildCandidateProfileUpdatePayload(data);

export const buildCandidateProfilePatchPayload = (
  data: UserData
): Record<string, unknown> => {
  return buildCandidateProfileCorePayload(data);
};

type BackendEducationEntry = Record<string, unknown>;
type BackendSkillEntry = Record<string, unknown>;
type BackendLanguageEntry = Record<string, unknown>;

const DEFAULT_SKILL_LEVEL = "intermediate";

const normalizeKey = (value: unknown) => toTrimmedString(value).toLowerCase();

const getEducationKey = (entry: Record<string, unknown>) => ({
  course: normalizeKey(
    entry.course_name ?? entry.courseName ?? entry.degree ?? entry.course
  ),
  institution: normalizeKey(entry.institution ?? entry.school),
});

export const buildCandidateEducationPayloads = (
  data: UserData,
  existing: BackendEducationEntry[] = []
): Record<string, unknown>[] => {
  const courseName = data.education.courseName.trim();
  const major = data.education.major.trim();
  const institution = data.education.institution.trim();
  const startYear = extractYear(data.education.from);
  const endYear =
    extractYear(data.education.graduationDate) || extractYear(data.education.to);

  const payload: Record<string, unknown> = {};
  if (courseName) payload.course_name = courseName;
  if (major) payload.major = major;
  if (institution) payload.institution = institution;
  if (startYear) payload.start_year = startYear;
  if (endYear) payload.end_year = endYear;

  if (!hasValue(payload)) return [];

  const payloadKey = getEducationKey(payload);
  if (payloadKey.course || payloadKey.institution) {
    const isDuplicate = existing.some((entry) => {
      const existingKey = getEducationKey(entry);
      if (payloadKey.course && existingKey.course && payloadKey.course !== existingKey.course) {
        return false;
      }
      if (
        payloadKey.institution &&
        existingKey.institution &&
        payloadKey.institution !== existingKey.institution
      ) {
        return false;
      }
      return true;
    });
    if (isDuplicate) return [];
  }

  return [payload];
};

export const buildCandidateSkillPayloads = (
  data: UserData,
  existing: BackendSkillEntry[] = []
): Record<string, unknown>[] => {
  const skillList = data.skills.primaryList ?? [];
  if (skillList.length === 0) return [];

  const existingNames = new Set(
    existing
      .map((entry) =>
        normalizeKey(entry.name ?? entry.skill ?? entry.title ?? entry.label)
      )
      .filter(Boolean)
  );

  return skillList
    .filter((skill) => !existingNames.has(normalizeKey(skill.name)))
    .map((skill) => ({
      name: skill.name,
      level: skill.level || DEFAULT_SKILL_LEVEL,
    }));
};

export const buildCandidateLanguagePayloads = (
  data: UserData,
  existing: BackendLanguageEntry[] = []
): Record<string, unknown>[] => {
  const existingLanguages = new Set(
    existing
      .map((entry) => normalizeKey(entry.language ?? entry.name))
      .filter(Boolean)
  );

  return data.otherDetails.languages
    .map((entry) => {
      const language = entry.language.trim();
      const speaking = normalizeLanguageLevelForBackend(entry.speaking);
      const reading = normalizeLanguageLevelForBackend(entry.reading);
      const writing = normalizeLanguageLevelForBackend(entry.writing);

      if (!language || !speaking || !reading || !writing) return null;
      if (existingLanguages.has(normalizeKey(language))) return null;

      return {
        language,
        speaking,
        reading,
        writing,
      };
    })
    .filter(Boolean) as Record<string, unknown>[];
};
