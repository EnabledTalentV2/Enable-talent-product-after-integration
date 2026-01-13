"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useUserDataStore } from "@/lib/userDataStore";
import Navbar from "@/components/signup/Navbar";

const categories = [
  {
    id: "physical",
    title: "Physical Disability",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "sensory",
    title: "Sensory Disability",
    description: "Includes vision and hearing impairments",
  },
  {
    id: "neurodevelopmental",
    title: "Neurodevelopmental",
    description: "Includes ADHD, autism spectrum, and learning disabilities",
  },
  {
    id: "mental_health",
    title: "Mental Health",
    description:
      "Includes anxiety, depression, and other mental health conditions",
  },
  {
    id: "intellectual",
    title: "Intellectual Disability",
    description: "Includes developmental and cognitive disabilities",
  },
  {
    id: "acquired",
    title: "Acquired Disability",
    description:
      "Includes traumatic brain injury, stroke, and other acquired conditions",
  },
  {
    id: "chronic",
    title: "Chronic Health Condition",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "other",
    title: "Other Disability",
    description: "Any disability not covered in the categories above",
  },
  {
    id: "prefer_not_to_disclose",
    title: "Prefer not to disclose",
    description: "",
  },
];

const accommodationOptions = [
  { id: "flexible_schedule", label: "Flexible schedule" },
  { id: "remote_work", label: "Remote work" },
  { id: "assistive_tech", label: "Assistive technology" },
  { id: "accessible_workspace", label: "Accessible workspace" },
  { id: "flexible_deadlines", label: "Flexible deadlines" },
  { id: "support_person", label: "Support person" },
  { id: "other", label: "Other" },
  { id: "non_needed", label: "Non needed" },
  { id: "prefer_discuss_later", label: "Prefer to discuss later" },
];

