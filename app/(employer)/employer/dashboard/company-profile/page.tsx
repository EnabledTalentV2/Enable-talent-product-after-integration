"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";
import { toEmployerOrganizationInfo } from "@/lib/organizationUtils";
import { useAuth } from "@clerk/nextjs";
import ConfirmDialog from "@/components/a11y/ConfirmDialog";
import LiveRegion from "@/components/a11y/LiveRegion";

export default function EmployerCompanyProfilePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const currentYear = new Date().getFullYear();
  const employerData = useEmployerDataStore((s) => s.employerData);
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);
  const resetEmployerData = useEmployerDataStore((s) => s.resetEmployerData);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const organizationInfo = employerData?.organizationInfo ?? {
    organizationName: "",
    aboutOrganization: "",
    location: "",
    website: "",
    linkedinUrl: "",
    companySize: "",
    industry: "",
  };
  const hasOrgData =
    Boolean(organizationInfo.organizationName) ||
    Boolean(organizationInfo.industry) ||
    Boolean(organizationInfo.aboutOrganization) ||
    Boolean(organizationInfo.location) ||
    Boolean(organizationInfo.website) ||
    Boolean(organizationInfo.linkedinUrl) ||
    Boolean(organizationInfo.companySize);

  useEffect(() => {
    if (hasOrgData) return;
    let active = true;

    const loadOrganization = async () => {
      try {
        const data = await apiRequest<unknown>("/api/organizations", {
          method: "GET",
        });
        const nextOrganization = toEmployerOrganizationInfo(data);
        if (!nextOrganization || !active) return;
        setEmployerData((prev) => ({
          ...prev,
          organizationInfo: {
            ...prev.organizationInfo,
            ...nextOrganization,
          },
        }));
      } catch (error) {
        console.error("Failed to load organization profile:", error);
      }
    };

    loadOrganization();

    return () => {
      active = false;
    };
  }, [hasOrgData, setEmployerData]);

  const displayData = {
    name: organizationInfo.organizationName || "Company name not set",
    industry: organizationInfo.industry || "Industry not set",
    about:
      organizationInfo.aboutOrganization || "No company description available.",
    location: organizationInfo.location || "Location not set",
    employees: organizationInfo.companySize || "Company size not set",
    website: organizationInfo.website || "",
    linkedin: organizationInfo.linkedinUrl || "",
    avatarUrl: organizationInfo.avatarUrl || "",
  };
  const hasWebsite = Boolean(displayData.website.trim());
  const hasLinkedin = Boolean(displayData.linkedin.trim());
  const hasAvatar = Boolean(displayData.avatarUrl.trim());

  const deleteStatusMessage = deleteError || deleteSuccess;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(null);
    setIsDeleteDialogOpen(false);

    try {
      // Step 1: Delete the organization from Django
      const orgId = organizationInfo.organizationId;
      if (orgId) {
        await apiRequest(`/api/organizations/${orgId}`, {
          method: "DELETE",
        });
      }

      // Step 2: Delete the Django user
      await apiRequest("/api/user/me", {
        method: "DELETE",
      });

      // Step 3: Clear local stores, sign out, and redirect
      resetEmployerData();
      await signOut();
      router.replace("/login-employer");
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(
          error,
          "Failed to delete your account. Please try again."
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1200px] space-y-6 py-8 px-6 ">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#FCD571] p-8 md:p-12">
        {/* Decorative wave/shape - simplified as a gradient or absolute div for now */}
        <div className="absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full border-[40px] border-white/20" />

        <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center">
          {/* Organization Avatar */}
          {hasAvatar && (
            <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg shrink-0">
              <Image
                src={displayData.avatarUrl}
                alt={displayData.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="flex-1 space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              {displayData.name}
            </h1>
            <p className="text-lg text-slate-800">{displayData.industry}</p>
          </div>

          <Link
            href="/employer/dashboard/company-profile-edit"
            className="absolute right-6 top-6 rounded-full bg-white/40 p-2 text-slate-700 transition hover:bg-white/60"
            aria-label="Edit profile"
          >
            <Pencil className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main Content - About */}
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-slate-900">About</h2>
          <div className="space-y-4 text-base leading-relaxed text-slate-700 whitespace-pre-line">
            {displayData.about}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Location Card */}
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">Location</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {displayData.location}
              </p>
            </div>

            {/* Industry Card */}
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">Industry</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {displayData.industry}
              </p>
            </div>

            {/* Employees Card */}
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-700">Employees</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {displayData.employees}
              </p>
            </div>
          </div>

          {/* Website Card */}
          <div className="relative overflow-hidden rounded-[24px] bg-[#D67443] p-6 text-white shadow-sm">
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/90">Website</p>
              {hasWebsite ? (
                <a
                  href={
                    displayData.website.startsWith("http")
                      ? displayData.website
                      : `https://${displayData.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-xl font-bold hover:underline truncate"
                >
                  {displayData.website}
                </a>
              ) : (
                <p className="mt-1 text-xl font-bold">Not provided</p>
              )}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* LinkedIn Card */}
          <div className="relative overflow-hidden rounded-[24px] bg-[#0A66C2] p-6 text-white shadow-sm">
            <div className="relative z-10">
              <p className="text-sm font-medium text-white/90">LinkedIn</p>
              {hasLinkedin ? (
                <a
                  href={
                    displayData.linkedin.startsWith("http")
                      ? displayData.linkedin
                      : `https://${displayData.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-xl font-bold hover:underline truncate"
                >
                  {displayData.linkedin}
                </a>
              ) : (
                <p className="mt-1 text-xl font-bold">Not provided</p>
              )}
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="rounded-[32px] bg-white p-8 shadow-sm border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="h-5 w-5 text-red-800" />
          <h2 className="text-xl font-bold text-slate-900">Delete Account</h2>
        </div>
        <p className="text-sm text-slate-700">
          Deleting your account will permanently remove your organization,
          job postings, and all associated data. This action cannot be undone.
        </p>
        {deleteStatusMessage ? (
          <LiveRegion
            politeness={deleteError ? "assertive" : "polite"}
            visible
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              deleteError
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            }`}
          >
            {deleteStatusMessage}
          </LiveRegion>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setDeleteError(null);
            setIsDeleteDialogOpen(true);
          }}
          disabled={isDeleting}
          className="mt-4 min-h-[44px] w-full rounded-xl border border-red-300 bg-red-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-slate-700">
        <p>
          Copyright {currentYear} Enabled Talent. All rights reserved. You may print or
          download extracts for personal, non-commercial use only, and must
          acknowledge the website as the source.
        </p>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete your account?"
        message="This will permanently delete your organization, job postings, and account. You will need to sign up again to use Enabled Talent. This cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </section>
  );
}
