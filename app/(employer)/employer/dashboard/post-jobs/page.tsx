"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import JobForm from "@/components/employer/dashboard/JobForm";
import Toast from "@/components/Toast";
import { useEmployerJobsStore } from "@/lib/employerJobsStore";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { apiRequest, getApiErrorMessage, isSessionExpiredError } from "@/lib/api-client";
import { toEmployerOrganizationInfo } from "@/lib/organizationUtils";
import type { JobFormValues } from "@/lib/employerJobsTypes";

export default function PostJobsPage() {
  const router = useRouter();
  const createJob = useEmployerJobsStore((state) => state.createJob);
  const employerData = useEmployerDataStore((s) => s.employerData);
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);

  const redirectToEmployerLogin = () => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const returnUrl = currentPath
      ? `?returnUrl=${encodeURIComponent(currentPath)}`
      : "";
    router.push(`/login-employer${returnUrl}`);
  };

  // Check if user has an organization
  useEffect(() => {
    const checkOrganization = async () => {
      try {
        const data = await apiRequest<unknown>("/api/organizations", {
          method: "GET",
        });
        const orgInfo = toEmployerOrganizationInfo(data);

        if (orgInfo && orgInfo.organizationId) {
          setHasOrganization(true);
          setEmployerData((prev) => ({
            ...prev,
            organizationInfo: {
              ...prev.organizationInfo,
              ...orgInfo,
            },
          }));
        } else {
          setHasOrganization(false);
        }
      } catch (error) {
        if (isSessionExpiredError(error)) {
          redirectToEmployerLogin();
          return;
        }
        console.error("[Post Jobs] Failed to load organization:", error);
        setHasOrganization(false);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    checkOrganization();
  }, [setEmployerData]);

  const handleSubmit = async (values: JobFormValues) => {
    try {
      console.log("[Post Jobs] Submitting job:", values);
      await createJob(values);
      console.log("[Post Jobs] Job created successfully, redirecting...");
      router.push("/employer/dashboard/listed-jobs");
    } catch (error) {
      console.error("[Post Jobs] Failed to create job:", error);
      if (isSessionExpiredError(error)) {
        redirectToEmployerLogin();
        return;
      }
      const message = getApiErrorMessage(
        error,
        "Unable to post this job. Please try again."
      );
      setToastMessage(message);
    }
  };

  // Show loading state
  if (isLoadingOrg) {
    return (
      <div className="min-h-screen bg-blue-50/50 p-6 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking organization status...</p>
        </div>
      </div>
    );
  }

  // Show organization required message
  if (!hasOrganization) {
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
          </div>

          {/* Warning Message */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-orange-100 rounded-full p-4 mb-6">
              <AlertCircle className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Organization Required
            </h1>
            <p className="text-gray-600 mb-2 max-w-md">
              You need to create an organization profile before you can post jobs.
            </p>
            <p className="text-gray-500 text-sm mb-8 max-w-md">
              Your organization information helps candidates learn more about your company.
            </p>
            <div className="flex gap-4">
              <Link
                href="/employer/dashboard/company-profile-edit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Create Organization Profile
              </Link>
              <Link
                href="/employer/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show job posting form
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
          <button
            type="button"
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => router.push("/employer/dashboard")}
          >
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
