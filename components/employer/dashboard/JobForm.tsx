"use client";

import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
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

const toId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

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
  const formId = useId();
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
        <label
          htmlFor={`${formId}-title`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Title
        </label>
        <input
          id={`${formId}-title`}
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
        <label
          htmlFor={`${formId}-company`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Company Name
        </label>
        <div className="relative">
          <input
            id={`${formId}-company`}
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
        <label
          htmlFor={`${formId}-location`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Location
        </label>
        <input
          id={`${formId}-location`}
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
        <label
          htmlFor={`${formId}-address`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Address
        </label>
        <input
          id={`${formId}-address`}
          type="text"
          name="address"
          value={values.address}
          onChange={handleChange}
          placeholder="e.g. 123 King St W, Toronto, ON"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Years of experience */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Years of experience
        </legend>
        <div className="flex flex-wrap gap-6">
          {experienceOptions.map((exp) => (
            <label key={exp} className="flex items-center cursor-pointer">
              <input
                id={`${formId}-experience-${toId(exp)}`}
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
      </fieldset>

      {/* Job Type */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Job Type
        </legend>
        <div className="space-y-4">
          <div role="group" aria-labelledby={`${formId}-employment-type-label`}>
            <p
              id={`${formId}-employment-type-label`}
              className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3"
            >
              Employment type
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
              {employmentTypeOptions.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    id={`${formId}-employment-${toId(type)}`}
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
          <div role="group" aria-labelledby={`${formId}-work-arrangement-label`}>
            <p
              id={`${formId}-work-arrangement-label`}
              className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3"
            >
              Work arrangement
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
              {workArrangementOptions.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    id={`${formId}-arrangement-${toId(type)}`}
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
      </fieldset>

      {/* Preferred language */}
      <div>
        <label
          htmlFor={`${formId}-preferred-language`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Preferred language
        </label>
        <select
          id={`${formId}-preferred-language`}
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
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          Are you urgently hiring?
        </legend>
        <div className="flex gap-6">
          {urgentOptions.map((option) => (
            <label key={option} className="flex items-center cursor-pointer">
              <input
                id={`${formId}-urgent-${toId(option)}`}
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
      </fieldset>

      {/* Job Description */}
      <div>
        <label
          htmlFor={`${formId}-description`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Description
        </label>
        <textarea
          id={`${formId}-description`}
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
        <label
          htmlFor={`${formId}-requirements`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Requirement
        </label>
        <textarea
          id={`${formId}-requirements`}
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
        <label
          htmlFor={`${formId}-salary`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Estimated Salary
        </label>
        <input
          id={`${formId}-salary`}
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
