"use client";

import { AlertCircle, Plus, Trash2 } from "lucide-react";
import type { UserData } from "@/lib/types/user";

type LanguageEntry = UserData["otherDetails"]["languages"][number];

type Errors = {
  languages?: Record<number, Partial<Record<keyof LanguageEntry, string>>>;
  careerStage?: string;
  availability?: string;
  desiredSalary?: string;
};

type Props = {
  data: UserData["otherDetails"];
  errors?: Errors;
  hideCareerStage?: boolean;
  onChange: (
    patch: Partial<
      Pick<
        UserData["otherDetails"],
        "careerStage" | "availability" | "desiredSalary"
      >
    >
  ) => void;
  onLanguageChange: (index: number, patch: Partial<LanguageEntry>) => void;
  onAddLanguage: () => void;
  onRemoveLanguage?: (index: number) => void;
};

export default function OtherDetails({
  data,
  errors,
  hideCareerStage = false,
  onChange,
  onLanguageChange,
  onAddLanguage,
  onRemoveLanguage,
}: Props) {
  const selectClass = (hasError?: boolean) =>
    `w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
        : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
    }`;

  const errorCount =
    (hideCareerStage ? 0 : errors?.careerStage ? 1 : 0) +
    (errors?.availability ? 1 : 0) +
    (errors?.desiredSalary ? 1 : 0) +
    (errors?.languages
      ? Object.values(errors.languages).reduce(
          (acc, val) => acc + (val ? Object.keys(val).length : 0),
          0
        )
      : 0);

  const careerStageOptions = [
    "Student",
    "Early career professional (<2 years)",
    "Mid career professional (<10 years)",
    "Senior professional (10+ years)",
  ];

  const languageOptions = [
    "English",
    "French",
    "Spanish",
    "Hindi",
    "Arabic",
    "Mandarin",
    "Punjabi",
    "Other",
  ];
  const proficiencyOptions = ["Basic", "Intermediate", "Proficient", "Fluent"];

  const availabilityOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  const desiredSalaryOptions = [
    "< 40000",
    "40000-60000",
    "60000-80000",
    "80000-90000",
    "90000-120000",
    "120000+",
  ];

  const availabilityError = errors?.availability;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Other details</h3>
        {errorCount > 0 ? (
          <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {String(errorCount).padStart(2, "0")} error
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        {data.languages.map((entry, idx) => {
          const entryErrors = errors?.languages?.[idx] || {};
          return (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor={`otherDetails-lang-${idx}-language`}
                  className={`block text-base font-medium ${
                    entryErrors.language ? "text-red-600" : "text-slate-700"
                  }`}
                >
                  Language
                  <span aria-hidden="true" className="text-red-600">
                    {" "}
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </label>
                <select
                  id={`otherDetails-lang-${idx}-language`}
                  value={entry.language}
                  onChange={(e) =>
                    onLanguageChange(idx, { language: e.target.value })
                  }
                  aria-required="true"
                  className={selectClass(Boolean(entryErrors.language))}
                >
                  <option value="">Select</option>
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {entryErrors.language ? (
                  <p className="text-sm text-red-600">{entryErrors.language}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`otherDetails-lang-${idx}-speaking`}
                  className={`block text-base font-medium ${
                    entryErrors.speaking ? "text-red-600" : "text-slate-700"
                  }`}
                >
                  Speaking
                  <span aria-hidden="true" className="text-red-600">
                    {" "}
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </label>
                <select
                  id={`otherDetails-lang-${idx}-speaking`}
                  value={entry.speaking}
                  onChange={(e) =>
                    onLanguageChange(idx, { speaking: e.target.value })
                  }
                  aria-required="true"
                  className={selectClass(Boolean(entryErrors.speaking))}
                >
                  <option value="">Select</option>
                  {proficiencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {entryErrors.speaking ? (
                  <p className="text-sm text-red-600">{entryErrors.speaking}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`otherDetails-lang-${idx}-reading`}
                  className={`block text-base font-medium ${
                    entryErrors.reading ? "text-red-600" : "text-slate-700"
                  }`}
                >
                  Reading
                  <span aria-hidden="true" className="text-red-600">
                    {" "}
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </label>
                <select
                  id={`otherDetails-lang-${idx}-reading`}
                  value={entry.reading}
                  onChange={(e) =>
                    onLanguageChange(idx, { reading: e.target.value })
                  }
                  aria-required="true"
                  className={selectClass(Boolean(entryErrors.reading))}
                >
                  <option value="">Select</option>
                  {proficiencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {entryErrors.reading ? (
                  <p className="text-sm text-red-600">{entryErrors.reading}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`otherDetails-lang-${idx}-writing`}
                    className={`block text-base font-medium ${
                      entryErrors.writing ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    Writing
                    <span aria-hidden="true" className="text-red-600">
                      {" "}
                      *
                    </span>
                    <span className="sr-only"> (required)</span>
                  </label>
                  {onRemoveLanguage && data.languages.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => onRemoveLanguage(idx)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
                <select
                  id={`otherDetails-lang-${idx}-writing`}
                  value={entry.writing}
                  onChange={(e) =>
                    onLanguageChange(idx, { writing: e.target.value })
                  }
                  aria-required="true"
                  className={selectClass(Boolean(entryErrors.writing))}
                >
                  <option value="">Select</option>
                  {proficiencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {entryErrors.writing ? (
                  <p className="text-sm text-red-600">{entryErrors.writing}</p>
                ) : null}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAddLanguage}
          className="inline-flex items-center gap-2 text-[#C27528] border border-[#C27528] px-4 py-2 rounded-lg font-medium text-base hover:bg-orange-50 transition-colors"
        >
          <Plus size={16} />
          Add another language
        </button>
      </div>

      {!hideCareerStage ? (
        <div className="space-y-2">
          <label
            htmlFor="otherDetails-careerStage"
            className={`block text-base font-medium ${
              errors?.careerStage ? "text-red-600" : "text-slate-700"
            }`}
          >
            How would you identify your career stage (choose best option)
            <span aria-hidden="true" className="text-red-600">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </label>
          <select
            id="otherDetails-careerStage"
            value={data.careerStage}
            onChange={(e) => onChange({ careerStage: e.target.value })}
            aria-required="true"
            className={selectClass(Boolean(errors?.careerStage))}
          >
            <option value="">Select</option>
            {careerStageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors?.careerStage ? (
            <p className="text-sm text-red-600">{errors.careerStage}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="otherDetails-availability"
          className={`block text-base font-medium ${
            availabilityError ? "text-red-600" : "text-slate-700"
          }`}
        >
          {availabilityError ||
            "Are you available immediately for any full-time opportunities that may come from the Enabled Talent Access Service?"}
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <div className="relative">
          <select
            id="otherDetails-availability"
            value={(() => {
              const raw = data.availability.trim().toLowerCase();
              if (!raw) return "";
              if (raw === "yes" || raw === "no") return raw;
              if (raw.includes("immediately") || raw.includes("available now")) {
                return "yes";
              }
              return "no";
            })()}
            onChange={(e) => onChange({ availability: e.target.value })}
            aria-required="true"
            className={`${selectClass(Boolean(availabilityError))} pr-10`}
          >
            <option value="">Select</option>
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {availabilityError ? (
            <AlertCircle className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="otherDetails-desiredSalary"
          className={`block text-base font-medium ${
            errors?.desiredSalary ? "text-red-600" : "text-slate-700"
          }`}
        >
          Desired salary (CAD)
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <select
          id="otherDetails-desiredSalary"
          value={data.desiredSalary}
          onChange={(e) => onChange({ desiredSalary: e.target.value })}
          aria-required="true"
          className={selectClass(Boolean(errors?.desiredSalary))}
        >
          <option value="">Select</option>
          {desiredSalaryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors?.desiredSalary ? (
          <p className="text-sm text-red-600">{errors.desiredSalary}</p>
        ) : null}
      </div>
    </div>
  );
}

