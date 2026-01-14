import type { EmployerOrganizationInfo } from "@/lib/employerDataStore";

const INDUSTRY_LABELS: Record<string, string> = {
  "1": "Information Technology",
  "2": "Healthcare",
  "3": "Finance",
  "4": "Education",
  "5": "Other",
};

const COMPANY_SIZE_LABELS: Record<string, string> = {
  "1": "1-10",
  "2": "10-100",
  "3": "100-1000",
  "4": "1000-10000",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const normalizeChoice = (
  value: unknown,
  choices: Record<string, string>
): string => {
  const raw = toStringValue(value).trim();
  if (!raw) return "";
  return choices[raw] ?? raw;
};

const toCompanySizeRange = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 1 && value <= 10) return "1-10";
    if (value >= 11 && value <= 100) return "10-100";
    if (value >= 101 && value <= 1000) return "100-1000";
    if (value >= 1001 && value <= 10000) return "1000-10000";
    return "";
  }

  const raw = toStringValue(value).trim();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) return "";
    if (numeric >= 1 && numeric <= 10) return "1-10";
    if (numeric >= 11 && numeric <= 100) return "10-100";
    if (numeric >= 101 && numeric <= 1000) return "100-1000";
    if (numeric >= 1001 && numeric <= 10000) return "1000-10000";
    return "";
  }

  return COMPANY_SIZE_LABELS[raw] ?? raw;
};

const getFirstOrganization = (
  payload: unknown
): Record<string, unknown> | null => {
  if (Array.isArray(payload)) {
    const first = payload[0];
    return isRecord(first) ? first : null;
  }

  if (!isRecord(payload)) return null;

  const listCandidates = [payload.results, payload.organizations, payload.data];

  for (const candidate of listCandidates) {
    if (Array.isArray(candidate)) {
      const first = candidate[0];
      if (isRecord(first)) return first;
    }
  }

  const hasOrgShape =
    "name" in payload ||
    "organizationName" in payload ||
    "organization_name" in payload ||
    "headquarter_location" in payload;

  return hasOrgShape ? payload : null;
};

export const toEmployerOrganizationInfo = (
  payload: unknown
): EmployerOrganizationInfo | null => {
  const record = getFirstOrganization(payload);
  if (!record) return null;

  const organizationId =
    typeof record.id === "number" ? record.id : undefined;
  const organizationName = toStringValue(
    record.name ?? record.organizationName ?? record.organization_name
  );
  const aboutOrganization = toStringValue(
    record.about ??
      record.aboutOrganization ??
      record.about_organization ??
      record.description
  );
  const location = toStringValue(
    record.headquarter_location ?? record.location
  );
  const foundedYear = toStringValue(
    record.founded_year ?? record.foundedYear ?? record.founded
  );
  const website = toStringValue(record.url ?? record.website);
  const linkedinUrl = toStringValue(
    record.linkedin_url ?? record.linkedinUrl ?? record.linkedin
  );
  const companySize = toCompanySizeRange(
    record.employee_size ??
      record.employeeSize ??
      record.companySize ??
      record.company_size
  );
  const industry = normalizeChoice(
    record.industry ?? record.industry_name ?? record.industryName,
    INDUSTRY_LABELS
  );

  const hasAny =
    organizationName ||
    aboutOrganization ||
    location ||
    foundedYear ||
    website ||
    linkedinUrl ||
    companySize ||
    industry;

  if (!hasAny) return null;

  return {
    organizationId,
    organizationName,
    aboutOrganization,
    location,
    foundedYear,
    website,
    linkedinUrl,
    companySize,
    industry,
  };
};
