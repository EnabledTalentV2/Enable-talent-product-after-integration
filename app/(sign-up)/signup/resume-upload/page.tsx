"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/signup/Navbar";
import Link from "next/link";
import {
  DEFAULT_ACCOMMODATION_NEEDS,
  ensureCandidateProfileSlug,
} from "@/lib/candidateProfile";
import { useUserDataStore } from "@/lib/userDataStore";
import type { UserData } from "@/lib/types/user";
import { apiRequest } from "@/lib/api-client";

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_RESUME_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET || "media";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isAllowedFile = (file: File) => {
  if (file.type) {
    if (allowedMimeTypes.has(file.type)) return true;
    if (file.type.startsWith("image/")) return true;
  }

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

  const objectPath = createResumeStoragePath(candidateSlug, file.name);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_RESUME_BUCKET}/${encodeURI(
    objectPath
  )}`;

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
    }

    throw new Error(message);
  }

  return buildResumePublicUrl(objectPath);
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

const splitFullName = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const extractTextValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeSkillsValue = (value: unknown) => {
  if (Array.isArray(value)) {
    const list = value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
    return { list, text: list.join(", ") };
  }

  if (typeof value === "string") {
    const text = value.trim();
    const list = text
      .split(/[,;\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    return { list: list.length > 0 ? list : text ? [text] : [], text };
  }

  return { list: [], text: "" };
};

const extractResumeDataPatch = (
  resumeData: Record<string, unknown>
): UserDataPatch => {
  const patch: UserDataPatch = {};
  const fullName =
    extractTextValue(resumeData.name) ||
    extractTextValue(resumeData.full_name) ||
    extractTextValue(resumeData.fullName);
  const email = extractTextValue(resumeData.email);
  const linkedin =
    extractTextValue(resumeData.linkedin) ||
    extractTextValue(resumeData.linkedin_url) ||
    extractTextValue(resumeData.linkedinUrl);

  if (fullName || email || linkedin) {
    const { firstName, lastName } = splitFullName(fullName);
    patch.basicInfo = {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(email ? { email } : {}),
      ...(linkedin ? { linkedinUrl: linkedin } : {}),
    };
  }

  const { list: skillsList, text: skillsText } = normalizeSkillsValue(
    resumeData.skills
  );
  if (skillsText || skillsList.length > 0) {
    patch.skills = {
      skills: skillsText || skillsList.join(", "),
      ...(skillsList.length > 0 ? { primaryList: skillsList } : {}),
    };
  }

  return patch;
};

const extractUserDataPatch = (payload: unknown): UserDataPatch => {
  if (!isRecord(payload)) return {};
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

  if (resumeData && isRecord(resumeData)) {
    const resumePatch = extractResumeDataPatch(resumeData);
    if (resumePatch.basicInfo && !patch.basicInfo) {
      patch.basicInfo = resumePatch.basicInfo;
    }
    if (resumePatch.skills && !patch.skills) {
      patch.skills = resumePatch.skills;
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
          router.replace("/login-talent");
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
        router.replace("/login-talent");
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

  const pollForParsedData = async (
    slug: string
  ): Promise<UserDataPatch | null> => {
    const maxAttempts = 8;
    const delayMs = 1500;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const statusData = await apiRequest<unknown>(
          `/api/candidates/profiles/${slug}/parsing-status/`,
          { method: "GET" }
        );
        const patch = extractUserDataPatch(statusData);
        if (Object.keys(patch).length > 0) {
          return patch;
        }

        const status = getParsingStatus(statusData);
        if (status && ["failed", "error"].includes(status)) {
          return null;
        }
      } catch (err) {
        console.warn("[Resume Upload] Parsing status error:", err);
      }

      await sleep(delayMs);
    }

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
      let resumeUrl = "";
      try {
        resumeUrl = await uploadResumeToStorage(selectedFile, candidateSlug);
      } catch (err) {
        const message = getErrorMessage(err);
        setParseWarning(
          message
            ? `Failed to upload resume: ${message}`
            : "Failed to upload resume. Please try again."
        );
        return;
      }

      setUploadStage("saving");

      const uploadData = new FormData();
      uploadData.append("resume_file", resumeUrl);
      uploadData.append("accommodation_needs", DEFAULT_ACCOMMODATION_NEEDS);

      await apiRequest(`/api/candidates/profiles/${candidateSlug}/`, {
        method: "PATCH",
        body: uploadData,
      });

      setUploadStage("parsing");

      let parseResponse: unknown | null = null;

      try {
        parseResponse = await apiRequest<unknown>(
          `/api/candidates/profiles/${candidateSlug}/parse-resume/`,
          {
            method: "POST",
          }
        );
      } catch (err) {
        const message = getErrorMessage(err).toLowerCase();
        if (!message.includes("already parsed")) {
          throw err;
        }
      }

      const parsePatch = parseResponse
        ? extractUserDataPatch(parseResponse)
        : null;

      if (parsePatch && Object.keys(parsePatch).length > 0) {
        setUserData((prev) => mergeUserData(prev, parsePatch));
        parsedSuccessfully = true;
      } else {
        setUploadStage("polling");
        const patch = await pollForParsedData(candidateSlug);
        if (patch && Object.keys(patch).length > 0) {
          setUserData((prev) => mergeUserData(prev, patch));
          parsedSuccessfully = true;
        }
      }

      if (!parsedSuccessfully) {
        // Show warning and let user manually proceed
        setParseWarning(
          "Failed to parse resume. Please click the button below to fill in your details manually."
        );
      } else {
        // Parsing succeeded - automatically proceed
        router.push("/signup/manual-resume-fill");
      }
    } catch (err) {
      const message = getErrorMessage(err);
      console.error("Resume parse error:", err);
      setParseWarning(
        message
          ? `Failed to parse resume: ${message}`
          : "Failed to parse resume. Please click the button below to fill in your details manually."
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
                  className="text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Remove file
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
