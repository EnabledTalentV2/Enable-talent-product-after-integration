"use client";

import NavBarEmployerSignUp from "@/components/employer/NavBarEmployerSignUp";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
import { useEmployerDataStore } from "@/lib/employerDataStore";
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
import { apiRequest, getApiErrorMessage, isApiError } from "@/lib/api-client";

type FieldErrors = Partial<{
  organizationName: string;
  aboutOrganization: string;
  location: string;
  website: string;
  linkedinUrl: string;
  companySize: string;
  industry: string;
}>;

const extractErrorText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .join(" ");
  }
  return "";
};

const toFieldErrorsFromApi = (error: unknown): FieldErrors => {
  if (!isApiError(error)) return {};
  if (!error.data || typeof error.data !== "object") return {};

  const data = error.data as Record<string, unknown>;
  const nextErrors: FieldErrors = {};

  const nameMessage = extractErrorText(data.name);
  if (nameMessage) nextErrors.organizationName = nameMessage;

  const aboutMessage = extractErrorText(data.about);
  if (aboutMessage) nextErrors.aboutOrganization = aboutMessage;

  const locationMessage = extractErrorText(data.headquarter_location);
  if (locationMessage) nextErrors.location = locationMessage;

  const websiteMessage = extractErrorText(data.url);
  if (websiteMessage) nextErrors.website = websiteMessage;

  const linkedinMessage = extractErrorText(data.linkedin_url ?? data.linkedin);
  if (linkedinMessage) nextErrors.linkedinUrl = linkedinMessage;

  const sizeMessage = extractErrorText(data.employee_size);
  if (sizeMessage) nextErrors.companySize = sizeMessage;

  const industryMessage = extractErrorText(data.industry);
  if (industryMessage) nextErrors.industry = industryMessage;

  return nextErrors;
};

