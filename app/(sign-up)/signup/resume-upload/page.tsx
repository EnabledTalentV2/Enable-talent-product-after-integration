"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/signup/Navbar";
import Link from "next/link";
import { X } from "lucide-react";
import { useResumeUpload } from "@/lib/hooks/useResumeUpload";

export default function ResumeUpload() {
  const router = useRouter();
  const {
    loading,
    isUploading,
    uploadStageMessage,
    error,
    parseWarning,
    selectedFileName,
    fileInputRef,
    handleUploadClick,
    handleFileChange,
    handleRemoveFile,
  } = useResumeUpload();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
      <Navbar />

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
              accept=".pdf,application/pdf"
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
              onClick={handleUploadClick}
              disabled={isUploading}
              className="rounded-lg bg-[#D97706] px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#b76005] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading ? "Processing..." : "Upload Resume"}
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
                  onClick={() => router.push("/signup/accessability-needs")}
                  className="mt-3 block w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-yellow-700"
                >
                  Continue to accessibility needs
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
              Supports PDF files.
            </span>
          </div>

          <div className="mt-10 text-base text-slate-600">
            Don&apos;t have resume file ready?{" "}
            <Link
              href="/signup/accessability-needs"
              className="font-semibold text-[#C27528] underline-offset-4 transition-colors hover:text-[#a45d1f] hover:underline"
            >
              Skip to next step
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
