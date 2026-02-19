"use client";

import Navbar from "@/components/signup/Navbar";
import { useAccessibilityNeeds } from "@/lib/hooks/useAccessibilityNeeds";
import AccessibilityIntro from "@/components/signup/accessibility/AccessibilityIntro";
import AccessibilityCategories from "@/components/signup/accessibility/AccessibilityCategories";
import AccessibilityPreferences from "@/components/signup/accessibility/AccessibilityPreferences";
import AccessibilityAccommodations from "@/components/signup/accessibility/AccessibilityAccommodations";

export default function AccessabilityNeedsPage() {
  const {
    loading,
    liveRegionRef,
    step,
    mainHeadingRef,
    setStep,
    selectedCategories,
    toggleCategory,
    accommodationNeed,
    disclosurePreference,
    setAccommodationNeed,
    setDisclosurePreference,
    selectedAccommodations,
    toggleAccommodation,
    isCompleting,
    isParsingResume,
    parseFailure,
    parseFailureReason,
    handleCompleteProfile,
    handleRetryParsing,
    handleContinueWithoutParsing,
  } = useAccessibilityNeeds();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F5FA]">
        <div className="text-slate-500">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F0F5FA] text-slate-900">
      <Navbar />

      {/* Screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <main
        className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
        role="main"
        aria-labelledby={`${step}-heading`}
      >
        {step === "intro" && (
          <AccessibilityIntro
            mainHeadingRef={mainHeadingRef}
            onContinue={() => setStep("categories")}
          />
        )}

        {step === "categories" && (
          <AccessibilityCategories
            mainHeadingRef={mainHeadingRef}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onBack={() => setStep("intro")}
            onNext={() => setStep("preferences")}
          />
        )}

        {step === "preferences" && (
          <AccessibilityPreferences
            mainHeadingRef={mainHeadingRef}
            accommodationNeed={accommodationNeed}
            disclosurePreference={disclosurePreference}
            setAccommodationNeed={setAccommodationNeed}
            setDisclosurePreference={setDisclosurePreference}
            onBack={() => setStep("categories")}
            onNext={() => setStep("accommodations")}
          />
        )}

        {step === "accommodations" && (
          <AccessibilityAccommodations
            mainHeadingRef={mainHeadingRef}
            selectedAccommodations={selectedAccommodations}
            toggleAccommodation={toggleAccommodation}
            isCompleting={isCompleting}
            isParsingResume={isParsingResume}
            parseFailure={parseFailure}
            parseFailureReason={parseFailureReason}
            onBack={() => setStep("preferences")}
            onSubmit={handleCompleteProfile}
            onRetryParsing={handleRetryParsing}
            onContinueWithoutParsing={handleContinueWithoutParsing}
          />
        )}
      </main>
    </div>
  );
}
