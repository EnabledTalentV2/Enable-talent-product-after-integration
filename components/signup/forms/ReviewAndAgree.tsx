'use client';

import type { UserData } from "../types";
import SimpleText from "./SimpleText";

type Props = {
  data: UserData["reviewAgree"];
  onChange: (patch: Partial<UserData["reviewAgree"]>) => void;
};

export default function ReviewAndAgree({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
        <input
          type="checkbox"
          checked={data.agree}
          onChange={(e) => onChange({ agree: e.target.checked })}
          className="w-5 h-5 accent-orange-600 border-gray-300"
        />
        <span className="font-medium">I confirm the above information is accurate.</span>
      </label>
      <SimpleText
        title="Notes"
        placeholder="Add any final comments..."
        value={data.notes}
        onChange={(value) => onChange({ notes: value })}
      />
    </div>
  );
}
