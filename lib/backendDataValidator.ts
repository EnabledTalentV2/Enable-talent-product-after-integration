/**
 * Backend Data Validator
 *
 * This module validates backend API responses against the expected frontend data structure.
 * It helps identify missing or mismatched fields between frontend expectations and backend responses.
 *
 * Use this to communicate data requirements to the backend team.
 */

export interface FieldMapping {
  frontendPath: string;
  expectedBackendPaths: string[];
  description: string;
  required: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: MissingField[];
  presentFields: string[];
  rawBackendData: Record<string, unknown>;
  timestamp: string;
}

export interface MissingField {
  frontendPath: string;
  expectedBackendPaths: string[];
  description: string;
  required: boolean;
}

/**
 * Field mappings define what the frontend expects and what backend field names should provide the data.
 * Update this when adding new fields or when backend changes field names.
 */
export const USER_DATA_FIELD_MAPPINGS: FieldMapping[] = [
  // Basic Info
  {
    frontendPath: "basicInfo.firstName",
    expectedBackendPaths: ["first_name", "firstName", "basicInfo.firstName"],
    description: "User's first name",
    required: true,
  },
  {
    frontendPath: "basicInfo.lastName",
    expectedBackendPaths: ["last_name", "lastName", "basicInfo.lastName"],
    description: "User's last name",
    required: true,
  },
  {
    frontendPath: "basicInfo.email",
    expectedBackendPaths: ["email", "basicInfo.email"],
    description: "User's email address",
    required: true,
  },
  {
    frontendPath: "basicInfo.phone",
    expectedBackendPaths: ["phone", "phone_number", "basicInfo.phone"],
    description: "User's phone number",
    required: false,
  },
  {
    frontendPath: "basicInfo.location",
    expectedBackendPaths: ["location", "address", "basicInfo.location"],
    description: "User's location/address",
    required: false,
  },
  {
    frontendPath: "basicInfo.citizenshipStatus",
    expectedBackendPaths: [
      "citizenship_status",
      "citizenshipStatus",
      "basicInfo.citizenshipStatus",
    ],
    description: "User's citizenship status",
    required: false,
  },
  {
    frontendPath: "basicInfo.gender",
    expectedBackendPaths: ["gender", "basicInfo.gender"],
    description: "User's gender",
    required: false,
  },
  {
    frontendPath: "basicInfo.linkedinUrl",
    expectedBackendPaths: [
      "linkedin_url",
      "linkedinUrl",
      "linkedin",
      "basicInfo.linkedinUrl",
    ],
    description: "User's LinkedIn profile URL",
    required: false,
  },
  {
    frontendPath: "basicInfo.profilePhoto",
    expectedBackendPaths: [
      "profile_photo",
      "profilePhoto",
      "avatar",
      "profile.avatar",
      "basicInfo.profilePhoto",
    ],
    description: "User's profile photo URL",
    required: false,
  },

  // Work Experience
  {
    frontendPath: "workExperience",
    expectedBackendPaths: ["work_experience", "workExperience"],
    description: "User's work experience section",
    required: true,
  },
  {
    frontendPath: "workExperience.experienceType",
    expectedBackendPaths: [
      "work_experience.experience_type",
      "workExperience.experienceType",
      "experience_type",
    ],
    description:
      "Type of experience (fresher/experienced) - determines form flow",
    required: true,
  },
  {
    frontendPath: "workExperience.entries",
    expectedBackendPaths: [
      "work_experience.entries",
      "workExperience.entries",
      "work_experiences",
    ],
    description: "Array of work experience entries",
    required: false,
  },

  // Education
  {
    frontendPath: "education",
    expectedBackendPaths: ["education"],
    description: "User's education section",
    required: true,
  },
  {
    frontendPath: "education.courseName",
    expectedBackendPaths: [
      "education.course_name",
      "education.courseName",
      "course_name",
    ],
    description: "Name of the course/degree",
    required: false,
  },
  {
    frontendPath: "education.institution",
    expectedBackendPaths: ["education.institution", "institution"],
    description: "Educational institution name",
    required: false,
  },

  // Skills
  {
    frontendPath: "skills",
    expectedBackendPaths: ["skills"],
    description: "User's skills section",
    required: true,
  },
  {
    frontendPath: "skills.skills",
    expectedBackendPaths: ["skills.skills", "skills_text"],
    description: "Skills text/description",
    required: false,
  },
  {
    frontendPath: "skills.primaryList",
    expectedBackendPaths: ["skills.primary_list", "skills.primaryList"],
    description: "List of primary skills",
    required: false,
  },

  // Projects
  {
    frontendPath: "projects",
    expectedBackendPaths: ["projects"],
    description: "User's projects section",
    required: false,
  },

  // Achievements
  {
    frontendPath: "achievements",
    expectedBackendPaths: ["achievements"],
    description: "User's achievements section",
    required: false,
  },

  // Certifications
  {
    frontendPath: "certification",
    expectedBackendPaths: ["certification", "certifications"],
    description: "User's certifications section",
    required: false,
  },

  // Preferences
  {
    frontendPath: "preference",
    expectedBackendPaths: ["preference", "preferences"],
    description: "User's job preferences section",
    required: false,
  },

  // Other Details
  {
    frontendPath: "otherDetails",
    expectedBackendPaths: ["other_details", "otherDetails"],
    description: "Additional user details (languages, availability, etc.)",
    required: false,
  },

  // Review & Agreement
  {
    frontendPath: "reviewAgree",
    expectedBackendPaths: ["review_agree", "reviewAgree"],
    description: "User's review and agreement status",
    required: false,
  },
];

