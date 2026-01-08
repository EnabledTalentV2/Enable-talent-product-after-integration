"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronDown } from "lucide-react";
import { useEmployerDataStore } from "@/lib/employerDataStore";

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

export default function CompanyProfileEditPage() {
  const router = useRouter();
  const { employerData, setEmployerData } = useEmployerDataStore();
  const { organizationInfo } = employerData;

  const [formData, setFormData] = useState({
    organizationName: "",
    industry: "",
    aboutOrganization: "",
    location: "",
    foundedYear: "",
    companySize: "",
    website: "",
  });

  useEffect(() => {
    if (organizationInfo) {
      setFormData({
        organizationName: organizationInfo.organizationName || "",
        industry: organizationInfo.industry || "",
        aboutOrganization: organizationInfo.aboutOrganization || "",
        location: organizationInfo.location || "",
        foundedYear: organizationInfo.foundedYear || "",
        companySize: organizationInfo.companySize || "",
        website: organizationInfo.website || "",
      });
    }
  }, [organizationInfo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmployerData((prev) => ({
      ...prev,
      organizationInfo: {
        ...prev.organizationInfo,
        ...formData,
      },
    }));
    // In a real app, you would also make an API call here to save to the backend
    router.push("/employer/dashboard/company-profile");
  };

  return (
    <section className="mx-auto max-w-3xl py-10 px-6">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Company Profile
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-[28px] bg-white p-8 shadow-sm"
      >
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter location"
          />
        </div>

        {/* Founded Year */}
        <div className="space-y-2">
          <label
            htmlFor="foundedYear"
            className="text-sm font-medium text-slate-700"
          >
            Founded year
          </label>
          <input
            type="date"
            id="foundedYear"
            name="foundedYear"
            value={formData.foundedYear}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter website link"
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
                <span className="text-slate-600">{size.label}</span>
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
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#C27803] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </form>
    </section>
  );
}
