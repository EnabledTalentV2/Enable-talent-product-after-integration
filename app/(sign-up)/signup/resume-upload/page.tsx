"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/signup/Navbar";
import Link from "next/link";
import { useUserDataStore } from "@/lib/userDataStore";
import type { UserData } from "@/lib/types/user";

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

const extractUserDataPatch = (payload: unknown): UserDataPatch => {
  if (!isRecord(payload)) return {};
  const candidate =
    (isRecord(payload.data) && payload.data) ||
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

export default function ResumeUpload() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [candidateSlug, setCandidateSlug] = useState<string | null>(null);

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

        const userData = await response.json();
        console.log("[Resume Upload] User data from /api/user/me:", userData);

        if (active) {
          let slug: string | null = null;

          // Try multiple possible paths for candidate slug
          if (userData.candidateProfile?.slug) {
            slug = userData.candidateProfile.slug;
            console.log(
              "[Resume Upload] Found slug in candidateProfile:",
              slug
            );
          } else if (userData.candidate_profile?.slug) {
            slug = userData.candidate_profile.slug;
            console.log(
              "[Resume Upload] Found slug in candidate_profile:",
              slug
            );
          } else if (userData.candidate?.slug) {
            slug = userData.candidate.slug;
            console.log("[Resume Upload] Found slug in candidate:", slug);
          } else if (userData.slug) {
            slug = userData.slug;
            console.log("[Resume Upload] Found slug at root level:", slug);
          } else if (userData.profile?.slug) {
            slug = userData.profile.slug;
            console.log("[Resume Upload] Found slug in profile:", slug);
          } else if (userData.candidateSlug) {
            slug = userData.candidateSlug;
            console.log("[Resume Upload] Found slug as candidateSlug:", slug);
          } else if (userData.candidate_profile_slug) {
            slug = userData.candidate_profile_slug;
            console.log(
              "[Resume Upload] Found slug as candidate_profile_slug:",
              slug
            );
          } else {
            console.warn(
              "[Resume Upload] No candidate slug found. Available keys:",
              Object.keys(userData)
            );
          }

          if (slug) {
            setCandidateSlug(slug);
          }
          setLoading(false);
        }
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedFile(file)) {
      setError("Upload a PDF, DOC, DOCX, or image file.");
      setSelectedFileName(null);
      event.target.value = "";
      return;
    }

    if (!candidateSlug) {
      setError("Unable to process your profile. Please refresh the page.");
      return;
    }

    setError(null);
    setParseWarning(null);
    setSelectedFileName(file.name);
    setIsUploading(true);

    let parsedSuccessfully = false;

    try {
      // Use our Next.js API route to proxy to Django backend
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
        headers: { "X-Candidate-Slug": candidateSlug },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const patch = extractUserDataPatch(result.data);
          if (Object.keys(patch).length > 0) {
            setUserData((prev) => mergeUserData(prev, patch));
            parsedSuccessfully = true;
          }
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
      console.error("Resume parse error:", err);
      setParseWarning(
        "Failed to parse resume. Please click the button below to fill in your details manually."
      );
    } finally {
      setIsUploading(false);
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
              onClick={handleUploadClick}
              disabled={isUploading}
              className="rounded-lg bg-[#D97706] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#b76005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </button>

            {selectedFileName ? (
              <span
                id="resume-upload-selected"
                aria-live="polite"
                className="text-sm text-slate-500"
              >
                Selected: {selectedFileName}
              </span>
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
