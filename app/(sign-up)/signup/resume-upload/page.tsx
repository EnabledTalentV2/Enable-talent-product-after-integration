"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/signup/Navbar";
import Link from "next/link";
import { X } from "lucide-react";
import {
  DEFAULT_ACCOMMODATION_NEEDS,
  ensureCandidateProfileSlug,
} from "@/lib/candidateProfile";
import { useUserDataStore } from "@/lib/userDataStore";
import type { UserData } from "@/lib/types/user";
import { apiRequest, handleSessionExpiry } from "@/lib/api-client";
import { transformBackendResumeData } from "@/lib/transformers/resumeData.transformer";

// Resume upload configuration
const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
];
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Parsing polling configuration
const POLLING_MAX_ATTEMPTS = 20; // Total attempts
const POLLING_DELAY_MS = 1500; // Delay between attempts (1.5 seconds)
const POLLING_TIMEOUT_SECONDS = (POLLING_MAX_ATTEMPTS * POLLING_DELAY_MS) / 1000; // 30 seconds

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_RESUME_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET || "media";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Validates if a file is an allowed resume type.
 * Checks both MIME type and file extension for compatibility.
 */
const isAllowedFile = (file: File) => {
  // Check MIME type first
  if (file.type) {
    if (allowedMimeTypes.has(file.type)) return true;
    if (file.type.startsWith("image/")) return true;
  }

  // Fallback to extension check (for browsers that don't set MIME type correctly)
  const name = file.name.toLowerCase();
  return allowedExtensions.some((ext) => name.endsWith(ext));
};

type UploadStage = "idle" | "uploading" | "saving" | "parsing" | "polling";

const getUploadStageMessage = (stage: UploadStage): string | null => {
  switch (stage) {
    case "uploading":
      return "Uploading resume to storage...";
    case "saving":
      return "Saving resume URL to profile...";
    case "parsing":
      return "Triggering resume parsing...";
    case "polling":
      return "Polling for parsed data...";
    default:
      return null;
  }
};

const getErrorMessage = (err: unknown): string =>
  err && typeof err === "object" && "message" in err
    ? String((err as { message?: string }).message || "")
    : "";

const normalizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_");

const createResumeStoragePath = (candidateSlug: string, fileName: string) => {
  const safeName = normalizeFileName(fileName);
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${candidateSlug}/${uniqueId}-${safeName}`;
};

const buildResumePublicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_RESUME_BUCKET}/${path}`;

const uploadResumeToStorage = async (
  file: File,
  candidateSlug: string
): Promise<string> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Resume storage is not configured.");
  }

  if (!file || file.size === 0) {
    throw new Error("Invalid file: file is empty or not provided.");
  }

  // Check file size limit
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller file.`
    );
  }

  const objectPath = createResumeStoragePath(candidateSlug, file.name);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_RESUME_BUCKET}/${encodeURI(
    objectPath
  )}`;

  console.log(
    `[Resume Upload] Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`
  );

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    let message =
      typeof errorData?.message === "string"
        ? errorData.message
        : "Failed to upload resume.";

    if (message.toLowerCase().includes("bucket not found")) {
      message = `Storage bucket '${SUPABASE_RESUME_BUCKET}' not found. Please create a public bucket named '${SUPABASE_RESUME_BUCKET}' in your Supabase project.`;
    } else if (uploadResponse.status === 413) {
      message = "File is too large. Please upload a file smaller than 10MB.";
    } else if (uploadResponse.status === 401 || uploadResponse.status === 403) {
      message = "Storage authentication failed. Please refresh and try again.";
    }

    throw new Error(message);
  }

  const publicUrl = buildResumePublicUrl(objectPath);
  console.log("[Resume Upload] File uploaded to:", publicUrl);

  return publicUrl;
};

