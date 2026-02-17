"use client";

import Navbar from "@/components/signup/Navbar";
import { useAccessibilityNeeds } from "@/lib/hooks/useAccessibilityNeeds";
import AccessibilityIntro from "@/components/signup/accessibility/AccessibilityIntro";
import AccessibilityCategories from "@/components/signup/accessibility/AccessibilityCategories";
import AccessibilityPreferences from "@/components/signup/accessibility/AccessibilityPreferences";
import AccessibilityAccommodations from "@/components/signup/accessibility/AccessibilityAccommodations";

export default function AccessabilityNeedsPage() {
  const accessibility = useAccessibilityNeeds();

  if (accessibility.loading) {
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
        ref={accessibility.liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <main
        className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 md:px-12"
        role="main"
        aria-labelledby={`${accessibility.step}-heading`}
      >
        {accessibility.step === "intro" && (
          <AccessibilityIntro
            mainHeadingRef={accessibility.mainHeadingRef}
            onContinue={() => accessibility.setStep("categories")}
          />
        )}

        {accessibility.step === "categories" && (
          <AccessibilityCategories
            mainHeadingRef={accessibility.mainHeadingRef}
            selectedCategories={accessibility.selectedCategories}
            toggleCategory={accessibility.toggleCategory}
            onBack={() => accessibility.setStep("intro")}
            onNext={() => accessibility.setStep("preferences")}
          />
        )}

        {accessibility.step === "preferences" && (
          <AccessibilityPreferences
            mainHeadingRef={accessibility.mainHeadingRef}
            accommodationNeed={accessibility.accommodationNeed}
            disclosurePreference={accessibility.disclosurePreference}
            setAccommodationNeed={accessibility.setAccommodationNeed}
            setDisclosurePreference={accessibility.setDisclosurePreference}
            onBack={() => accessibility.setStep("categories")}
            onNext={() => accessibility.setStep("accommodations")}
          />
        )}

        {accessibility.step === "accommodations" && (
          <AccessibilityAccommodations
            mainHeadingRef={accessibility.mainHeadingRef}
            selectedAccommodations={accessibility.selectedAccommodations}
            toggleAccommodation={accessibility.toggleAccommodation}
            isCompleting={accessibility.isCompleting}
            isParsingResume={accessibility.isParsingResume}
            parseFailure={accessibility.parseFailure}
            parseFailureReason={accessibility.parseFailureReason}
            onBack={() => accessibility.setStep("preferences")}
            onSubmit={accessibility.handleCompleteProfile}
            onRetryParsing={accessibility.handleRetryParsing}
            onContinueWithoutParsing={accessibility.handleContinueWithoutParsing}
          />
        )}
      </main>
    </div>
  );
}