/**
 * Get a value from an object using a dot-notation path
 */
function getValueByPath(
  obj: Record<string, unknown>,
  path: string
): unknown | undefined {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Check if a value is considered "present" (not null, undefined, or empty)
 */
function isValuePresent(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return false;
  }
  return true;
}

/**
 * Validate backend response against expected frontend field mappings
 */
export function validateBackendData(
  backendData: Record<string, unknown>,
  fieldMappings: FieldMapping[] = USER_DATA_FIELD_MAPPINGS
): ValidationResult {
  const missingFields: MissingField[] = [];
  const presentFields: string[] = [];

  for (const mapping of fieldMappings) {
    let found = false;

    // Check each possible backend path
    for (const backendPath of mapping.expectedBackendPaths) {
      const value = getValueByPath(backendData, backendPath);
      if (isValuePresent(value)) {
        found = true;
        presentFields.push(
          `${mapping.frontendPath} ← ${backendPath}: ${JSON.stringify(
            value
          ).slice(0, 50)}`
        );
        break;
      }
    }

    if (!found) {
      missingFields.push({
        frontendPath: mapping.frontendPath,
        expectedBackendPaths: mapping.expectedBackendPaths,
        description: mapping.description,
        required: mapping.required,
      });
    }
  }

  return {
    isValid: missingFields.filter((f) => f.required).length === 0,
    missingFields,
    presentFields,
    rawBackendData: backendData,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate a report string for sharing with the backend team
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [
    "=".repeat(60),
    "FRONTEND-BACKEND DATA VALIDATION REPORT",
    `Generated: ${result.timestamp}`,
    "=".repeat(60),
    "",
    `Overall Status: ${
      result.isValid
        ? "✅ VALID (all required fields present)"
        : "❌ INVALID (missing required fields)"
    }`,
    "",
  ];

  const requiredMissing = result.missingFields.filter((f) => f.required);
  const optionalMissing = result.missingFields.filter((f) => !f.required);

  if (requiredMissing.length > 0) {
    lines.push("🚨 REQUIRED FIELDS MISSING FROM BACKEND:");
    lines.push("-".repeat(40));
    for (const field of requiredMissing) {
      lines.push(`  Frontend needs: ${field.frontendPath}`);
      lines.push(`  Description: ${field.description}`);
      lines.push(
        `  Backend should provide one of: ${field.expectedBackendPaths.join(
          ", "
        )}`
      );
      lines.push("");
    }
  }

  if (optionalMissing.length > 0) {
    lines.push("⚠️ OPTIONAL FIELDS MISSING FROM BACKEND:");
    lines.push("-".repeat(40));
    for (const field of optionalMissing) {
      lines.push(`  Frontend needs: ${field.frontendPath}`);
      lines.push(`  Description: ${field.description}`);
      lines.push(
        `  Backend should provide one of: ${field.expectedBackendPaths.join(
          ", "
        )}`
      );
      lines.push("");
    }
  }

  if (result.presentFields.length > 0) {
    lines.push("✅ FIELDS SUCCESSFULLY MAPPED:");
    lines.push("-".repeat(40));
    for (const field of result.presentFields) {
      lines.push(`  ${field}`);
    }
    lines.push("");
  }

  lines.push("RAW BACKEND RESPONSE:");
  lines.push("-".repeat(40));
  lines.push(JSON.stringify(result.rawBackendData, null, 2));

  return lines.join("\n");
}

/**
 * Log validation results to console (for development)
 */
export function logValidationToConsole(result: ValidationResult): void {
  const requiredMissing = result.missingFields.filter((f) => f.required);
  const optionalMissing = result.missingFields.filter((f) => !f.required);

  console.group("🔍 Backend Data Validation");

  if (result.isValid) {
    console.log("✅ All required fields present");
  } else {
    // Use console.warn instead of console.error to avoid triggering Next.js error overlay
    console.warn("❌ Missing required fields detected!");
  }

  if (requiredMissing.length > 0) {
    console.group("🚨 Required Fields Missing");
    console.table(
      requiredMissing.map((f) => ({
        "Frontend Path": f.frontendPath,
        Description: f.description,
        "Expected Backend Fields": f.expectedBackendPaths.join(" | "),
      }))
    );
    console.groupEnd();
  }

  if (optionalMissing.length > 0) {
    console.group("⚠️ Optional Fields Missing");
    console.table(
      optionalMissing.map((f) => ({
        "Frontend Path": f.frontendPath,
        Description: f.description,
        "Expected Backend Fields": f.expectedBackendPaths.join(" | "),
      }))
    );
    console.groupEnd();
  }

  console.group("📦 Raw Backend Response");
  console.log(result.rawBackendData);
  console.groupEnd();

  console.groupEnd();
}