export default function AccessabilityNeedsPage() {
  const router = useRouter();
  const { userData, patchUserData } = useUserDataStore();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<
    "intro" | "categories" | "preferences" | "accommodations"
  >("intro");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    userData.accessibilityNeeds?.categories || []
  );
  const [accommodationNeed, setAccommodationNeed] = useState<string>(
    userData.accessibilityNeeds?.accommodationNeed || "yes"
  );
  const [disclosurePreference, setDisclosurePreference] = useState<string>(
    userData.accessibilityNeeds?.disclosurePreference || "during_application"
  );
  const [selectedAccommodations, setSelectedAccommodations] = useState<
    string[]
  >(userData.accessibilityNeeds?.accommodations || []);

  // Refs for focus management
  const mainHeadingRef = useRef<HTMLHeadingElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          console.log(
            "[Accessibility Needs] Session check failed with status:",
            response.status
          );
          const returnUrl = encodeURIComponent("/signup/accessability-needs");
          router.replace(`/login-talent?returnUrl=${returnUrl}`);
          return;
        }

        const userData = await response.json().catch(() => ({}));

        if (!active) return;

        // Verify user is authenticated
        if (!userData || !userData.email) {
          console.log("[Accessibility Needs] No user data found");
          const returnUrl = encodeURIComponent("/signup/accessability-needs");
          router.replace(`/login-talent?returnUrl=${returnUrl}`);
          return;
        }

        console.log("[Accessibility Needs] User authenticated:", userData.email);
        setLoading(false);
      } catch (err) {
        console.error("[Accessibility Needs] Session check error:", err);
        const returnUrl = encodeURIComponent("/signup/accessability-needs");
        router.replace(`/login-talent?returnUrl=${returnUrl}`);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  // Announce step changes to screen readers
  useEffect(() => {
    if (mainHeadingRef.current) {
      mainHeadingRef.current.focus();
    }

    // Announce step to screen readers
    const stepMessages: Record<typeof step, string> = {
      intro: "Step 1 of 4: Introduction to voluntary self-identification",
      categories: "Step 2 of 4: Select disability categories that apply",
      preferences: "Step 3 of 4: Accommodation needs and disclosure preferences",
      accommodations: "Step 4 of 4: Select workplace accommodations"
    };

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = stepMessages[step];
    }
  }, [step]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAccommodation = (id: string) => {
    setSelectedAccommodations((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Save accessibility data and navigate to manual resume fill
  const handleCompleteProfile = () => {
    // Save to user data store (persisted in localStorage)
    patchUserData({
      accessibilityNeeds: {
        categories: selectedCategories,
        accommodationNeed: accommodationNeed,
        disclosurePreference: disclosurePreference,
        accommodations: selectedAccommodations,
      },
    });

    // Navigate to manual resume fill
    router.push("/signup/manual-resume-fill");
  };

  // Show loading state during authentication check
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
        {/* Navbar */}
        <Navbar />

        {/* Screen reader announcements */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Main */}
        <main
          className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
          role="main"
          aria-labelledby="intro-heading"
        >
          <div className="w-full max-w-4xl rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
            <h1
              id="intro-heading"
              ref={mainHeadingRef}
              tabIndex={-1}
              className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl focus:outline-none"
            >
              Voluntary Self-Identification
            </h1>

            <p className="mt-3 text-lg text-slate-500">
              This information helps employers support diversity and inclusion
              initiatives
            </p>

            <p className="mt-16 text-lg font-bold text-slate-900" role="note">
              All information provided will be kept confidential
            </p>

            <button
              onClick={() => setStep("categories")}
              className="mt-8 rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
              aria-label="Begin voluntary self-identification form"
            >
              Create Now
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === "categories") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
        {/* Navbar */}
        <Navbar />

        {/* Screen reader announcements */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Main */}
        <main
          className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
          role="main"
          aria-labelledby="categories-heading"
        >
          <div className="w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
          <h1
            id="categories-heading"
            ref={mainHeadingRef}
            tabIndex={-1}
            className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl focus:outline-none"
          >
            Please select any categories that apply to you:
          </h1>

          <p id="categories-description" className="mb-8 text-sm font-medium text-slate-700">
            Important Note: You may select multiple categories that apply to you.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); setStep("preferences"); }}>
            <fieldset>
              <legend className="sr-only">Disability categories (select all that apply)</legend>
              <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                role="group"
                aria-describedby="categories-description"
              >
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      aria-pressed={isSelected}
                      aria-label={`${category.title}. ${category.description || ''}`}
                      className={`relative flex min-h-[160px] flex-col items-start justify-between rounded-xl p-6 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2 ${
                        isSelected
                          ? "bg-[#E6F4EA] ring-2 ring-[#34A853]"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex w-full items-start justify-between">
                        <span className="text-lg font-bold text-slate-900">
                          {category.title}
                        </span>
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
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
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
                onClick={() => setStep("intro")}
                className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
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
        </main>
      </div>
    );
  }

  if (step === "preferences") {
    return (
      <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
        {/* Navbar */}
        <Navbar />

        {/* Screen reader announcements */}
        <div
          ref={liveRegionRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Main */}
        <main
          className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
          role="main"
          aria-labelledby="preferences-heading"
        >
          <div className="w-full max-w-4xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
          <h1
            id="preferences-heading"
            ref={mainHeadingRef}
            tabIndex={-1}
            className="mb-8 text-xl font-bold text-slate-900 md:text-2xl focus:outline-none"
          >
            Accommodation Preferences
          </h1>

          <form onSubmit={(e) => { e.preventDefault(); setStep("accommodations"); }}>
            <div className="space-y-8">
              {/* Accommodation Needs Section */}
              <fieldset>
                <legend className="text-lg font-bold text-slate-900 md:text-xl">
                  Accommodation Needs
                </legend>
                <p id="accommodation-needs-desc" className="mt-2 text-base text-slate-600">
                  Do you require any accommodations for the application or interview
                  process?
                </p>

                <div
                  role="radiogroup"
                  aria-labelledby="accommodation-needs-desc"
                  className="mt-6 flex flex-col space-y-4 md:flex-row md:space-x-8 md:space-y-0"
                >
                  {[
                    { id: "yes", label: "Yes" },
                    { id: "no", label: "No" },
                    { id: "discuss_later", label: "Prefer to discuss later" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center space-x-3"
                    >
                      <input
                        type="radio"
                        name="accommodation-need"
                        value={option.id}
                        checked={accommodationNeed === option.id}
                        onChange={() => setAccommodationNeed(option.id)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                          accommodationNeed === option.id
                            ? "bg-[#C78539]"
                            : "border border-slate-300 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {accommodationNeed === option.id && (
                          <Check size={16} className="text-white" strokeWidth={3} />
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
                  When would you prefer to discuss your specific accommodation
                  needs?
                </p>

                <div
                  role="radiogroup"
                  aria-labelledby="disclosure-pref-desc"
                  className="mt-6 space-y-4"
                >
                  {[
                    { id: "during_application", label: "During Application" },
                    { id: "during_interview", label: "During Interview" },
                    { id: "after_offer", label: "After job offer" },
                    { id: "after_start", label: "After starting work" },
                    { id: "not_applicable", label: "Not applicable" },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center space-x-3"
                    >
                      <input
                        type="radio"
                        name="disclosure-preference"
                        value={option.id}
                        checked={disclosurePreference === option.id}
                        onChange={() => setDisclosurePreference(option.id)}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                          disclosurePreference === option.id
                            ? "bg-[#C78539]"
                            : "border border-slate-300 bg-white"
                        }`}
                        aria-hidden="true"
                      >
                        {disclosurePreference === option.id && (
                          <Check size={16} className="text-white" strokeWidth={3} />
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
                onClick={() => setStep("categories")}
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
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
      {/* Navbar */}
      <Navbar />

      {/* Screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Main */}
      <main
        className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
        role="main"
        aria-labelledby="accommodations-heading"
      >
        <div className="w-full max-w-6xl rounded-[28px] bg-white p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
        <h1
          id="accommodations-heading"
          ref={mainHeadingRef}
          tabIndex={-1}
          className="mb-2 text-xl font-bold text-slate-900 md:text-2xl focus:outline-none"
        >
          Which of the following workplace accommodations would help you perform
          at your best?
        </h1>

        <p id="accommodations-description" className="mb-8 text-base text-slate-600">
          Select all that apply. You can select multiple options or indicate if none are needed.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleCompleteProfile(); }}>
          <fieldset>
            <legend className="sr-only">Workplace accommodations (select all that apply)</legend>
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              role="group"
              aria-describedby="accommodations-description"
            >
              {accommodationOptions.map((option) => {
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
                    <span className="font-semibold text-slate-700">
                      {option.label}
                    </span>
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

          <nav className="mt-12 flex items-center justify-between" aria-label="Form navigation">
            <button
              type="button"
              onClick={() => setStep("preferences")}
              className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              aria-label="Go back to accommodation preferences"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
              aria-label="Complete accessibility profile and continue to resume upload"
            >
              Create Profile
            </button>
          </nav>
        </form>
        </div>
      </main>
    </div>
  );
}
