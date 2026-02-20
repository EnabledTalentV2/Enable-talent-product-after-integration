"use client";

import type { RefObject } from "react";

type AccessibilityIntroProps = {
  mainHeadingRef: RefObject<HTMLHeadingElement | null>;
  onContinue: () => void;
};

export default function AccessibilityIntro({
  mainHeadingRef,
  onContinue,
}: AccessibilityIntroProps) {
  return (
    <div className="w-full max-w-4xl rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] md:rounded-[32px] md:p-14">
      <h1
        id="intro-heading"
        ref={mainHeadingRef}
        tabIndex={-1}
        className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl focus:outline-none"
      >
        Accessibility & Accommodation Preferences (Optional)
      </h1>

      <p className="mt-3 text-lg text-slate-700">
        Sharing this information is entirely voluntary and will never affect eligibility.
      </p>
      <p className="mt-3 text-lg text-slate-700">
        If you choose to share, it helps us support you and communicate your needs when you decide.
      </p>

      <p className="mt-12 text-base text-slate-700" role="note">
        You can update these preferences anytime in your profile.
      </p>

      <button
        onClick={onContinue}
        className="mt-8 rounded-xl bg-[#C78539] px-12 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#b07430] focus:outline-none focus:ring-2 focus:ring-[#C78539] focus:ring-offset-2"
        aria-label="Continue to disability categories"
      >
        Continue
      </button>
    </div>
  );
}
