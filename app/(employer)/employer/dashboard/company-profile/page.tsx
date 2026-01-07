"use client";

import Link from "next/link";
import { ArrowRight, Pencil } from "lucide-react";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import logoPlaceholder from "@/public/logo/logo-placeholder.png"; // Assuming this path based on previous context, or I will use a text placeholder if image fails.

export default function EmployerCompanyProfilePage() {
  const { employerData } = useEmployerDataStore();
  const organizationInfo = employerData?.organizationInfo ?? {
    organizationName: "",
    aboutOrganization: "",
    location: "",
    foundedYear: "",
    website: "",
    companySize: "",
    industry: "",
  };

  // Fallback data if store is empty (for visualization purposes if user hasn't filled it)
  const displayData = {
    name: organizationInfo.organizationName || "Meta",
    industry: organizationInfo.industry || "Software development company",
    about:
      organizationInfo.aboutOrganization ||
      "In an era marked by rapid technological advancement and ever-evolving business landscapes, the quest for top-tier talent remains a cornerstone of organizational success.\n\nRecognizing this imperative, [Company Name] emerges as a beacon of innovation in the realm of recruitment. With a commitment to excellence and a passion for connecting talent with opportunity, we have established ourselves as a trusted partner for companies seeking to build high-performing teams and individuals embarking on transformative career journeys.\n\nAt the heart of ethos lies a deep-seated belief in the power of human potential. We understand that behind every resume is a story waiting to be told, a skill set waiting to be unleashed, and a dream waiting to be realized. With this understanding as our guiding principle, we have curated a suite of services and tools designed to unlock this potential and facilitate meaningful connections between employers and candidates.",
    location: organizationInfo.location || "Toronto",
    founded: organizationInfo.foundedYear || "2004",
    employees: organizationInfo.companySize || "1000 - 10000",
    website: organizationInfo.website || "www.meta.com",
  };

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
          © 2025 {displayData.name}. All rights reserved. You may print or
          download extracts for personal, non-commercial use only, and must
          acknowledge the website as the source.
        </p>
      </div>
    </section>
  );
}
