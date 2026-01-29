export type UserRole = "employer" | "candidate";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasNonEmptyArray = (value: unknown): value is unknown[] =>
  Array.isArray(value) && value.length > 0;

const USER_DATA_KEYS = ["data", "user", "profile", "me", "result"] as const;
const USER_COLLECTION_KEYS = ["results", "items", "users"] as const;

const looksLikeUserData = (record: Record<string, unknown>) =>
  typeof record.email === "string" ||
  "is_candidate" in record ||
  "is_employer" in record ||
  "organization" in record ||
  "organization_id" in record ||
  "organizationId" in record ||
  "organizations" in record ||
  "role" in record ||
  "user_type" in record ||
  "userType" in record;

const unwrapUserData = (data: unknown): Record<string, unknown> | null => {
  if (!isRecord(data)) return null;
  if (looksLikeUserData(data)) return data;

  for (const key of USER_DATA_KEYS) {
    const nested = data[key];
    if (isRecord(nested) && looksLikeUserData(nested)) return nested;
  }

  for (const key of USER_COLLECTION_KEYS) {
    const nested = data[key];
    if (Array.isArray(nested)) {
      const entry = nested.find(isRecord);
      if (entry && looksLikeUserData(entry)) return entry;
    }
  }

  return data;
};

export const deriveUserRoleFromUserData = (
  data: unknown
): UserRole | null => {
  const record = unwrapUserData(data);
  if (!record) return null;

  const roleValue =
    (typeof record.role === "string" && record.role) ||
    (typeof record.user_type === "string" && record.user_type) ||
    (typeof record.userType === "string" && record.userType) ||
    null;

  if (roleValue) {
    const normalized = roleValue.toLowerCase();
    if (normalized.includes("employer")) return "employer";
    if (
      normalized.includes("candidate") ||
      normalized.includes("talent") ||
      normalized.includes("job")
    ) {
      return "candidate";
    }
  }

  const isEmployer =
    record.is_employer === true ||
    record.isEmployer === true ||
    Boolean(record.organization) ||
    Boolean(record.organization_id) ||
    Boolean(record.organizationId) ||
    hasNonEmptyArray(record.organizations);

  if (isEmployer) return "employer";

  const candidateFlag =
    record.is_candidate === true || record.isCandidate === true
      ? true
      : record.is_candidate === false || record.isCandidate === false
      ? false
      : null;

  if (candidateFlag === false) return "employer";

  const isCandidate =
    candidateFlag === true ||
    Boolean(record.candidate_profile) ||
    Boolean(record.candidateProfile);

  if (isCandidate) return "candidate";

  return null;
};
