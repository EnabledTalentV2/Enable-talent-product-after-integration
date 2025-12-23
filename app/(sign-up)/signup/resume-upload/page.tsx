"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/signup/Navbar";
import Link from "next/link";
import { getPendingSignup } from "@/lib/localUserStore";
import { useUserDataStore } from "@/lib/userDataStore";
import type { UserData } from "@/components/signup/types";

const allowedExtensions = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff"];
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
  const candidate = (isRecord(payload.data) && payload.data) || (isRecord(payload.userData) && payload.userData) || payload;
  if (!isRecord(candidate)) return {};

  const patch: UserDataPatch = {};
  if (isRecord(candidate.basicInfo)) patch.basicInfo = candidate.basicInfo as Partial<UserData["basicInfo"]>;
  if (isRecord(candidate.education)) patch.education = candidate.education as Partial<UserData["education"]>;
  if (isRecord(candidate.workExperience)) patch.workExperience = candidate.workExperience as Partial<UserData["workExperience"]>;
  if (isRecord(candidate.skills)) patch.skills = candidate.skills as Partial<UserData["skills"]>;
  if (isRecord(candidate.projects)) patch.projects = candidate.projects as Partial<UserData["projects"]>;
  if (isRecord(candidate.achievements)) patch.achievements = candidate.achievements as Partial<UserData["achievements"]>;
  if (isRecord(candidate.certification)) patch.certification = candidate.certification as Partial<UserData["certification"]>;
  if (isRecord(candidate.preference)) patch.preference = candidate.preference as Partial<UserData["preference"]>;
  if (isRecord(candidate.otherDetails)) patch.otherDetails = candidate.otherDetails as Partial<UserData["otherDetails"]>;
  if (isRecord(candidate.reviewAgree)) patch.reviewAgree = candidate.reviewAgree as UserData["reviewAgree"];
  return patch;
};

const mergeUserData = (prev: UserData, patch: UserDataPatch): UserData => ({
  ...prev,
  basicInfo: patch.basicInfo ? { ...prev.basicInfo, ...patch.basicInfo } : prev.basicInfo,
  education: patch.education ? { ...prev.education, ...patch.education } : prev.education,
  workExperience: patch.workExperience ? { ...prev.workExperience, ...patch.workExperience } : prev.workExperience,
  skills: patch.skills ? { ...prev.skills, ...patch.skills } : prev.skills,
  projects: patch.projects ? { ...prev.projects, ...patch.projects } : prev.projects,
  achievements: patch.achievements ? { ...prev.achievements, ...patch.achievements } : prev.achievements,
  certification: patch.certification ? { ...prev.certification, ...patch.certification } : prev.certification,
  preference: patch.preference ? { ...prev.preference, ...patch.preference } : prev.preference,
  otherDetails: patch.otherDetails ? { ...prev.otherDetails, ...patch.otherDetails } : prev.otherDetails,
  reviewAgree: patch.reviewAgree ? { ...prev.reviewAgree, ...patch.reviewAgree } : prev.reviewAgree,
});

export default function ResumeUpload() {
  const router = useRouter();
  const setUserData = useUserDataStore((s) => s.setUserData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    const pending = getPendingSignup();
    if (!pending) {
      router.replace("/signup");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <div className="text-slate-500">Verifying signup session...</div>
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

    setError(null);
    setSelectedFileName(file.name);
    setIsUploading(true);

    try {
      const endpoint = process.env.NEXT_PUBLIC_RESUME_PARSE_ENDPOINT;
      if (endpoint) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (response.ok) {
          const payload = (await response.json()) as unknown;
          const patch = extractUserDataPatch(payload);
          if (Object.keys(patch).length > 0) {
            setUserData((prev) => mergeUserData(prev, patch));
          }
        }
      }
    } catch {
      // Parsing failures should still lead to manual review.
    } finally {
      setIsUploading(false);
      router.push("/signup/manual-resume-fill");
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

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
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
              <span className="text-sm text-slate-500">Selected: {selectedFileName}</span>
            ) : null}

            {error ? <span className="text-sm text-red-600">{error}</span> : null}

            <span className="text-base text-slate-500">
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
