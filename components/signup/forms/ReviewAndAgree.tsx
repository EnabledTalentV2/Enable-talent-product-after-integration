"use client";

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
          Terms And Conditions
        </p>
        <p className="text-base text-slate-700">
          I have read and understand the information provided to me in this
          Notice of Collection pertaining to Enabled Talent&apos;s collection, use,
          and disclosure of personal information. Enabled Talent collects
          personal information for the purposes of program registration, and
          related purposes as outlined in the Enabled Talent Notice of
          Collection. Enabled Talent will collect, use, disclose, and protect
          your personal information in accordance with the applicable privacy
          laws and regulations.
        </p>
      </div>

      <p className="text-base text-slate-700">
        By ticking the checkboxes below, you confirm that you have read,
        understood and agreed with the statement.
      </p>

      <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
        <input
          type="checkbox"
          checked={data.agree}
          onChange={(e) => onChange({ agree: e.target.checked })}
          aria-required="true"
          className="w-5 h-5 accent-orange-600 border-gray-300"
        />
        <span className="text-base">
          I confirm that I have read, understood and agreed with the statement.
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
