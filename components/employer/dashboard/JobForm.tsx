"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { JobFormValues } from "@/lib/employerJobsTypes";

type JobFormProps = {
  submitLabel?: string;
  initialValues?: Partial<JobFormValues>;
  onSubmit?: (values: JobFormValues) => Promise<void>;
};

const employmentTypeOptions = [
  "Full time",
  "Part time",
  "Internship",
  "Contract",
  "Hourly based",
] as const;
const workArrangementOptions = ["Remote", "Hybrid", "Onsite"] as const;

const toId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const emptyValues: JobFormValues = {
  title: "",
  location: "",
  employmentType: "",
  workArrangement: "",
  description: "",
  requirements: "",
  salary: "",
  skills: [],
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
  const submitLockRef = useRef(false);
  const [skillInput, setSkillInput] = useState("");

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

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !(values.skills || []).includes(skill)) {
      setValues((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValues((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onSubmit || submitLockRef.current) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      submitLockRef.current = false;
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

      {/* Skills */}
      <div>
        <label
          htmlFor={`${formId}-skills`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Required Skills
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              id={`${formId}-skills`}
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="e.g. React, TypeScript, Python"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors text-gray-800"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {(values.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(values.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-blue-900"
                    aria-label={`Remove ${skill}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            Add skills one at a time. Press Enter or click Add button.
          </p>
        </div>
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
