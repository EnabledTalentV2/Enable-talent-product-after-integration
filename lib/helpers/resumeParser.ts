import { apiRequest } from "@/lib/api-client";
import { transformBackendResumeData } from "@/lib/transformers/resumeData.transformer";
import type { UserData } from "@/lib/types/user";
import {
  PARSE_FAILURE_MESSAGE,
  PARSE_TIMEOUT_MESSAGE,
  PARSING_POLL_DELAY_MS,
  PARSING_MAX_ATTEMPTS,
} from "@/lib/constants/accessibilityNeeds";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export type UserDataPatch = {
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

export type ParseFailureReason = "timeout" | "error" | "no_data" | null;

export type PollResult = {
  success: boolean;
  data: UserDataPatch | null;
  failureReason: ParseFailureReason;
  errorMessage?: string;
};

export const extractUserDataPatch = (payload: unknown): UserDataPatch => {
  console.log("[extractUserDataPatch] Input payload:", payload);

  if (!isRecord(payload)) {
    console.log("[extractUserDataPatch] Payload is not a record");
    return {};
  }

  const candidate =
    (isRecord(payload.resume) && payload.resume) ||
    (isRecord(payload.data) && payload.data) ||
    (isRecord(payload.parsed_data) && payload.parsed_data) ||
    (isRecord(payload.parsedData) && payload.parsedData) ||
    (isRecord(payload.resume_data) && payload.resume_data) ||
    (isRecord(payload.resumeData) && payload.resumeData) ||
    (isRecord(payload.userData) && payload.userData) ||
    payload;

  console.log("[extractUserDataPatch] Candidate extracted:", candidate);

  if (!isRecord(candidate)) {
    console.log("[extractUserDataPatch] Candidate is not a record");
    return {};
  }

  const patch: UserDataPatch = {};

  if (isRecord(candidate.basicInfo))
    patch.basicInfo = candidate.basicInfo as Partial<UserData["basicInfo"]>;
  if (isRecord(candidate.education))
    patch.education = candidate.education as Partial<UserData["education"]>;
  if (isRecord(candidate.workExperience))
    patch.workExperience = candidate.workExperience as Partial<
      UserData["workExperience"]
    >;
  if (isRecord(candidate.skills))
    patch.skills = candidate.skills as Partial<UserData["skills"]>;
  if (isRecord(candidate.projects))
    patch.projects = candidate.projects as Partial<UserData["projects"]>;
  if (isRecord(candidate.achievements))
    patch.achievements = candidate.achievements as Partial<
      UserData["achievements"]
    >;
  if (isRecord(candidate.certification))
    patch.certification = candidate.certification as Partial<
      UserData["certification"]
    >;
  if (isRecord(candidate.preference))
    patch.preference = candidate.preference as Partial<UserData["preference"]>;
  if (isRecord(candidate.otherDetails))
    patch.otherDetails = candidate.otherDetails as Partial<
      UserData["otherDetails"]
    >;
  if (isRecord(candidate.reviewAgree))
    patch.reviewAgree = candidate.reviewAgree as UserData["reviewAgree"];

  const resumeData =
    (isRecord(payload.resume) && payload.resume) ||
    (isRecord(payload.resume_data) && payload.resume_data) ||
    (isRecord(payload.resumeData) && payload.resumeData) ||
    (isRecord(candidate.resume_data) && candidate.resume_data) ||
    (isRecord(candidate.resumeData) && candidate.resumeData) ||
    (!("basicInfo" in candidate) &&
    (typeof candidate.name === "string" ||
      typeof candidate.email === "string" ||
      Array.isArray(candidate.skills) ||
      typeof candidate.skills === "string")
      ? candidate
      : null);

  console.log("[extractUserDataPatch] Resume data found:", resumeData);

  if (resumeData) {
    console.log("[extractUserDataPatch] Transforming backend resume data...");
    const transformedData = transformBackendResumeData(resumeData);
    console.log("[extractUserDataPatch] Transformed data:", transformedData);

    if (
      transformedData.basicInfo &&
      Object.keys(patch.basicInfo || {}).length === 0
    ) {
      patch.basicInfo = transformedData.basicInfo;
    }
    if (
      transformedData.education &&
      Object.keys(patch.education || {}).length === 0
    ) {
      patch.education = transformedData.education;
    }
    if (
      transformedData.workExperience &&
      Object.keys(patch.workExperience || {}).length === 0
    ) {
      patch.workExperience = transformedData.workExperience;
    }
    if (
      transformedData.skills &&
      Object.keys(patch.skills || {}).length === 0
    ) {
      patch.skills = transformedData.skills;
    }
    if (
      transformedData.projects &&
      Object.keys(patch.projects || {}).length === 0
    ) {
      patch.projects = transformedData.projects;
    }
    if (
      transformedData.achievements &&
      Object.keys(patch.achievements || {}).length === 0
    ) {
      patch.achievements = transformedData.achievements;
    }
    if (
      transformedData.certification &&
      Object.keys(patch.certification || {}).length === 0
    ) {
      patch.certification = transformedData.certification;
    }
    if (
      transformedData.otherDetails &&
      Object.keys(patch.otherDetails || {}).length === 0
    ) {
      patch.otherDetails = transformedData.otherDetails;
    }
  }

  console.log("[extractUserDataPatch] Final patch to return:", patch);
  console.log("[extractUserDataPatch] Patch has keys:", Object.keys(patch));

  return patch;
};

export const mergeUserData = (prev: UserData, patch: UserDataPatch): UserData => ({
  ...prev,
  basicInfo: patch.basicInfo
    ? { ...prev.basicInfo, ...patch.basicInfo }
    : prev.basicInfo,
  education: patch.education
    ? { ...prev.education, ...patch.education }
    : prev.education,
  workExperience: patch.workExperience
    ? { ...prev.workExperience, ...patch.workExperience }
    : prev.workExperience,
  skills: patch.skills ? { ...prev.skills, ...patch.skills } : prev.skills,
  projects: patch.projects
    ? { ...prev.projects, ...patch.projects }
    : prev.projects,
  achievements: patch.achievements
    ? { ...prev.achievements, ...patch.achievements }
    : prev.achievements,
  certification: patch.certification
    ? { ...prev.certification, ...patch.certification }
    : prev.certification,
  preference: patch.preference
    ? { ...prev.preference, ...patch.preference }
    : prev.preference,
  otherDetails: patch.otherDetails
    ? { ...prev.otherDetails, ...patch.otherDetails }
    : prev.otherDetails,
  reviewAgree: patch.reviewAgree
    ? { ...prev.reviewAgree, ...patch.reviewAgree }
    : prev.reviewAgree,
});

export const fetchGeneratedAbout = async (): Promise<string | null> => {
  try {
    const response = await apiRequest<unknown>(
      "/api/candidates/test/generate-about/",
      { method: "POST" },
    );
    if (
      isRecord(response) &&
      typeof response.generated_about === "string" &&
      response.generated_about.trim()
    ) {
      return response.generated_about.trim();
    }
  } catch (err) {
    console.warn("[Resume Parser] Failed to generate about:", err);
  }
  return null;
};

export const pollForParsedData = async (slug: string, logLabel = "Resume Parser"): Promise<PollResult> => {
  console.log(
    `[${logLabel}] Starting to poll parsing-status endpoint (max ${PARSING_MAX_ATTEMPTS} attempts, ${(PARSING_MAX_ATTEMPTS * PARSING_POLL_DELAY_MS) / 1000}s timeout)`,
  );

  for (let attempt = 0; attempt < PARSING_MAX_ATTEMPTS; attempt += 1) {
    try {
      // Poll the parsing-status endpoint with include_resume parameter
      const response = await apiRequest<unknown>(
        `/api/candidates/profiles/${slug}/parsing-status/?include_resume=true`,
        { method: "GET" },
      );

      console.log(
        `[${logLabel}] Parsing status (attempt ${attempt + 1}/${PARSING_MAX_ATTEMPTS}):`,
        response,
      );

      // Check parsing status
      if (isRecord(response)) {
        const status = String(response.parsing_status || "").toLowerCase();
        const hasResumeData = Boolean(
          response.has_resume_data ||
            response.hasResumeData ||
            response.resume_data ||
            response.resumeData
        );

        // Status: parsed OR resume_data already present
        if (status === "parsed" || hasResumeData) {
          console.log(`[${logLabel}] Resume parsing completed!`);
          console.log(`[${logLabel}] Full response:`, response);

          const patch = extractUserDataPatch(response);
          console.log(`[${logLabel}] Extracted patch:`, patch);
          console.log(`[${logLabel}] Patch keys:`, Object.keys(patch));

          if (Object.keys(patch).length > 0) {
            console.log(`[${logLabel}] Extracted resume data:`, patch);
            return { success: true, data: patch, failureReason: null };
          }

          console.warn(
            `[${logLabel}] Parsing completed but no data found`,
          );
          console.warn(
            `[${logLabel}] Response structure:`,
            JSON.stringify(response, null, 2),
          );
          return {
            success: false,
            data: null,
            failureReason: "no_data",
            errorMessage:
              "Resume was processed but no data could be extracted. The file may be corrupted or in an unsupported format.",
          };
        }

        // Status: failed - resume parsing failed
        if (status === "failed" || status === "error") {
          const errorMsg = String(
            response.error || response.message || PARSE_FAILURE_MESSAGE,
          );
          console.error(`[${logLabel}] Parsing ${status}:`, errorMsg);
          return {
            success: false,
            data: null,
            failureReason: "error",
            errorMessage: errorMsg,
          };
        }

        // Status: parsing - still processing, continue polling
        if (status === "parsing") {
          console.log(
            `[${logLabel}] Still parsing... (attempt ${attempt + 1}/${PARSING_MAX_ATTEMPTS})`,
          );
          // Continue to next iteration
        } else {
          // Unknown status
          console.warn(
            `[${logLabel}] Unknown parsing status: "${status}"`,
          );
        }
      }
    } catch (err) {
      console.warn(
        `[${logLabel}] Parsing status poll error (attempt ${attempt + 1}):`,
        err,
      );

      // On last attempt, return error
      if (attempt === PARSING_MAX_ATTEMPTS - 1) {
        return {
          success: false,
          data: null,
          failureReason: "error",
          errorMessage:
            err instanceof Error ? err.message : PARSE_FAILURE_MESSAGE,
        };
      }
    }

    // Wait before next poll (except on last attempt)
    if (attempt < PARSING_MAX_ATTEMPTS - 1) {
      await sleep(PARSING_POLL_DELAY_MS);
    }
  }

  console.log(
    `[${logLabel}] Polling timed out after ${PARSING_MAX_ATTEMPTS} attempts (${(PARSING_MAX_ATTEMPTS * PARSING_POLL_DELAY_MS) / 1000}s)`,
  );
  return {
    success: false,
    data: null,
    failureReason: "timeout",
    errorMessage: PARSE_TIMEOUT_MESSAGE,
  };
};
