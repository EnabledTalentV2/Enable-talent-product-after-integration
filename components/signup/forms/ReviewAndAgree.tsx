"use client";

import type { UserData } from "@/lib/types/user";

type Props = {
  data: UserData["reviewAgree"];
  onChange: (patch: Partial<UserData["reviewAgree"]>) => void;
};

export default function ReviewAndAgree({ data, onChange }: Props) {
  const selectClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500";
  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500";

  const discoverOptions = [
    "LinkedIn",
    "Referral",
    "Job board",
    "University/College",
    "Career fair",
    "Other",
  ];

  return (
    <div className="space-y-6 text-slate-800">
      <div className="space-y-2">
        <label
          htmlFor="reviewAgree-discover"
          className="block text-base font-semibold text-slate-800"
        >
          How did you discover the Enabled Talent platform?
        </label>
        <select
          id="reviewAgree-discover"
          value={data.discover}
          onChange={(e) => onChange({ discover: e.target.value })}
          className={`${selectClass} pr-10`}
        >
          <option value="">Select an option</option>
          {discoverOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="reviewAgree-comments"
          className="block text-base font-semibold text-slate-800"
        >
          Comments
        </label>
        <textarea
          id="reviewAgree-comments"
          rows={3}
          value={data.comments}
          onChange={(e) => onChange({ comments: e.target.value })}
          placeholder="Please leave any additional comments or feedback"
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <p className="text-base font-semibold text-slate-800">
          Terms And Conditions
        </p>
        <ul className="space-y-3 text-base text-slate-700 list-disc pl-5">
          <li>
            Allow EnabledTalent to share your resume, pitch yourself and
            behaviour question video with third parties (ex. prospective
            employers) to consider you for an internship.
          </li>
          <li>
            The EnabledTalent program has the right to remove you from the
            program if you decline more than three interview requests without
            appropriate justification
          </li>
          <li>
            The EnabledTalent has the right to remove you from the program if
            you decline more than two internship offers without appropriate
            justification
          </li>
          <li>
            I have read and understand the information provided to me in this
            Notice of Collection pertaining to Enabled Talent&apos;s collection,
            use, and disclosure of personal information. Enabled Talent collects
            personal information for the purposes of program registration, and
            related purposes as outlined in the Enabled Talent Notice of
            Collection. Enabled Talent will collect, use, disclose, and protect
            your personal information in accordance with the applicable privacy
            laws and regulations.
          </li>
        </ul>
      </div>

      <p className="text-base text-slate-600">
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
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </span>
      </label>
    </div>
  );
}
