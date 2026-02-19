"use client";

import { Check } from "lucide-react";
import { ACCOMMODATION_OPTIONS } from "@/lib/constants/accessibilityNeeds";
import type { RefObject, FormEvent } from "react";
import type { ParseFailureReason } from "@/lib/helpers/resumeParser";

type AccessibilityAccommodationsProps = {
  mainHeadingRef: RefObject<HTMLHeadingElement | null>;
  selectedAccommodations: string[];
  toggleAccommodation: (id: string) => void;
  isCompleting: boolean;
  isParsingResume: boolean;
  parseFailure: string | null;
  parseFailureReason: ParseFailureReason;
  onBack: () => void;
  onSubmit: () => void;
  onRetryParsing: () => void;
  onContinueWithoutParsing: () => void;
};

export default function AccessibilityAccommodations({
  mainHeadingRef,
  selectedAccommodations,
  toggleAccommodation,
  isCompleting,
  isParsingResume,
  parseFailure,
  parseFailureReason,
  onBack,
  onSubmit,
  onRetryParsing,
  onContinueWithoutParsing,
}: AccessibilityAccommodationsProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
      <h1
        id="accommodations-heading"
        ref={mainHeadingRef}
        tabIndex={-1}
        className="mb-2 text-xl font-bold text-slate-900 md:text-2xl focus:outline-none"
      >
        Workplace accommodations (Optional)
      </h1>

      <p id="accommodations-description" className="mb-8 text-base text-slate-600">
        Select all that apply. You can choose &quot;None needed&quot; or &quot;Prefer to discuss later.&quot;
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">Workplace accommodations (select all that apply)</legend>
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            role="group"
            aria-describedby="accommodations-description"
          >
            {ACCOMMODATION_OPTIONS.map((option) => {
              const isSelected = selectedAccommodations.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleAccommodation(option.id)}
                  aria-pressed={isSelected}
                  aria-label={option.label}
                  className={`relative flex items-center justify-between rounded-xl p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 ${
                    isSelected
                      ? "bg-[#E6F4EA] ring-1 ring-[#34A853]"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="font-semibold text-slate-700">{option.label}</span>
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                      isSelected ? "bg-[#34A853] text-white" : "bg-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {isParsingResume ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
          >
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5 animate-spin text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div>
                <p className="font-semibold">Parsing your resume...</p>
                <p className="mt-0.5 text-blue-700">This may take up to 30 seconds. Please wait.</p>
              </div>
            </div>
          </div>
        ) : null}

        {parseFailure && !isParsingResume ? (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
          >
            <p className="font-semibold text-amber-800">
              {parseFailureReason === "timeout"
                ? "Resume parsing timed out"
                : parseFailureReason === "no_data"
                  ? "Could not extract data from resume"
                  : "Resume parsing failed"}
            </p>
            <p className="mt-1 text-amber-700">{parseFailure}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
              {parseFailureReason === "timeout" ? (
                <button
                  type="button"
                  onClick={onRetryParsing}
                  disabled={isCompleting}
                  className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                >
                  Retry Parsing
                </button>
              ) : null}
              <button
                type="button"
                onClick={onContinueWithoutParsing}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  parseFailureReason === "timeout"
                    ? "border border-amber-300 bg-white text-amber-700 hover:bg-amber-50"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                Continue to Manual Entry
              </button>
            </div>
          </div>
        ) : null}

        <nav className="mt-12 flex items-center justify-between" aria-label="Form navigation">
          <button
            type="button"
            onClick={onBack}
            disabled={isCompleting}
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-label="Go back to accommodation preferences"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isCompleting}
            className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Complete accessibility profile and continue to resume details"
          >
            {isCompleting ? "Processing..." : "Create Profile"}
          </button>
        </nav>
      </form>
    </div>
  );
}
