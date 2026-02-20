"use client";

import { Check } from "lucide-react";
import { ACCESSIBILITY_CATEGORIES } from "@/lib/constants/accessibilityNeeds";
import type { RefObject, FormEvent } from "react";

type AccessibilityCategoriesProps = {
  mainHeadingRef: RefObject<HTMLHeadingElement | null>;
  selectedCategories: string[];
  toggleCategory: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function AccessibilityCategories({
  mainHeadingRef,
  selectedCategories,
  toggleCategory,
  onBack,
  onNext,
}: AccessibilityCategoriesProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
      <h1
        id="categories-heading"
        ref={mainHeadingRef}
        tabIndex={-1}
        className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl focus:outline-none"
      >
        Disability categories (Optional)
      </h1>

      <p id="categories-description" className="mb-8 text-sm font-medium text-slate-700">
        Select all that apply, or choose &quot;Prefer not to disclose.&quot;
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">Disability categories (select all that apply)</legend>
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            role="group"
            aria-describedby="categories-description"
          >
            {ACCESSIBILITY_CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-pressed={isSelected}
                  aria-label={`${category.title}. ${category.description || ""}`}
                  className={`relative flex min-h-[160px] flex-col items-start justify-between rounded-xl p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 ${
                    isSelected
                      ? "bg-[#E6F4EA] ring-2 ring-[#34A853]"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex w-full items-start justify-between">
                    <span className="text-lg font-bold text-slate-900">{category.title}</span>
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        isSelected ? "bg-[#34A853] text-white" : "bg-slate-200"
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                  {category.description && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {category.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <nav className="mt-8 flex items-center justify-between" aria-label="Form navigation">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-label="Go back to introduction"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
            aria-label="Continue to accommodation preferences"
          >
            Next
          </button>
        </nav>
      </form>
    </div>
  );
}
