"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, ChevronDown } from "lucide-react";
import { useEmployerDataStore } from "@/lib/employerDataStore";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";

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

export default function CompanyProfileEditPage() {
  const router = useRouter();
  const { employerData, setEmployerData } = useEmployerDataStore();
  const { organizationInfo } = employerData;

  const [formData, setFormData] = useState({
    organizationName: "",
    industry: "",
    aboutOrganization: "",
    location: "",
    companySize: "",
    website: "",
    linkedinUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load organization data if not present
  useEffect(() => {
    const loadData = async () => {
      if (organizationInfo?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest<unknown>("/api/organizations", {
          method: "GET",
        });

        console.log("Fetched organization data:", data);

        // Use the same utility to parse the data
        const { toEmployerOrganizationInfo } = await import("@/lib/organizationUtils");
        const parsedInfo = toEmployerOrganizationInfo(data);

        if (parsedInfo) {
          setEmployerData((prev) => ({
            ...prev,
            organizationInfo: {
              ...prev.organizationInfo,
              ...parsedInfo,
            },
          }));
        }
      } catch (error) {
        console.error("Failed to load organization:", error);
        setSubmitError("Failed to load organization data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [organizationInfo?.organizationId, setEmployerData]);

  useEffect(() => {
    if (organizationInfo) {
      setFormData({
        organizationName: organizationInfo.organizationName || "",
        industry: organizationInfo.industry || "",
        aboutOrganization: organizationInfo.aboutOrganization || "",
        location: organizationInfo.location || "",
        companySize: organizationInfo.companySize || "",
        website: organizationInfo.website || "",
        linkedinUrl: organizationInfo.linkedinUrl || "",
      });
      // Set existing avatar URL as preview
      if (organizationInfo.avatarUrl) {
        setAvatarPreview(organizationInfo.avatarUrl);
      }
    }
  }, [organizationInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Check if we have organization ID (for update) or need to create new
    const organizationId = organizationInfo?.organizationId;
    const isCreatingNew = !organizationId;

    // Validate required fields
    if (!formData.organizationName.trim()) {
      setSubmitError("Organization name is required.");
      return;
    }
    if (!formData.aboutOrganization.trim()) {
      setSubmitError("About organization is required.");
      return;
    }
    if (!formData.location.trim()) {
      setSubmitError("Location is required.");
      return;
    }
    if (!formData.website.trim()) {
      setSubmitError("Website is required.");
      return;
    }
    if (!formData.companySize) {
      setSubmitError("Company size is required.");
      return;
    }
    if (!formData.industry) {
      setSubmitError("Industry is required.");
      return;
    }

    setSubmitting(true);

    try {
      // Map frontend fields to backend fields
      const companySizeChoice = COMPANY_SIZE_CHOICES[formData.companySize];
      const industryChoice = INDUSTRY_CHOICES[formData.industry];

      // Validate that we have valid choices
      if (!companySizeChoice) {
        setSubmitError("Invalid company size selection. Please select a valid company size.");
        setSubmitting(false);
        return;
      }
      if (!industryChoice) {
        setSubmitError("Invalid industry selection. Please select a valid industry.");
        setSubmitting(false);
        return;
      }

      const requestFormData = new FormData();
      requestFormData.append("name", formData.organizationName.trim());
      requestFormData.append("about", formData.aboutOrganization.trim());
      requestFormData.append("headquarter_location", formData.location.trim());
      requestFormData.append("url", formData.website.trim());
      if (formData.linkedinUrl.trim()) {
        requestFormData.append("linkedin_url", formData.linkedinUrl.trim());
      }
      requestFormData.append("employee_size", String(companySizeChoice ?? ""));
      requestFormData.append("industry", String(industryChoice ?? ""));
      if (avatarFile) {
        requestFormData.append("avatar", avatarFile);
      }

      let responseData;
      if (isCreatingNew) {
        responseData = await apiRequest<unknown>("/api/organizations", {
          method: "POST",
          body: requestFormData,
        });
      } else {
        responseData = await apiRequest<unknown>(
          `/api/organizations/${organizationId}`,
          {
            method: "PATCH",
            body: requestFormData,
          }
        );
      }

      // Parse the response to get avatar_url and other fields
      const { toEmployerOrganizationInfo } = await import("@/lib/organizationUtils");
      const updatedOrgInfo = toEmployerOrganizationInfo(responseData);

      // Update local store with response data (includes avatar_url)
      if (updatedOrgInfo) {
        setEmployerData((prev) => ({
          ...prev,
          organizationInfo: {
            ...prev.organizationInfo,
            ...updatedOrgInfo,
          },
        }));
      }

      // Redirect to profile page or post jobs page
      if (isCreatingNew) {
        router.push("/employer/dashboard/post-jobs");
      } else {
        router.push("/employer/dashboard/company-profile");
      }
    } catch (error) {
      console.error(`Failed to ${isCreatingNew ? "create" : "update"} organization:`, error);
      const defaultMessage = isCreatingNew
        ? "Failed to create organization. Please try again."
        : "Failed to save changes. Please try again.";
      const message = getApiErrorMessage(error, defaultMessage);
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl py-10 px-6">
        <div className="rounded-[28px] bg-white p-8 shadow-sm text-center">
          <p className="text-slate-700">Loading organization data...</p>
        </div>
      </section>
    );
  }

  const isCreatingNew = !organizationInfo?.organizationId;

  return (
    <section className="mx-auto max-w-3xl py-10 px-6">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isCreatingNew ? "Create Company Profile" : "Edit Company Profile"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[28px] bg-white p-8 shadow-sm"
      >
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            <p className="font-semibold">Unable to save</p>
            <p className="mt-1 whitespace-pre-wrap">{submitError}</p>
          </div>
        )}

        {/* Organization Logo */}
        <div className="space-y-2">
          <label htmlFor="avatar-upload-edit" className="text-sm font-medium text-slate-700">
            Organization Logo
          </label>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24">
              <div className="h-24 w-24 rounded-full border-4 border-slate-200 bg-slate-100 overflow-hidden">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Organization Logo"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-slate-400">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 20C23.3137 20 26 17.3137 26 14C26 10.6863 23.3137 8 20 8C16.6863 8 14 10.6863 14 14C14 17.3137 16.6863 20 20 20Z"
                        fill="currentColor"
                      />
                      <path
                        d="M20 22C13.3726 22 8 27.3726 8 34H32C32 27.3726 26.6274 22 20 22Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload button overlay */}
              <label
                htmlFor="avatar-upload-edit"
                className="absolute bottom-0 right-0 h-11 w-11 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                title="Upload organization logo"
              >
                <span className="sr-only">Upload organization logo</span>
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
                id="avatar-upload-edit"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                Upload your organization logo. Recommended size: 400x400px.
              </p>
              <p className="text-xs text-slate-700 mt-1">
                Max file size: 5MB. Accepted formats: JPG, PNG, WebP
              </p>
            </div>
          </div>
        </div>

        {/* Organization Name */}
        <div className="space-y-2">
          <label
            htmlFor="organizationName"
            className="text-sm font-medium text-slate-700"
          >
            Organization name
          </label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus-visible:border-[#C27803] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
            placeholder="Enter organization name"
          />
        </div>

        {/* About Organization */}
        <div className="space-y-2">
          <label
            htmlFor="aboutOrganization"
            className="text-sm font-medium text-slate-700"
          >
            About Organization
          </label>
          <textarea
            id="aboutOrganization"
            name="aboutOrganization"
            value={formData.aboutOrganization}
            onChange={handleChange}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus-visible:border-[#C27803] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
            placeholder="Enter description about company"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label
            htmlFor="location"
            className="text-sm font-medium text-slate-700"
          >
            Location
          </label>
          <LocationAutocomplete
            label=""
            inputId="location"
            inputName="location"
            value={formData.location}
            onChange={(newLocation) =>
              setFormData((prev) => ({ ...prev, location: newLocation }))
            }
            required
            placeholder="Enter location"
          />
        </div>

        {/* Website */}
        <div className="space-y-2">
          <label
            htmlFor="website"
            className="text-sm font-medium text-slate-700"
          >
            Website
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus-visible:border-[#C27803] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
            placeholder="Enter website link"
          />
        </div>

        {/* LinkedIn */}
        <div className="space-y-2">
          <label
            htmlFor="linkedinUrl"
            className="text-sm font-medium text-slate-700"
          >
            LinkedIn URL
          </label>
          <input
            type="text"
            id="linkedinUrl"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus-visible:border-[#C27803] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
            placeholder="Enter LinkedIn page"
          />
        </div>

        {/* Company Size */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700">
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
                  checked={formData.companySize === size.value}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 ${
                    formData.companySize === size.value
                      ? "border-blue-500"
                      : "border-slate-300"
                  }`}
                >
                  {formData.companySize === size.value && (
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <span className="text-slate-700">{size.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Industry */}
        <div className="space-y-2">
          <label
            htmlFor="industry"
            className="text-sm font-medium text-slate-700"
          >
            Industry
          </label>
          <div className="relative">
            <select
              id="industry"
              name="industry"
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus-visible:border-[#C27803] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
              value={formData.industry}
              onChange={handleChange}
            >
              <option value="">Select industry</option>
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option.id} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={20}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-[#C27803] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {submitting
              ? "Saving..."
              : (isCreatingNew ? "Create Organization" : "Save Changes")
            }
          </button>
        </div>
      </form>
    </section>
  );
}
