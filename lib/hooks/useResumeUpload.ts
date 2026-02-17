"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ensureCandidateProfileSlug } from "@/lib/candidateProfile";
import { useUserDataStore } from "@/lib/userDataStore";
import { apiRequest, handleSessionExpiry } from "@/lib/api-client";

// Resume upload configuration
const allowedExtensions = [".pdf"];
const allowedMimeTypes = new Set(["application/pdf"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type UploadStage = "idle" | "uploading";

const getUploadStageMessage = (stage: UploadStage): string | null => {
  switch (stage) {
    case "uploading":
      return "Uploading resume to storage...";
    default:
      return null;
  }
};

const getErrorMessage = (err: unknown): string =>
  err && typeof err === "object" && "message" in err
    ? String((err as { message?: string }).message || "")
    : "";

/**
 * Validates if a file is an allowed resume type.
 */
const isAllowedFile = (file: File) => {
  if (file.type) {
    if (allowedMimeTypes.has(file.type)) return true;
  }
  const name = file.name.toLowerCase();
  return allowedExtensions.some((ext) => name.endsWith(ext));
};

export function useResumeUpload() {
  const router = useRouter();
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    null,
  );
  const [candidateSlug, setCandidateSlug] = useState<string | null>(null);

  const uploadStageMessage = getUploadStageMessage(uploadStage);

  // Session check on mount
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
            response.status,
          );
          const returnUrl = encodeURIComponent("/signup/resume-upload");
          router.replace(`/login-talent?next=${returnUrl}`);
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
        router.replace(`/login-talent?next=${returnUrl}`);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedFile(file)) {
      setError("Upload a PDF file.");
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
    handleSendForParsing(file);
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

  const handleSendForParsing = async (fileOverride?: File) => {
    if (isUploading) return;

    const fileToParse = fileOverride ?? selectedFile;

    if (!fileToParse) {
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

    try {
      // Validate file size before uploading
      if (fileToParse.size > MAX_FILE_SIZE) {
        setParseWarning(
          `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please upload a smaller file.`,
        );
        return;
      }

      // Upload file directly to backend (not Supabase)
      // Backend will handle Supabase upload internally and save the URL
      setUploadStage("uploading");
      console.log("[Resume Upload] Uploading file to backend");

      try {
        const formData = new FormData();
        formData.append("resume_file", fileToParse);

        await apiRequest(`/api/candidates/profiles/${candidateSlug}/`, {
          method: "PATCH",
          body: formData,
        });

        console.log(
          "[Resume Upload] Resume uploaded successfully, now triggering parsing",
        );

        // Immediately trigger parsing after upload
        try {
          console.log("[Resume Upload] Triggering parse-resume POST");
          await apiRequest(
            `/api/candidates/profiles/${candidateSlug}/parse-resume/`,
            {
              method: "POST",
            },
          );
          console.log("[Resume Upload] Parse-resume POST successful");

          // Immediately fire GET to start the parsing process (backend requires this)
          console.log("[Resume Upload] Firing GET to start parsing process");
          await apiRequest<unknown>(
            `/api/candidates/profiles/${candidateSlug}/parsing-status/?include_resume=true`,
            { method: "GET" },
          );
          console.log("[Resume Upload] Parsing started successfully");
        } catch (parseErr) {
          console.warn(
            "[Resume Upload] Failed to trigger parsing (will retry on accessibility page):",
            parseErr,
          );
          // Don't block navigation - parsing can be retried on the next page
        }
      } catch (err) {
        // Check if session expired
        if (handleSessionExpiry(err, router)) {
          setError("Your session expired. Redirecting to login...");
          return;
        }

        const message = getErrorMessage(err);
        console.error(
          "[Resume Upload] Failed to upload resume to backend:",
          err,
        );
        setParseWarning(
          message
            ? `Failed to upload resume: ${message}`
            : "Failed to upload resume. Please try again.",
        );
        return;
      }

      // Navigate to accessibility needs page
      console.log(
        "[Resume Upload] Resume uploaded, navigating to accessibility needs",
      );
      router.push("/signup/accessability-needs?resumeUploaded=1");
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
          : "An unexpected error occurred. Please click the button below to fill in your details manually.",
      );
    } finally {
      setIsUploading(false);
      setUploadStage("idle");
    }
  };

  return {
    loading,
    isUploading,
    uploadStage,
    uploadStageMessage,
    error,
    parseWarning,
    selectedFile,
    selectedFileName,
    fileInputRef,
    handleUploadClick,
    handleFileChange,
    handleRemoveFile,
    handleSendForParsing,
  };
}
