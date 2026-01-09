"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import JobForm from "@/components/employer/dashboard/JobForm";
import Toast from "@/components/Toast";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { getApiErrorMessage } from "@/lib/api-client";
import type { JobFormValues } from "@/lib/employerJobsTypes";

export default function PostJobsPage() {
  const router = useRouter();
  const createJob = useEmployerJobsStore((state) => state.createJob);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (values: JobFormValues) => {
    try {
      console.log("[Post Jobs] Submitting job:", values);
      await createJob(values);
      console.log("[Post Jobs] Job created successfully, redirecting...");
      router.push("/employer/dashboard/listed-jobs");
    } catch (error) {
      console.error("[Post Jobs] Failed to create job:", error);
      const message = getApiErrorMessage(
        error,
        "Unable to post this job. Please try again."
      );
      setToastMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/employer/dashboard"
            className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <button type="button" aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Post a Job</h1>

        <JobForm submitLabel="Post Job" onSubmit={handleSubmit} />
      </div>

      {toastMessage && (
        <Toast
          tone="error"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
