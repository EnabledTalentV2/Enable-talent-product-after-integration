"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { JobFormValues } from "@/lib/employerJobsTypes";

type JobFormProps = {
  submitLabel?: string;
  initialValues?: Partial<JobFormValues>;
  onSubmit?: (values: JobFormValues) => Promise<void>;
};

const experienceOptions = ["1 - 2", "2 - 3", "3 - 5", "5+"] as const;
const employmentTypeOptions = [
  "Full time",
  "Part time",
  "Internship",
  "Contract",
  "Hourly based",
] as const;
const workArrangementOptions = ["Remote", "Hybrid", "Onsite"] as const;
const urgentOptions = ["Yes", "No"] as const;
const languageOptions = ["English", "French", "Spanish"] as const;

const emptyValues: JobFormValues = {
  title: "",
  company: "",
  location: "",
  address: "",
  experience: "",
  employmentType: "",
  workArrangement: "",
  preferredLanguage: "",
  urgentHiring: "",
  description: "",
  requirements: "",
  salary: "",
};

export default function JobForm({
  submitLabel = "Post Job",
  initialValues,
  onSubmit,
}: JobFormProps) {
  const [values, setValues] = useState<JobFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Job Title (Corrected from screenshot typo 'Job Location') */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title
        </label>
        <input
          type="text"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Senior UX Designer"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <div className="relative">
          <input
            type="text"
            name="company"
            value={values.company}
            onChange={handleChange}
            placeholder="e.g. Enabled Talent"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
          />
        </div>
      </div>

      {/* Job Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Location
        </label>
        <input
          type="text"
          name="location"
          value={values.location}
          onChange={handleChange}
          placeholder="e.g. Toronto, ON"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <input
          type="text"
          name="address"
          value={values.address}
          onChange={handleChange}
          placeholder="e.g. 123 King St W, Toronto, ON"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Years of experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Years of experience
        </label>
        <div className="flex flex-wrap gap-6">
          {experienceOptions.map((exp) => (
            <label key={exp} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="experience"
                value={exp}
                checked={values.experience === exp}
                onChange={handleChange}
                className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="ml-2 text-gray-600 text-sm">{exp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Job Type
        </label>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Employment type
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
              {employmentTypeOptions.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="employmentType"
                    value={type}
                    checked={values.employmentType === type}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-gray-600 text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Work arrangement
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
              {workArrangementOptions.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="workArrangement"
                    value={type}
                    checked={values.workArrangement === type}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-gray-600 text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preferred language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred language
        </label>
        <select
          name="preferredLanguage"
          value={values.preferredLanguage}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800 bg-white"
        >
          <option value="" disabled>
            Select a language
          </option>
          {languageOptions.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500">Choose one language.</p>
      </div>

      {/* Urgently hiring */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Are you urgently hiring?
        </label>
        <div className="flex gap-6">
          {urgentOptions.map((option) => (
            <label key={option} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="urgentHiring"
                value={option}
                checked={values.urgentHiring === option}
                onChange={handleChange}
                className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="ml-2 text-gray-600 text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description
        </label>
        <textarea
          rows={6}
          name="description"
          value={values.description}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800 text-sm leading-relaxed"
          placeholder={`Briefly describe the role and responsibilities.\n- Own the end-to-end design process\n- Collaborate with product and engineering\n- Deliver high-quality UI flows`}
        />
      </div>

      {/* Job Requirement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Requirement
        </label>
        <textarea
          rows={8}
          name="requirements"
          value={values.requirements}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800 text-sm leading-relaxed"
          placeholder={`List the key requirements for the role.\n- 5+ years of relevant experience\n- Strong portfolio or work samples\n- Experience with design systems`}
        />
      </div>

      {/* Estimated Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estimated Salary
        </label>
        <input
          type="text"
          name="salary"
          value={values.salary}
          onChange={handleChange}
          placeholder="e.g. CAD 80,000 - 95,000"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#D98836] hover:bg-[#c2792f] text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
