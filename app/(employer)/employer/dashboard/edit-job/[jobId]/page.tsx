"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import JobForm from "@/components/employer/dashboard/JobForm";
import Toast from "@/components/Toast";
import { useEmployerJobsStore, setJobsCacheInvalidator } from "@/lib/employerJobsStore";
import { jobsKeys } from "@/lib/hooks/useJobs";
import type { JobFormValues } from "@/lib/employerJobsTypes";
import { toJobFormValues } from "@/lib/employerJobsUtils";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobIdParam = Array.isArray(params.jobId) ? params.jobId[0] : params.jobId;
  const jobId = typeof jobIdParam === "string" ? jobIdParam : "";
  const { jobs, updateJob, hasFetched } = useEmployerJobsStore();
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const job = jobs.find((entry) => entry.id === jobId) ?? null;

  // Set up cache invalidator for Zustand store
  useEffect(() => {
    setJobsCacheInvalidator(() => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    });
  }, [queryClient]);

  useEffect(() => {
    if (!jobId) return;
    if (hasFetched && !job) {
      router.replace("/employer/dashboard/listed-jobs");
    }
  }, [hasFetched, job, jobId, router]);

  const initialValues = useMemo(
    () => (job ? toJobFormValues(job) : undefined),
    [job]
  );
  if (!jobId || !hasFetched) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-700">
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-700">
        Redirecting to listed jobs...
      </div>
    );
  }

  const handleSubmit = async (values: JobFormValues) => {
    try {
      await updateJob(jobId, values);
      router.push("/employer/dashboard/listed-jobs");
    } catch (error) {
      setToastMessage("Unable to save changes. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/employer/dashboard/listed-jobs"
            className="flex items-center text-slate-700 hover:text-slate-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
          <button
            type="button"
            aria-label="Close"
            onClick={() => router.push("/employer/dashboard/listed-jobs")}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Job</h1>

        <JobForm
          submitLabel="Save Changes"
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
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