type UserDataPatch = {
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


/**
 * Extracts user data from various possible API response formats.
 * Handles multiple response structures from the backend to ensure compatibility.
 */
const extractUserDataPatch = (payload: unknown): UserDataPatch => {
  if (!isRecord(payload)) return {};

  // Try to find candidate data in various possible response structures
  const candidate =
    (isRecord(payload.data) && payload.data) ||
    (isRecord(payload.parsed_data) && payload.parsed_data) ||
    (isRecord(payload.parsedData) && payload.parsedData) ||
    (isRecord(payload.resume_data) && payload.resume_data) ||
    (isRecord(payload.resumeData) && payload.resumeData) ||
    (isRecord(payload.userData) && payload.userData) ||
    payload;
  if (!isRecord(candidate)) return {};

  const patch: UserDataPatch = {};

  // First, try to extract already-structured UserData format (verified_data)
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

  // Second, try to find and transform resume_data from backend
  const resumeData =
    (isRecord(payload.resume_data) && payload.resume_data) ||
    (isRecord(payload.resumeData) && payload.resumeData) ||
    (isRecord(candidate.resume_data) && candidate.resume_data) ||
    (isRecord(candidate.resumeData) && candidate.resumeData) ||
    // If no structured data exists, try the root object
    (!("basicInfo" in candidate) &&
    (typeof candidate.name === "string" ||
      typeof candidate.email === "string" ||
      Array.isArray(candidate.skills) ||
      typeof candidate.skills === "string")
      ? candidate
      : null);

  // Use the comprehensive transformer to convert backend resume_data
  if (resumeData) {
    console.log("[Resume Upload] Transforming resume_data:", resumeData);
    const transformedData = transformBackendResumeData(resumeData);
    console.log("[Resume Upload] Transformed data:", transformedData);

    // Merge transformed data, but don't override already-structured data
    if (transformedData.basicInfo && Object.keys(patch.basicInfo || {}).length === 0) {
      patch.basicInfo = transformedData.basicInfo;
    }
    if (transformedData.education && Object.keys(patch.education || {}).length === 0) {
      patch.education = transformedData.education;
    }
    if (transformedData.workExperience && Object.keys(patch.workExperience || {}).length === 0) {
      patch.workExperience = transformedData.workExperience;
    }
    if (transformedData.skills && Object.keys(patch.skills || {}).length === 0) {
      patch.skills = transformedData.skills;
    }
    if (transformedData.projects && Object.keys(patch.projects || {}).length === 0) {
      patch.projects = transformedData.projects;
    }
    if (transformedData.achievements && Object.keys(patch.achievements || {}).length === 0) {
      patch.achievements = transformedData.achievements;
    }
    if (transformedData.certification && Object.keys(patch.certification || {}).length === 0) {
      patch.certification = transformedData.certification;
    }
    if (transformedData.otherDetails && Object.keys(patch.otherDetails || {}).length === 0) {
      patch.otherDetails = transformedData.otherDetails;
    }
  }

  return patch;
};

const mergeUserData = (prev: UserData, patch: UserDataPatch): UserData => ({
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

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getParsingStatus = (payload: unknown): string | null => {
  if (!isRecord(payload)) return null;
  const status =
    (typeof payload.status === "string" && payload.status) ||
    (typeof payload.state === "string" && payload.state) ||
    (typeof payload.parsing_status === "string" && payload.parsing_status) ||
    (typeof payload.parsingStatus === "string" && payload.parsingStatus) ||
    null;
  return status ? status.toLowerCase() : null;
};

export default function ResumeUpload() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const userData = useUserDataStore((s) => s.userData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [candidateSlug, setCandidateSlug] = useState<string | null>(null);
  const uploadStageMessage = getUploadStageMessage(uploadStage);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          console.log(
            "[Resume Upload] Session check failed with status:",
            response.status
          );
          // Add return URL for better UX
          const returnUrl = encodeURIComponent("/signup/resume-upload");
          router.replace(`/login-talent?returnUrl=${returnUrl}`);
          return;
        }

        const userData = await response.json().catch(() => ({}));
        const isCandidate = Boolean(userData?.is_candidate);

        if (!active) return;

        const slug = await ensureCandidateProfileSlug({
          logLabel: "Resume Upload",
        });

        if (!active) return;

        if (!slug) {
          setError("Unable to process your profile. Please refresh the page.");
          setLoading(false);
          return;
        }

        if (!isCandidate) {
          console.log("[Resume Upload] Candidate profile created for user.");
        }

        setCandidateSlug(slug);
        setLoading(false);
      } catch (err) {
        console.error("[Resume Upload] Session check error:", err);
        const returnUrl = encodeURIComponent("/signup/resume-upload");
        router.replace(`/login-talent?returnUrl=${returnUrl}`);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  /**
   * Check parsing status once to see if data is already available
   */
  const checkParsingStatus = async (
    slug: string
  ): Promise<UserDataPatch | null> => {
    try {
      console.log("[Resume Upload] Checking current parsing status");
      const statusData = await apiRequest<unknown>(
        `/api/candidates/profiles/${slug}/parsing-status/`,
        { method: "GET" }
      );
      const patch = extractUserDataPatch(statusData);
      if (Object.keys(patch).length > 0) {
        console.log(
          "[Resume Upload] Found existing parsed data in status check"
        );
        return patch;
      }

      const status = getParsingStatus(statusData);
      console.log("[Resume Upload] Current parsing status:", status || "none");
      return null;
    } catch (err) {
      // Check if session expired
      if (handleSessionExpiry(err, router)) {
        throw err; // Re-throw to stop execution
      }
      console.warn("[Resume Upload] Status check error:", err);
      return null;
    }
  };

  /**
   * Poll for parsed data after triggering parse
   */
  const pollForParsedData = async (
    slug: string
  ): Promise<UserDataPatch | null> => {
    console.log(
      `[Resume Upload] Starting polling (max ${POLLING_TIMEOUT_SECONDS}s timeout)`
    );

    for (let attempt = 0; attempt < POLLING_MAX_ATTEMPTS; attempt += 1) {
      try {
        console.log(
          `[Resume Upload] Polling attempt ${attempt + 1}/${POLLING_MAX_ATTEMPTS}`
        );
        const statusData = await apiRequest<unknown>(
          `/api/candidates/profiles/${slug}/parsing-status/`,
          { method: "GET" }
        );

        const status = getParsingStatus(statusData);
        console.log(`[Resume Upload] Current parsing status: ${status}`);

        // Check if parsing is complete
        if (status === "parsed") {
          console.log("[Resume Upload] Parsing completed! Fetching parsed data from profile...");

          // Fetch the actual parsed data from the profile detail endpoint
          try {
            const profileData = await apiRequest<unknown>(
              `/api/candidates/profiles/${slug}/`,
              { method: "GET" }
            );
            console.log("[Resume Upload] Profile data received:", JSON.stringify(profileData, null, 2));

            const patch = extractUserDataPatch(profileData);
            console.log("[Resume Upload] Extracted patch:", JSON.stringify(patch, null, 2));

            if (Object.keys(patch).length > 0) {
              console.log("[Resume Upload] Successfully received parsed data from profile");
              return patch;
            } else {
              console.warn("[Resume Upload] Profile fetched but no parsed data found");
              console.warn("[Resume Upload] Raw profile data keys:", Object.keys(profileData || {}));
            }
          } catch (fetchErr) {
            console.error("[Resume Upload] Failed to fetch profile data after parsing:", fetchErr);
          }
        }

        if (status && ["failed", "error"].includes(status)) {
          console.warn(
            "[Resume Upload] Backend reported parsing failed:",
            status
          );
          return null;
        }
      } catch (err) {
        // Check if session expired
        if (handleSessionExpiry(err, router)) {
          throw err; // Re-throw to stop polling
        }
        console.warn(
          `[Resume Upload] Parsing status error (attempt ${attempt + 1}):`,
          err
        );
      }

      await sleep(POLLING_DELAY_MS);
    }

    console.warn(
      `[Resume Upload] Polling timeout after ${POLLING_TIMEOUT_SECONDS}s (${POLLING_MAX_ATTEMPTS} attempts)`
    );
    return null;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedFile(file)) {
      setError("Upload a PDF, DOC, DOCX, or image file.");
      setSelectedFile(null);
      setSelectedFileName(null);
      event.target.value = "";
      return;
    }

    setError(null);
    setParseWarning(null);
    setSelectedFileName(file.name);
    setSelectedFile(file);
    setUploadStage("idle");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedFileName(null);
    setError(null);
    setParseWarning(null);
    setUploadStage("idle");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendForParsing = async () => {
    if (isUploading) return;

    if (!selectedFile) {
      setError("Select a resume file to continue.");
      return;
    }

    if (!candidateSlug) {
      setError("Unable to process your profile. Please refresh the page.");
      return;
    }

    setError(null);
    setParseWarning(null);
    resetUserData();
    setIsUploading(true);
    setUploadStage("uploading");

    let parsedSuccessfully = false;

    try {
      // Step 1: Upload resume to Supabase storage
      console.log("[Resume Upload] Starting file upload to storage");
      let resumeUrl = "";
      try {
        resumeUrl = await uploadResumeToStorage(selectedFile, candidateSlug);
        console.log("[Resume Upload] File uploaded successfully:", resumeUrl);
      } catch (err) {
        const message = getErrorMessage(err);
        console.error("[Resume Upload] Storage upload failed:", err);
        setParseWarning(
          message
            ? `Failed to upload resume: ${message}`
            : "Failed to upload resume. Please try again."
        );
        return;
      }

      // Validate resume URL before proceeding
      if (!resumeUrl || !resumeUrl.startsWith("http")) {
        console.error("[Resume Upload] Invalid resume URL:", resumeUrl);
        setParseWarning(
          "Failed to generate valid resume URL. Please try again."
        );
        return;
      }

      // Step 2: Clear old data and save new resume URL to candidate profile
      setUploadStage("saving");
      console.log("[Resume Upload] Clearing old parsed data and saving new resume URL");

      const uploadData = new FormData();
      uploadData.append("resume_file", resumeUrl);

      // Use accessibility data from user if available
      const accommodationNeeds = userData.accessibilityNeeds?.accommodationNeed
        ? userData.accessibilityNeeds.accommodationNeed.toUpperCase()
        : DEFAULT_ACCOMMODATION_NEEDS;
      uploadData.append("accommodation_needs", accommodationNeeds);

      // If user has selected specific accessibility categories and accommodations,
      // store them as JSON for potential backend use
      if (userData.accessibilityNeeds && (
        userData.accessibilityNeeds.categories.length > 0 ||
        userData.accessibilityNeeds.accommodations.length > 0
      )) {
        uploadData.append("accessibility_data", JSON.stringify({
          categories: userData.accessibilityNeeds.categories,
          disclosurePreference: userData.accessibilityNeeds.disclosurePreference,
          accommodations: userData.accessibilityNeeds.accommodations,
        }));
      }

      // Clear old parsed data to force re-parsing
      uploadData.append("resume_data", "null");
      uploadData.append("parsing_status", "not_parsed");

      try {
        await apiRequest(`/api/candidates/profiles/${candidateSlug}/`, {
          method: "PATCH",
          body: uploadData,
        });
        console.log("[Resume Upload] Old data cleared and new resume URL saved to profile");
      } catch (err) {
        // Check if session expired
        if (handleSessionExpiry(err, router)) {
          setError("Your session expired. Redirecting to login...");
          return;
        }

        const message = getErrorMessage(err);
        console.error("[Resume Upload] Failed to save resume URL:", err);
        setParseWarning(
          message
            ? `Failed to save resume to profile: ${message}`
            : "Failed to save resume. Please try again."
        );
        return;
      }

      // Step 3: Trigger resume parsing in background (don't wait for results)
      setUploadStage("parsing");
      console.log("[Resume Upload] Step 3: Triggering resume parsing in background");

      try {
        // Start parsing but don't wait for results
        apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/parse-resume/`,
          {
            method: "POST",
          }
        ).then(() => {
          console.log("[Resume Upload] Parse request initiated successfully");
        }).catch((err) => {
          console.warn("[Resume Upload] Parse request error (non-blocking):", err);
        });

        // Immediately navigate to accessibility needs while parsing happens in background
        console.log("[Resume Upload] Resume uploaded successfully, navigating to accessibility needs");
        router.push("/signup/accessability-needs");
      } catch (err) {
        console.error("[Resume Upload] Unexpected error:", err);
        // Even if there's an error, navigate to accessibility needs
        router.push("/signup/accessability-needs");
      }
    } catch (err) {
      // Check if session expired
      if (handleSessionExpiry(err, router)) {
        setError("Your session expired. Redirecting to login...");
        return;
      }

      const message = getErrorMessage(err);
      console.error("[Resume Upload] Unexpected error during upload:", err);
      setParseWarning(
        message
          ? `An error occurred: ${message}. Please fill in your details manually.`
          : "An unexpected error occurred. Please click the button below to fill in your details manually."
      );
    } finally {
      setIsUploading(false);
      setUploadStage("idle");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F5FA]  text-slate-900">
      {/* Navbar */}

      <Navbar />

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12">
        <div className="w-full max-w-5xl rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E293B] md:text-4xl">
            Create your EnabledTalent profile
          </h1>
          <p className="mt-3 text-lg text-[#64748B]">
            You can find matching jobs from EnabledTalent
          </p>

          <div className="mt-12 flex w-full flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-blue-100 bg-slate-50/70 p-10 md:p-14">
            <p className="text-lg font-semibold leading-relaxed text-[#1E293B]">
              Upload your resume to build an Enabled Talent{" "}
              <br className="hidden md:block" />
              profile automatically
            </p>

            <label htmlFor="resume-upload-input" className="sr-only">
              Upload resume
            </label>
            <input
              ref={fileInputRef}
              id="resume-upload-input"
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="sr-only"
              disabled={isUploading}
              aria-describedby={
                error
                  ? "resume-upload-help resume-upload-error"
                  : "resume-upload-help"
              }
              aria-invalid={Boolean(error)}
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={selectedFile ? handleSendForParsing : handleUploadClick}
              disabled={isUploading}
              className="rounded-lg bg-[#D97706] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#b76005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading
                ? "Processing..."
                : selectedFile
                ? "Send resume for parsing"
                : "Upload Resume"}
            </button>

            {uploadStageMessage ? (
              <div
                role="status"
                aria-live="polite"
                className="text-sm text-slate-500"
              >
                {uploadStageMessage}
              </div>
            ) : null}

            {selectedFileName ? (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span id="resume-upload-selected" aria-live="polite">
                  Selected: {selectedFileName}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="flex items-center justify-center rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label="Remove file"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            ) : null}

            {parseWarning ? (
              <div
                role="alert"
                className="mt-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
              >
                <span className="font-semibold">⚠️ Warning:</span>{" "}
                {parseWarning}
                <button
                  type="button"
                  onClick={() => router.push("/signup/manual-resume-fill")}
                  className="mt-3 block w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
                >
                  Continue to fill manually
                </button>
              </div>
            ) : null}

            {error ? (
              <span
                id="resume-upload-error"
                role="alert"
                className="text-sm text-red-600"
              >
                {error}
              </span>
            ) : null}

            <span id="resume-upload-help" className="text-base text-slate-500">
              Supports PDF, DOC, DOCX, and image files.
            </span>
          </div>

          <div className="mt-10 text-base text-slate-600">
            Don&apos;t have resume file ready?{" "}
            <Link
              href="/signup/manual-resume-fill"
              className="font-semibold text-[#C27528] underline-offset-4 transition-colors hover:text-[#a45d1f] hover:underline"
            >
              Create manually
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