const inputClasses = (hasError?: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-orange-500 focus:ring-orange-500"
  }`;

const COMPANY_SIZE_OPTIONS = [
  { label: "1 - 10", value: "1-10", id: 1 },
  { label: "10 - 100", value: "10-100", id: 2 },
  { label: "100 - 1000", value: "100-1000", id: 3 },
  { label: "1000 - 10000", value: "1000-10000", id: 4 },
] as const;

const INDUSTRY_OPTIONS = [
  { label: "Information Technology", id: 1 },
  { label: "Healthcare", id: 2 },
  { label: "Finance", id: 3 },
  { label: "Education", id: 4 },
  { label: "Other", id: 5 },
] as const;

const COMPANY_SIZE_CHOICES = Object.fromEntries(
  COMPANY_SIZE_OPTIONS.map((option) => [option.value, option.id])
) as Record<string, number>;

const INDUSTRY_CHOICES = Object.fromEntries(
  INDUSTRY_OPTIONS.map((option) => [option.label, option.id])
) as Record<string, number>;

export default function OrganisationInfoPage() {
  const router = useRouter();
  const organizationInfo = useEmployerDataStore(
    (s) => s.employerData?.organizationInfo
  ) ?? {
    organizationName: "",
    aboutOrganization: "",
    location: "",
    website: "",
    linkedinUrl: "",
    companySize: "",
    industry: "",
  };
  const patchOrganizationInfo = useEmployerDataStore(
    (s) => s.patchOrganizationInfo
  );

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const orgNameRef = useRef<HTMLInputElement | null>(null);
  const aboutRef = useRef<HTMLTextAreaElement | null>(null);
  const locationRef = useRef<HTMLInputElement | null>(null);
  const websiteRef = useRef<HTMLInputElement | null>(null);
  const linkedinRef = useRef<HTMLInputElement | null>(null);
  const companySizeRef = useRef<HTMLFieldSetElement | null>(null);
  const industryRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login-employer");
        }
      } catch {
        router.replace("/login-employer");
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const normalizedCompanySize = organizationInfo.companySize
      ? organizationInfo.companySize.replace(/\s+/g, "")
      : organizationInfo.companySize;

    if (normalizedCompanySize !== organizationInfo.companySize) {
      patchOrganizationInfo({
        companySize: normalizedCompanySize,
      });
    }
  }, [
    organizationInfo.companySize,
    patchOrganizationInfo,
  ]);

  const welcomeName = organizationInfo.organizationName.trim() || "Employer";

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSubmitError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Image size must be less than 5MB");
      return;
    }

    setAvatarFile(file);
    setSubmitError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const trimmedOrgName = organizationInfo.organizationName.trim();
    const trimmedAbout = organizationInfo.aboutOrganization.trim();
    const trimmedLocation = organizationInfo.location.trim();
    const trimmedWebsite = organizationInfo.website.trim();
    const trimmedLinkedin = organizationInfo.linkedinUrl.trim();
    const companySizeChoice = COMPANY_SIZE_CHOICES[organizationInfo.companySize];
    const industryChoice = INDUSTRY_CHOICES[organizationInfo.industry];

    const nextErrors: FieldErrors = {};
    if (!trimmedOrgName)
      nextErrors.organizationName = "Organization name is required.";
    if (!trimmedAbout)
      nextErrors.aboutOrganization = "About organization is required.";
    if (!trimmedLocation) nextErrors.location = "Location is required.";
    if (!trimmedWebsite) nextErrors.website = "Website is required.";
    if (!companySizeChoice)
      nextErrors.companySize = "Please select company size.";
    if (!industryChoice)
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
        ["website", websiteRef as unknown as RefObject<HTMLElement | null>],
        ["linkedinUrl", linkedinRef as unknown as RefObject<HTMLElement | null>],
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

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", trimmedOrgName);
      formData.append("industry", String(industryChoice ?? ""));
      formData.append("employee_size", String(companySizeChoice ?? ""));
      formData.append("headquarter_location", trimmedLocation);
      formData.append("about", trimmedAbout);
      if (trimmedWebsite) {
        formData.append("url", trimmedWebsite);
      }
      if (trimmedLinkedin) {
        formData.append("linkedin_url", trimmedLinkedin);
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const orgData = await apiRequest<unknown>("/api/organizations", {
        method: "POST",
        body: formData,
      });
      console.log("Organization created successfully:", orgData);

      setFieldErrors({});
      router.push("/employer/dashboard");
    } catch (error) {
      console.error("Failed to complete signup:", error);
      const message = getApiErrorMessage(
        error,
        "Failed to save. Please try again."
      );
      setSubmitError(message);
      const apiFieldErrors = toFieldErrorsFromApi(error);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
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
                <div className="relative h-24 w-24">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    <Image
                      src={avatarPreview || defaultImage}
                      alt="Organization Logo"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Upload button overlay */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors"
                    title="Upload organization logo"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 1V13M1 7H13"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-800">Welcome</p>
                  <h2 className="text-3xl font-bold text-black">
                    {welcomeName}
                  </h2>
                  <p className="text-sm text-gray-700 mt-2">
                    Click + to upload logo
                  </p>
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
              {submitError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <p className="font-semibold">Unable to save</p>
                  <p className="mt-1 whitespace-pre-wrap">{submitError}</p>
                </div>
              ) : null}
              {/* Organization Name */}
              <div className="space-y-2">
                <label
                  htmlFor="organization-name"
                  className="text-sm font-medium text-gray-900"
                >
                  Organization name
                </label>
                <input
                  ref={orgNameRef}
                  id="organization-name"
                  type="text"
                  placeholder="Enter organization name"
                  value={organizationInfo.organizationName}
                  aria-invalid={Boolean(fieldErrors.organizationName)}
                  aria-describedby={
                    fieldErrors.organizationName
                      ? "organization-name-error"
                      : undefined
                  }
                  onChange={(event) => {
                    clearFieldError("organizationName");
                    patchOrganizationInfo({
                      organizationName: event.target.value,
                    });
                  }}
                  className={inputClasses(!!fieldErrors.organizationName)}
                />
                {fieldErrors.organizationName ? (
                  <p
                    id="organization-name-error"
                    className="text-sm text-red-500"
                  >
                    {fieldErrors.organizationName}
                  </p>
                ) : null}
              </div>

              {/* About Organization */}
              <div className="space-y-2">
                <label
                  htmlFor="organization-about"
                  className="text-sm font-medium text-gray-900"
                >
                  About Organization
                </label>
                <textarea
                  ref={aboutRef}
                  id="organization-about"
                  placeholder="Enter description about company"
                  rows={4}
                  value={organizationInfo.aboutOrganization}
                  aria-invalid={Boolean(fieldErrors.aboutOrganization)}
                  aria-describedby={
                    fieldErrors.aboutOrganization
                      ? "organization-about-error"
                      : undefined
                  }
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
                  <p
                    id="organization-about-error"
                    className="text-sm text-red-500"
                  >
                    {fieldErrors.aboutOrganization}
                  </p>
                ) : null}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label
                  htmlFor="organization-location"
                  className="text-sm font-medium text-gray-900"
                >
                  Location
                </label>
                <LocationAutocomplete
                  label=""
                  inputId="organization-location"
                  inputName="location"
                  inputRef={locationRef}
                  value={organizationInfo.location}
                  error={fieldErrors.location}
                  required
                  onChange={(newLocation) => {
                    clearFieldError("location");
                    patchOrganizationInfo({ location: newLocation });
                  }}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label
                  htmlFor="organization-website"
                  className="text-sm font-medium text-gray-900"
                >
                  Website
                </label>
                <input
                  ref={websiteRef}
                  id="organization-website"
                  type="text"
                  placeholder="Enter website link"
                  value={organizationInfo.website}
                  aria-invalid={Boolean(fieldErrors.website)}
                  aria-describedby={
                    fieldErrors.website
                      ? "organization-website-error"
                      : undefined
                  }
                  onChange={(event) => {
                    clearFieldError("website");
                    patchOrganizationInfo({ website: event.target.value });
                  }}
                  className={inputClasses(!!fieldErrors.website)}
                />
                {fieldErrors.website ? (
                  <p
                    id="organization-website-error"
                    className="text-sm text-red-500"
                  >
                    {fieldErrors.website}
                  </p>
                ) : null}
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <label
                  htmlFor="organization-linkedin"
                  className="text-sm font-medium text-gray-900"
                >
                  LinkedIn URL
                </label>
                <input
                  ref={linkedinRef}
                  id="organization-linkedin"
                  type="text"
                  placeholder="Enter LinkedIn page"
                  value={organizationInfo.linkedinUrl}
                  aria-invalid={Boolean(fieldErrors.linkedinUrl)}
                  aria-describedby={
                    fieldErrors.linkedinUrl
                      ? "organization-linkedin-error"
                      : undefined
                  }
                  onChange={(event) => {
                    clearFieldError("linkedinUrl");
                    patchOrganizationInfo({ linkedinUrl: event.target.value });
                  }}
                  className={inputClasses(!!fieldErrors.linkedinUrl)}
                />
                {fieldErrors.linkedinUrl ? (
                  <p
                    id="organization-linkedin-error"
                    className="text-sm text-red-500"
                  >
                    {fieldErrors.linkedinUrl}
                  </p>
                ) : null}
              </div>

              {/* Company Size */}
              <fieldset ref={companySizeRef} className="space-y-3">
                <legend className="text-sm font-medium text-gray-900">
                  Company Size
                </legend>
                <div className="flex flex-wrap gap-6">
                  {COMPANY_SIZE_OPTIONS.map((size) => (
                    <label
                      key={size.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
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
                        className="sr-only peer"
                      />
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500 peer-focus-visible:ring-offset-2 ${
                          organizationInfo.companySize === size.value
                            ? "border-orange-500"
                            : "border-gray-300"
                        }`}
                      >
                        {organizationInfo.companySize === size.value && (
                          <div className="h-3 w-3 rounded-full bg-orange-500" />
                        )}
                      </div>
                      <span className="text-gray-600">{size.label}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.companySize ? (
                  <p className="text-sm text-red-500">
                    {fieldErrors.companySize}
                  </p>
                ) : null}
              </fieldset>

              {/* Industry */}
              <div className="space-y-2">
                <label
                  htmlFor="organization-industry"
                  className="text-sm font-medium text-gray-900"
                >
                  Industry
                </label>
                <div className="relative">
                  <select
                    ref={industryRef}
                    id="organization-industry"
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={organizationInfo.industry}
                    aria-invalid={Boolean(fieldErrors.industry)}
                    aria-describedby={
                      fieldErrors.industry
                        ? "organization-industry-error"
                        : undefined
                    }
                    onChange={(event) => {
                      clearFieldError("industry");
                      patchOrganizationInfo({ industry: event.target.value });
                    }}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <option key={option.id} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={20}
                  />
                </div>
                {fieldErrors.industry ? (
                  <p
                    id="organization-industry-error"
                    className="text-sm text-red-500"
                  >
                    {fieldErrors.industry}
                  </p>
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
