"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Pencil } from "lucide-react";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { apiRequest } from "@/lib/api-client";
import { toEmployerOrganizationInfo } from "@/lib/organizationUtils";
import logoPlaceholder from "@/public/logo/logo-placeholder.png"; // Assuming this path based on previous context, or I will use a text placeholder if image fails.

export default function EmployerCompanyProfilePage() {
  const employerData = useEmployerDataStore((s) => s.employerData);
  const setEmployerData = useEmployerDataStore((s) => s.setEmployerData);
  const organizationInfo = employerData?.organizationInfo ?? {
    organizationName: "",
    aboutOrganization: "",
    location: "",
    foundedYear: "",
    website: "",
    companySize: "",
    industry: "",
  };
  const hasOrgData =
    Boolean(organizationInfo.organizationName) ||
    Boolean(organizationInfo.industry) ||
    Boolean(organizationInfo.aboutOrganization) ||
    Boolean(organizationInfo.location) ||
    Boolean(organizationInfo.website) ||
    Boolean(organizationInfo.companySize) ||
    Boolean(organizationInfo.foundedYear);

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
    founded: organizationInfo.foundedYear || "Founded year not set",
    employees: organizationInfo.companySize || "Company size not set",
    website: organizationInfo.website || "",
  };
  const hasWebsite = Boolean(displayData.website.trim());

  return (
    <section className="mx-auto max-w-[1200px] space-y-6 py-8 px-6 ">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#FCD571] p-8 md:p-12">
        {/* Decorative wave/shape - simplified as a gradient or absolute div for now */}
        <div className="absolute -right-20 -top-40 h-[400px] w-[400px] rounded-full border-[40px] border-white/20" />

        <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white p-4 shadow-sm md:h-32 md:w-32">
            {/* Using a text placeholder if image is missing, or the imported placeholder */}
            <span className="text-4xl font-bold text-blue-600">∞</span>
          </div>

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
              <p className="text-sm text-slate-500">Location</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {displayData.location}
              </p>
            </div>

            {/* Founded Card */}
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Founded in</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {displayData.founded}
              </p>
            </div>

            {/* Industry Card */}
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Industry</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {displayData.industry}
              </p>
            </div>

            {/* Employees Card */}
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Employees</p>
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
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-slate-500">
        <p>
          Copyright 2025 Enabled Talent. All rights reserved. You may print or
          download extracts for personal, non-commercial use only, and must
          acknowledge the website as the source.
        </p>
      </div>
    </section>
  );
}
