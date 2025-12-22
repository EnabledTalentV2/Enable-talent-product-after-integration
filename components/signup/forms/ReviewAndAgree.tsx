'use client';

import type { UserData } from "../types";

type Props = {
  data: UserData["reviewAgree"];
  onChange: (patch: Partial<UserData["reviewAgree"]>) => void;
};

export default function ReviewAndAgree({ data, onChange }: Props) {
  const selectClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500";
  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500";

  const discoverOptions = ["LinkedIn", "Referral", "Job board", "University/College", "Career fair", "Other"];

  return (
    <div className="space-y-6 text-slate-800">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">How did you discover the Enabled Talent platform?</label>
        <select
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
        <label className="block text-sm font-semibold text-slate-800">Comments</label>
        <textarea
          rows={3}
          value={data.comments}
          onChange={(e) => onChange({ comments: e.target.value })}
          placeholder="Please leave any additional comments or feedback"
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Terms And Conditions</p>
        <ul className="space-y-3 text-sm text-slate-700 list-disc pl-5">
          <li>
            Allow EnabledTalent to share your resume, pitch yourself and behaviour question video with third parties (ex. prospective employers) to
            consider you for an internship.
          </li>
          <li>
            The EnabledTalent program has the right to remove you from the program if you decline more than three interview requests without
            appropriate justification
          </li>
          <li>
            The EnabledTalent has the right to remove you from the program if you decline more than two internship offers without appropriate
            justification
          </li>
          <li>
            I have read and understand the information provided to me in this Notice of Collection pertaining to the University&apos;s collection, use,
            and disclosure of personal information. Toronto Metropolitan University (&quot;the University&quot;) collects personal information under the
            authority of the Toronto Metropolitan University Act, 1977 for the purposes of program registration, and related purposes as outlined in the
            Toronto Metropolitan University Notice of Collection. The University will collect, use, disclose, and protect your personal information in
            accordance with the Freedom of Information and Protection of Privacy Act, external link.
          </li>
        </ul>
      </div>

      <p className="text-sm text-slate-600">
        By ticking the checkboxes below, you confirm that you have read, understood and agreed with the statement.
      </p>
      <p className="text-sm text-slate-500">
        If you have questions about the collection, use and disclosure of this information by the University, please contact Mohammad Adnan Syed, 350
        Victoria Street, Toronto, M5B 2K3, admin@talent-accelerator.com
      </p>

      <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
        <input
          type="checkbox"
          checked={data.agree}
          onChange={(e) => onChange({ agree: e.target.checked })}
          className="w-5 h-5 accent-orange-600 border-gray-300"
        />
        <span className="text-sm">I confirm that I have read, understood and agreed with the statement.</span>
      </label>
    </div>
  );
}
