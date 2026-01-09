/**
 * Reusable field mappers for data transformation
 * These handle common patterns across all entities
 */

/**
 * Generic choice field mapper
 * Handles numeric IDs or string labels from backend
 */
export const choiceField = <T extends string>(
  value: unknown,
  mapping: Record<number, T>
): T | "" => {
  if (typeof value === "number") {
    return mapping[value] ?? "";
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    // Try exact match
    const found = Object.entries(mapping).find(
      ([_, label]) => label.toLowerCase() === trimmed.toLowerCase()
    );
    return found ? (found[1] as T) : (trimmed as T);
  }
  return "";
};

/**
 * Try multiple field names (handles snake_case/camelCase variants)
 */
export const tryFields = <T>(
  obj: Record<string, unknown>,
  ...keys: string[]
): T | undefined => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key] as T;
    }
  }
  return undefined;
};

/**
 * Convert unknown value to string
 */
export const toString = (value: unknown): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

/**
 * Parse salary to number, handling various formats
 */
export const parseSalary = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

/**
 * Check if value is a record object
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Employment type mapper (used across jobs and candidate profiles)
 */
export const employmentTypeMapper = {
  toFrontend: (value: unknown): string => {
    return choiceField(value, {
      1: "Full time",
      2: "Part time",
      3: "Contract",
      4: "Internship",
    });
  },
  toBackend: (value: string): number => {
    const mapping: Record<string, number> = {
      "Full time": 1,
      "Part time": 2,
      "Contract": 3,
      "Internship": 4,
      "Hourly based": 3, // Map to Contract
    };
    return mapping[value] ?? 1;
  },
};

/**
 * Work arrangement mapper (Remote/Onsite/Hybrid)
 */
export const workArrangementMapper = {
  toFrontend: (value: unknown): string => {
    return choiceField(value, {
      1: "Remote",
      2: "Onsite",
      3: "Hybrid",
    });
  },
  toBackend: (value: string): number => {
    const mapping: Record<string, number> = {
      "Remote": 1,
      "Onsite": 2,
      "Hybrid": 3,
    };
    return mapping[value] ?? 1;
  },
};

/**
 * Job status mapper
 */
export const jobStatusMapper = {
  toFrontend: (value: unknown): "Active" | "Closed" | "Draft" => {
    const status = choiceField(value, {
      1: "Active",
      2: "Closed",
      3: "Draft",
    });
    return (status || "Active") as "Active" | "Closed" | "Draft";
  },
  toBackend: (value: string): number => {
    const mapping: Record<string, number> = {
      "Active": 1,
      "Closed": 2,
      "Draft": 3,
    };
    return mapping[value] ?? 1;
  },
};

/**
 * Boolean to Yes/No string
 */
export const booleanToYesNo = (value: unknown): "Yes" | "No" => {
  if (value === true || value === "true" || value === "Yes") return "Yes";
  return "No";
};

/**
 * Yes/No string to boolean
 */
export const yesNoToBoolean = (value: string): boolean => {
  return value === "Yes";
};

/**
 * Extract array from various response wrapper formats
 */
export const extractArray = <T>(
  payload: unknown,
  wrapperKeys: string[] = ["results", "data", "items"]
): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (isRecord(payload)) {
    for (const key of wrapperKeys) {
      if (Array.isArray(payload[key])) {
        return payload[key] as T[];
      }
    }
  }
  return [];
};
