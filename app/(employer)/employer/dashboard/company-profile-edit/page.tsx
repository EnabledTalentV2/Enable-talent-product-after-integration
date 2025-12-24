"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useEmployerDataStore } from "@/lib/employerDataStore";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="organizationName"
              className="text-sm font-medium text-slate-700"
            >
              Company Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Meta"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="industry"
              className="text-sm font-medium text-slate-700"
            >
              Industry
            </label>
            <input
              type="text"
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Software Development"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="aboutOrganization"
            className="text-sm font-medium text-slate-700"
          >
            About
          </label>
          <textarea
            id="aboutOrganization"
            name="aboutOrganization"
            value={formData.aboutOrganization}
            onChange={handleChange}
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Tell us about your company..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
              placeholder="e.g. Toronto"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="foundedYear"
              className="text-sm font-medium text-slate-700"
            >
              Founded Year
            </label>
            <input
              type="text"
              id="foundedYear"
              name="foundedYear"
              value={formData.foundedYear}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 2004"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="companySize"
              className="text-sm font-medium text-slate-700"
            >
              Employees
            </label>
            <input
              type="text"
              id="companySize"
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 1000 - 10000"
            />
          </div>

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
              placeholder="e.g. www.meta.com"
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
