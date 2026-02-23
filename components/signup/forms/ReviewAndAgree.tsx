"use client";

import Link from "next/link";
import type { UserData } from "@/lib/types/user";

type Props = {
  data: UserData["reviewAgree"];
  onChange: (patch: Partial<UserData["reviewAgree"]>) => void;
};

export default function ReviewAndAgree({ data, onChange }: Props) {
  return (
    <div className="space-y-6 text-slate-800">
      <div className="space-y-3">
        <p className="text-base font-semibold text-slate-800">
          Privacy Notice &amp; Consent
        </p>
        <p className="text-base text-slate-700">
          Enabled Talent collects your personal information — including your
          profile, skills, and accessibility needs — to match you with inclusive
          employers and support your job search. Your data is handled in
          accordance with our{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-900 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-[#C27803] rounded"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-900 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-[#C27803] rounded"
          >
            Terms of Service
          </Link>
          .
        </p>
        <p className="text-base text-slate-700">
          Your information will not be shared with employers without your
          knowledge. You may withdraw consent at any time by contacting{" "}
          <strong>ENABLED HR LABS INC.</strong> at{" "}
          <a
            href="mailto:support@enabledtalent.com"
            className="underline text-orange-900 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-[#C27803] rounded"
          >
            support@enabledtalent.com
          </a>
          .
        </p>
      </div>

      <label className="flex items-start gap-3 text-slate-800 cursor-pointer">
        <input
          type="checkbox"
          checked={data.agree}
          onChange={(e) => onChange({ agree: e.target.checked })}
          aria-required="true"
          className="mt-1 w-5 h-5 accent-orange-600 border-gray-300 shrink-0"
        />
        <span className="text-base">
          I have read the{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-900 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-[#C27803] rounded"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-900 hover:text-orange-950 focus-visible:ring-2 focus-visible:ring-[#C27803] rounded"
          >
            Terms of Service
          </Link>
          , and I agree to Enabled Talent collecting and using my personal
          information as described.
          <span aria-hidden="true" className="text-red-800">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </span>
      </label>
    </div>
  );
}
