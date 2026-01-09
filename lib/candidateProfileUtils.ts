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
  const linkedin = (
    data.basicInfo.linkedinUrl || data.basicInfo.socialProfile || ""
  ).trim();
  const skills = normalizeSkills(data.skills.skills, data.skills.primaryList);
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
      };
    })
    .filter((entry) => entry.company && entry.role && entry.start_date);

  const payload: Record<string, unknown> = {};
  const email = data.basicInfo.email.trim();
  const name = [data.basicInfo.firstName, data.basicInfo.lastName]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");

  if (email) {
    payload.email = email;
  }

  if (name) {
    payload.name = name;
  }

  if (skills.length) {
    payload.skills = skills;
  }

  if (workExperience.length) {
    payload.work_experience = workExperience;
  }

  if (linkedin) {
    payload.linkedin = linkedin;
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
