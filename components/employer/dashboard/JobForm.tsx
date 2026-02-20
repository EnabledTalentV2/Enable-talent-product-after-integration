"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import LocationAutocomplete from "@/components/ui/LocationAutocomplete";
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

type DescriptionFormatAction = "bold" | "heading" | "bullet" | "link";

const descriptionToolbarButtons: ReadonlyArray<{
  action: DescriptionFormatAction;
  label: string;
  ariaLabel: string;
}> = [
  {
    action: "bold",
    label: "Bold",
    ariaLabel: "Format selected text as bold",
  },
  {
    action: "heading",
    label: "H2",
    ariaLabel: "Format line or selection as a level 2 heading",
  },
  {
    action: "bullet",
    label: "Bullets",
    ariaLabel: "Format line or selection as a bullet list",
  },
  {
    action: "link",
    label: "Link",
    ariaLabel: "Insert markdown link",
  },
];

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
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const descriptionSelectionRef = useRef({ start: 0, end: 0 });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
    descriptionSelectionRef.current = { start: 0, end: 0 };
  }, [initialValues]);

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>,
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

  const handleSkillKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const cacheDescriptionSelection = () => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    descriptionSelectionRef.current = {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
    };
  };

  const getDescriptionSelection = (text: string) => {
    const textarea = descriptionRef.current;
    const start =
      textarea?.selectionStart ?? descriptionSelectionRef.current.start;
    const end = textarea?.selectionEnd ?? descriptionSelectionRef.current.end;
    const boundedStart = Math.max(0, Math.min(start, text.length));
    const boundedEnd = Math.max(boundedStart, Math.min(end, text.length));
    return { start: boundedStart, end: boundedEnd };
  };

  const setDescriptionWithSelection = (
    description: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    setValues((prev) => ({ ...prev, description }));
    descriptionSelectionRef.current = {
      start: selectionStart,
      end: selectionEnd,
    };
    requestAnimationFrame(() => {
      const textarea = descriptionRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const wrapDescriptionSelection = (
    prefix: string,
    suffix: string,
    placeholder: string,
  ) => {
    const text = values.description ?? "";
    const { start, end } = getDescriptionSelection(text);
    const selectedText = text.slice(start, end);
    const insertedText = selectedText || placeholder;
    const nextText =
      text.slice(0, start) + prefix + insertedText + suffix + text.slice(end);
    const nextSelectionStart = start + prefix.length;
    const nextSelectionEnd = nextSelectionStart + insertedText.length;
    setDescriptionWithSelection(
      nextText,
      nextSelectionStart,
      nextSelectionEnd,
    );
  };

  const prefixDescriptionSelection = (prefix: string, fallbackText: string) => {
    const text = values.description ?? "";
    const { start, end } = getDescriptionSelection(text);

    if (start === end) {
      const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const lineEndIndex = text.indexOf("\n", start);
      const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;
      const lineText = text.slice(lineStart, lineEnd);
      const content = lineText.trim().length > 0 ? lineText : fallbackText;
      const nextLine = `${prefix}${content}`;
      const nextText =
        text.slice(0, lineStart) + nextLine + text.slice(lineEnd);
      const nextSelectionStart = lineStart + prefix.length;
      const nextSelectionEnd = nextSelectionStart + content.length;
      setDescriptionWithSelection(
        nextText,
        nextSelectionStart,
        nextSelectionEnd,
      );
      return;
    }

    const selectedText = text.slice(start, end);
    const formattedSelection = selectedText
      .split("\n")
      .map((line) => (line.trim().length > 0 ? `${prefix}${line}` : line))
      .join("\n");
    const nextText =
      text.slice(0, start) + formattedSelection + text.slice(end);
    setDescriptionWithSelection(
      nextText,
      start,
      start + formattedSelection.length,
    );
  };

  const insertDescriptionLink = () => {
    const text = values.description ?? "";
    const { start, end } = getDescriptionSelection(text);
    const selectedText = text.slice(start, end) || "link text";
    const placeholderUrl = "https://example.com";
    const markdownLink = `[${selectedText}](${placeholderUrl})`;
    const nextText = text.slice(0, start) + markdownLink + text.slice(end);
    const urlStart = start + markdownLink.indexOf(placeholderUrl);
    const urlEnd = urlStart + placeholderUrl.length;
    setDescriptionWithSelection(nextText, urlStart, urlEnd);
  };

  const handleDescriptionToolbarAction = (action: DescriptionFormatAction) => {
    if (action === "bold") {
      wrapDescriptionSelection("**", "**", "bold text");
      return;
    }
    if (action === "heading") {
      prefixDescriptionSelection("## ", "Heading");
      return;
    }
    if (action === "bullet") {
      prefixDescriptionSelection("- ", "List item");
      return;
    }
    insertDescriptionLink();
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
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
      aria-label="Job posting form"
    >
      {/* Job Title */}
      <div>
        <label
          htmlFor={`${formId}-title`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Title
          <span aria-hidden="true" className="text-red-500">
            {" "}
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id={`${formId}-title`}
          type="text"
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="e.g. Senior UX Designer"
          autoComplete="on"
          required
          aria-required="true"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C27803] focus:ring-2 focus:ring-[#C27803]/20 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Job Location */}
      <div>
        <label
          htmlFor={`${formId}-location`}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Job Location
          <span aria-hidden="true" className="text-red-500">
            {" "}
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <LocationAutocomplete
          label=""
          inputId={`${formId}-location`}
          inputName="location"
          value={values.location}
          onChange={(newLocation) =>
            setValues((prev) => ({ ...prev, location: newLocation }))
          }
          required
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
                    className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-[#C27803]"
                  />
                  <span className="ml-2 text-gray-600 text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div
            role="group"
            aria-labelledby={`${formId}-work-arrangement-label`}
          >
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
                    className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-[#C27803]"
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
          <span aria-hidden="true" className="text-red-500">
            {" "}
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <div
          role="toolbar"
          aria-label="Job description formatting options"
          className="mb-2 flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2"
        >
          {descriptionToolbarButtons.map((button) => (
            <button
              key={button.action}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleDescriptionToolbarAction(button.action)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803]"
              aria-label={button.ariaLabel}
            >
              {button.label}
            </button>
          ))}
        </div>
        <textarea
          ref={descriptionRef}
          id={`${formId}-description`}
          rows={6}
          name="description"
          value={values.description}
          onChange={handleChange}
          onSelect={cacheDescriptionSelection}
          onClick={cacheDescriptionSelection}
          onKeyUp={cacheDescriptionSelection}
          onBlur={cacheDescriptionSelection}
          required
          aria-required="true"
          aria-describedby={`${formId}-description-help`}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C27803] focus:ring-2 focus:ring-[#C27803]/20 outline-none transition-colors text-gray-800 text-sm leading-relaxed"
          placeholder={`## About the Role\nWe're looking for a **Senior Engineer** to join our team.\n\nResponsibilities:\n- Own the end-to-end design process\n- Collaborate with product and engineering\n\nApply: [Application Form](https://yourcompany.com/apply)`}
        />
        <div id={`${formId}-description-help`} className="mt-2 text-xs text-gray-600 space-y-2">
          <p className="font-medium text-gray-700">Markdown formatting supported:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
            <div>
              <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">**Bold text**</code> → <strong>Bold text</strong>
            </div>
            <div>
              <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">[Apply here](url)</code> → clickable link
            </div>
            <div>
              <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">- List item</code> → bullet point
            </div>
            <div>
              <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">## Heading</code> → section heading
            </div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-orange-900 hover:text-orange-900 font-medium">
              Show full example
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="text-gray-500 text-xs mb-2">Input:</div>
              <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap">
{`## About the Role
We're hiring a **Senior Developer**.

Responsibilities:
- Lead technical projects
- Mentor junior developers

[Apply Now](https://company.com/apply)`}
              </pre>
              <div className="text-gray-500 text-xs mb-2">How candidates see it:</div>
              <div className="text-sm bg-white p-3 rounded border border-gray-200">
                <h2 className="text-base font-bold mb-2">About the Role</h2>
                <p className="mb-2">We&apos;re hiring a <strong>Senior Developer</strong>.</p>
                <p className="mb-1">Responsibilities:</p>
                <ul className="list-disc list-inside mb-2">
                  <li>Lead technical projects</li>
                  <li>Mentor junior developers</li>
                </ul>
                <a href="https://company.com/apply" target="_blank" rel="noopener noreferrer" className="text-orange-900 underline hover:text-orange-900">
                  Apply Now
                </a>
              </div>
            </div>
          </details>
        </div>
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
              aria-describedby={`${formId}-skills-hint`}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C27803] focus:ring-2 focus:ring-[#C27803]/20 outline-none transition-colors text-gray-800"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 bg-orange-800 hover:bg-orange-900 text-white font-medium rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {(values.skills || []).length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Added skills"
            >
              {(values.skills || []).map((skill) => (
                <span
                  key={skill}
                  role="listitem"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-blue-900"
                    aria-label={`Remove ${skill} from required skills`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
          <p id={`${formId}-skills-hint`} className="text-xs text-gray-500">
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
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#C27803] focus:ring-2 focus:ring-[#C27803]/20 outline-none transition-colors text-gray-800"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-900 hover:bg-orange-950 text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
