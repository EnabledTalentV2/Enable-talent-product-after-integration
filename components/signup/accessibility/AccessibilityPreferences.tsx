"use client";

import {
  ACCOMMODATION_NEED_OPTIONS,
  DISCLOSURE_PREFERENCE_OPTIONS,
} from "@/lib/constants/accessibilityNeeds";
import type { RefObject, FormEvent } from "react";

type AccessibilityPreferencesProps = {
  mainHeadingRef: RefObject<HTMLHeadingElement | null>;
  accommodationNeed: string;
  disclosurePreference: string;
  setAccommodationNeed: (value: string) => void;
  setDisclosurePreference: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function AccessibilityPreferences({
  mainHeadingRef,
  accommodationNeed,
  disclosurePreference,
  setAccommodationNeed,
  setDisclosurePreference,
  onBack,
  onNext,
}: AccessibilityPreferencesProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="w-full max-w-4xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
      <h1
        id="preferences-heading"
        ref={mainHeadingRef}
        tabIndex={-1}
        className="mb-8 text-xl font-bold text-slate-900 md:text-2xl focus:outline-none"
      >
        Accommodation Preferences
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Accommodation Needs Section */}
          <fieldset>
            <legend className="text-lg font-bold text-slate-900 md:text-xl">
              Accommodation Needs
            </legend>
            <p id="accommodation-needs-desc" className="mt-2 text-base text-slate-600">
              Do you need accommodations for the application or interview process?
            </p>

            <div
              role="radiogroup"
              aria-labelledby="accommodation-needs-desc"
              className="mt-6 flex flex-col space-y-4 md:flex-row md:space-x-8 md:space-y-0"
            >
              {ACCOMMODATION_NEED_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="radio"
                    name="accommodation-need"
                    value={option.id}
                    checked={accommodationNeed === option.id}
                    onChange={() => setAccommodationNeed(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      accommodationNeed === option.id
                        ? "border-[#C78539] bg-[#C78539]"
                        : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {accommodationNeed === option.id && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="h-px bg-slate-200" role="separator" aria-hidden="true"></div>

          {/* Disclosure Preferences Section */}
          <fieldset>
            <legend className="text-lg font-bold text-slate-900 md:text-xl">
              Disclosure Preferences
            </legend>
            <p id="disclosure-pref-desc" className="mt-2 text-base text-slate-600">
              When would you like to discuss your accommodation needs? You control the timing, and
              we&apos;ll respect your preference.
            </p>

            <div
              role="radiogroup"
              aria-labelledby="disclosure-pref-desc"
              className="mt-6 space-y-4"
            >
              {DISCLOSURE_PREFERENCE_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center space-x-3">
                  <input
                    type="radio"
                    name="disclosure-preference"
                    value={option.id}
                    checked={disclosurePreference === option.id}
                    onChange={() => setDisclosurePreference(option.id)}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      disclosurePreference === option.id
                        ? "border-[#C78539] bg-[#C78539]"
                        : "border-slate-300 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {disclosurePreference === option.id && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-slate-700 font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <nav className="mt-12 flex items-center justify-between" aria-label="Form navigation">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-label="Go back to disability categories"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
            aria-label="Continue to workplace accommodations"
          >
            Next
          </button>
        </nav>
      </form>
    </div>
  );
}
