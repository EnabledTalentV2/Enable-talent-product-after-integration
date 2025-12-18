'use client';

import { AlertCircle } from "lucide-react";
import InputBlock from "./InputBlock";
import type { UserData } from "../types";

type Props = {
  data: UserData["education"];
  onChange: (patch: Partial<UserData["education"]>) => void;
  errors?: Partial<Record<keyof UserData["education"], string>>;
};

export default function Education({ data, onChange, errors }: Props) {
  const hasCourseError = Boolean(errors?.courseName);
  const errorCount = Object.keys(errors || {}).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Education</h3>
        {errorCount > 0 ? (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">{String(errorCount).padStart(2, "0")} error</span>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className={`block text-sm font-medium ${hasCourseError ? "text-red-600" : "text-slate-700"}`}>
          {errors?.courseName || "Course Name"}
        </label>
        <div
          className={`flex items-center rounded-lg border px-3 py-2.5 text-sm shadow-sm ${
            hasCourseError ? "border-red-400 text-slate-700" : "border-gray-200 text-slate-800"
          }`}
        >
          <input
            id="education-courseName"
            type="text"
            value={data.courseName}
            onChange={(e) => onChange({ courseName: e.target.value })}
            placeholder=""
            className="w-full bg-transparent outline-none"
          />
          {hasCourseError ? <AlertCircle className="h-5 w-5 text-red-500" /> : null}
        </div>
        {errors?.courseName ? <p className="text-xs text-red-600">{errors.courseName}</p> : null}
      </div>

      <InputBlock
        id="education-major"
        label="Major"
        value={data.major}
        onChange={(v) => onChange({ major: v })}
        placeholder="Design methodologies, Aesthetics, Visual communication, Technical specification..."
        error={Boolean(errors?.major)}
        errorMessage={errors?.major}
      />

      <InputBlock
        id="education-institution"
        label="Institution"
        value={data.institution}
        onChange={(v) => onChange({ institution: v })}
        placeholder="York University"
        error={Boolean(errors?.institution)}
        errorMessage={errors?.institution}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Graduation Date</label>
        <div className="relative">
          <input
            type="date"
            value={data.graduationDate}
            onChange={(e) => onChange({ graduationDate: e.target.value })}
            placeholder="Enter graduation date"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
}
