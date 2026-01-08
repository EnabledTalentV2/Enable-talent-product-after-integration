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

export const mapCandidateProfileToUserData = (
  payload: unknown
): Partial<UserData> => {
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

  const employmentTypes = toStringArray(payload.employment_type_preferences);
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
  if (typeof payload.is_available === "boolean") {
    otherDetails.availability = payload.is_available
      ? "Available"
      : "Not available";
  }

  const result: Partial<UserData> = {};
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
