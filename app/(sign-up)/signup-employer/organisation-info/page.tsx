"use client";

import NavBarEmployerSignUp from "@/components/employer/NavBarEmployerSignUp";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import {
  clearPendingEmployerSignup,
  getPendingEmployerSignup,
  saveEmployer,
  setCurrentEmployer,
} from "@/lib/localEmployerStore";
import defaultImage from "@/public/Placeholder.png";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";

type FieldErrors = Partial<{
  organizationName: string;
  aboutOrganization: string;
  location: string;
  foundedYear: string;
  website: string;
  companySize: string;
  industry: string;
}>;

const inputClasses = (hasError?: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-orange-500 focus:ring-orange-500"
  }`;

export default function OrganisationInfoPage() {
  const router = useRouter();
  const employerData = useEmployerDataStore((s) => s.employerData);
  const organizationInfo = useEmployerDataStore(
    (s) => s.employerData.organizationInfo
  );
  const patchOrganizationInfo = useEmployerDataStore(
    (s) => s.patchOrganizationInfo
  );

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pendingSignup] = useState(() => getPendingEmployerSignup());
  const orgNameRef = useRef<HTMLInputElement | null>(null);
  const aboutRef = useRef<HTMLTextAreaElement | null>(null);
  const locationRef = useRef<HTMLInputElement | null>(null);
  const foundedRef = useRef<HTMLInputElement | null>(null);
  const websiteRef = useRef<HTMLInputElement | null>(null);
  const companySizeRef = useRef<HTMLDivElement | null>(null);
  const industryRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!pendingSignup) {
      router.replace("/signup-employer");
    }
  }, [pendingSignup, router]);

  const welcomeName =
    pendingSignup?.fullName?.trim() ||
    pendingSignup?.employerName?.trim() ||
    "Employer";

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedOrgName = organizationInfo.organizationName.trim();
    const trimmedAbout = organizationInfo.aboutOrganization.trim();
    const trimmedLocation = organizationInfo.location.trim();
    const trimmedWebsite = organizationInfo.website.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedOrgName)
      nextErrors.organizationName = "Organization name is required.";
    if (!trimmedAbout)
      nextErrors.aboutOrganization = "About organization is required.";
    if (!trimmedLocation) nextErrors.location = "Location is required.";
    if (!organizationInfo.foundedYear)
      nextErrors.foundedYear = "Founded date is required.";
    if (!trimmedWebsite) nextErrors.website = "Website is required.";
    if (!organizationInfo.companySize)
      nextErrors.companySize = "Please select company size.";
    if (!organizationInfo.industry)
      nextErrors.industry = "Please select an industry.";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      const fieldOrder: Array<
        [keyof FieldErrors, RefObject<HTMLElement | null>]
      > = [
        [
          "organizationName",
          orgNameRef as unknown as RefObject<HTMLElement | null>,
        ],
        [
          "aboutOrganization",
          aboutRef as unknown as RefObject<HTMLElement | null>,
        ],
        ["location", locationRef as unknown as RefObject<HTMLElement | null>],
        ["foundedYear", foundedRef as unknown as RefObject<HTMLElement | null>],
        ["website", websiteRef as unknown as RefObject<HTMLElement | null>],
        [
          "companySize",
          companySizeRef as unknown as RefObject<HTMLElement | null>,
        ],
        ["industry", industryRef as unknown as RefObject<HTMLElement | null>],
      ];
      const firstInvalid = fieldOrder.find(([key]) => nextErrors[key]);
      const target = firstInvalid?.[1]?.current;
      if (target) {
        (target as HTMLElement).focus?.();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const pending = getPendingEmployerSignup();
    if (!pending) {
      router.replace("/signup-employer");
      return;
    }

    saveEmployer({
      email: pending.email,
      password: pending.password,
      employerData,
      fullName: pending.fullName,
      employerName: pending.employerName,
    });
    setCurrentEmployer(pending.email);
    clearPendingEmployerSignup();
    setFieldErrors({});
    router.push("/employer/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F5FA] pb-10">
      <NavBarEmployerSignUp />

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar Card */}
          <div className="w-full lg:w-87.5 shrink-0">
            <div className="relative overflow-hidden rounded-[30px] bg-[#FFD66C] p-8 min-h-70">
              {/* Decorative swirl */}
              <div className="absolute right-0 top-0 h-full w-full opacity-50 pointer-events-none">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <path
                    fill="none"
                    stroke="white"
                    strokeWidth="20"
                    d="M100,200 C150,150 150,50 200,0"
                    opacity="0.6"
                  />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                <div className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  <Image
                    src={defaultImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-800">Welcome</p>
                  <h2 className="text-3xl font-bold text-black">
                    {welcomeName}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="flex-1 rounded-[30px] bg-white p-8 md:p-12 shadow-sm">
            <h1 className="mb-8 text-2xl font-semibold text-gray-900">
              Organization Info
            </h1>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Organization Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Organization name
                </label>
                <input
                  ref={orgNameRef}
                  type="text"
                  placeholder="Enter organization name"
                  value={organizationInfo.organizationName}
                  onChange={(event) => {
                    clearFieldError("organizationName");
                    patchOrganizationInfo({
                      organizationName: event.target.value,
                    });
                  }}
                  className={inputClasses(!!fieldErrors.organizationName)}
                />
                {fieldErrors.organizationName ? (
                  <p className="text-sm text-red-500">
                    {fieldErrors.organizationName}
                  </p>
                ) : null}
              </div>

              {/* About Organization */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  About Organization
                </label>
                <textarea
                  ref={aboutRef}
                  placeholder="Enter description about company"
                  rows={4}
                  value={organizationInfo.aboutOrganization}
                  onChange={(event) => {
                    clearFieldError("aboutOrganization");
                    patchOrganizationInfo({
                      aboutOrganization: event.target.value,
                    });
                  }}
                  className={`${inputClasses(
                    !!fieldErrors.aboutOrganization
                  )} resize-none`}
                />
                {fieldErrors.aboutOrganization ? (
                  <p className="text-sm text-red-500">
                    {fieldErrors.aboutOrganization}
                  </p>
                ) : null}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Location
                </label>
                <input
                  ref={locationRef}
                  type="text"
                  value={organizationInfo.location}
                  onChange={(event) => {
                    clearFieldError("location");
                    patchOrganizationInfo({ location: event.target.value });
                  }}
                  className={inputClasses(!!fieldErrors.location)}
                />
                {fieldErrors.location ? (
                  <p className="text-sm text-red-500">{fieldErrors.location}</p>
                ) : null}
              </div>

              {/* Founded Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Founded year
                </label>
                <input
                  ref={foundedRef}
                  type="date"
                  value={organizationInfo.foundedYear}
                  onChange={(event) => {
                    clearFieldError("foundedYear");
                    patchOrganizationInfo({ foundedYear: event.target.value });
                  }}
                  className={inputClasses(!!fieldErrors.foundedYear)}
                />
                {fieldErrors.foundedYear ? (
                  <p className="text-sm text-red-500">
                    {fieldErrors.foundedYear}
                  </p>
                ) : null}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Website
                </label>
                <input
                  ref={websiteRef}
                  type="text"
                  placeholder="Enter website link"
                  value={organizationInfo.website}
                  onChange={(event) => {
                    clearFieldError("website");
                    patchOrganizationInfo({ website: event.target.value });
                  }}
                  className={inputClasses(!!fieldErrors.website)}
                />
                {fieldErrors.website ? (
                  <p className="text-sm text-red-500">{fieldErrors.website}</p>
                ) : null}
              </div>

              {/* Company Size */}
              <div ref={companySizeRef} className="space-y-3">
                <label className="text-sm font-medium text-gray-900">
                  Company Size
                </label>
                <div className="flex flex-wrap gap-6">
                  {[
                    { label: "1 - 10", value: "1-10" },
                    { label: "10 - 100", value: "10-100" },
                    { label: "100 - 1000", value: "100-1000" },
                    { label: "1000 - 10000", value: "1000-10000" },
                  ].map((size) => (
                    <label
                      key={size.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          organizationInfo.companySize === size.value
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {organizationInfo.companySize === size.value && (
                          <div className="h-3 w-3 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="companySize"
                        value={size.value}
                        checked={organizationInfo.companySize === size.value}
                        onChange={(event) => {
                          clearFieldError("companySize");
                          patchOrganizationInfo({
                            companySize: event.target.value,
                          });
                        }}
                        className="hidden"
                      />
                      <span className="text-gray-600">{size.label}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.companySize ? (
                  <p className="text-sm text-red-500">
                    {fieldErrors.companySize}
                  </p>
                ) : null}
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Industry
                </label>
                <div className="relative">
                  <select
                    ref={industryRef}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={organizationInfo.industry}
                    onChange={(event) => {
                      clearFieldError("industry");
                      patchOrganizationInfo({ industry: event.target.value });
                    }}
                  >
                    <option>Information Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={20}
                  />
                </div>
                {fieldErrors.industry ? (
                  <p className="text-sm text-red-500">{fieldErrors.industry}</p>
                ) : null}
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded-xl bg-gray-200 px-8 py-3 font-medium text-gray-600 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#D98B48] px-8 py-3 font-semibold text-white shadow-md hover:bg-[#C07A3D] transition-colors"
                >
                  Save & Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
