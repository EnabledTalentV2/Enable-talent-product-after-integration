'use client';

import { AlertCircle } from "lucide-react";
import InputBlock from "./InputBlock";
import type { UserData } from "@/lib/types/user";

type Props = {
  data: UserData["education"];
  onChange: (patch: Partial<UserData["education"]>) => void;
  errors?: Partial<Record<keyof UserData["education"], string>>;
  idPrefix?: string;
  title?: string;
  showHeading?: boolean;
};

export default function Education({
  data,
  onChange,
  errors,
  idPrefix = "education",
  title = "Education",
  showHeading = true,
}: Props) {
  const hasCourseError = Boolean(errors?.courseName);
  const errorCount = Object.keys(errors || {}).length;
  const graduationYearValue =
    typeof data.graduationDate === "string"
      ? data.graduationDate.match(/\d{4}/)?.[0] ?? ""
      : "";

  return (
    <div className="space-y-6">
      {showHeading ? (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {errorCount > 0 ? (
            <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">{String(errorCount).padStart(2, "0")} error</span>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-courseName`} className={`block text-base font-medium ${hasCourseError ? "text-red-600" : "text-slate-700"}`}>
          {errors?.courseName || "Course Name"}
          <span aria-hidden="true" className="text-red-600">
            {" "}
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>
        <div
          className={`flex items-center rounded-lg border px-3 py-2.5 text-base shadow-sm ${
            hasCourseError ? "border-red-400 text-slate-700" : "border-gray-200 text-slate-800"
          }`}
        >
          <input
            id={`${idPrefix}-courseName`}
            type="text"
            value={data.courseName}
            onChange={(e) => onChange({ courseName: e.target.value })}
            placeholder=""
            aria-required="true"
            className="w-full bg-transparent outline-none"
          />
          {hasCourseError ? <AlertCircle className="h-5 w-5 text-red-500" /> : null}
        </div>
        {errors?.courseName ? <p className="text-sm text-red-600">{errors.courseName}</p> : null}
      </div>

      <InputBlock
        id={`${idPrefix}-major`}
        label="Major"
        required
        value={data.major}
        onChange={(v) => onChange({ major: v })}
        placeholder="Design methodologies, Aesthetics, Visual communication, Technical specification..."
        error={Boolean(errors?.major)}
        errorMessage={errors?.major}
      />

      <InputBlock
        id={`${idPrefix}-institution`}
        label="Institution"
        required
        value={data.institution}
        onChange={(v) => onChange({ institution: v })}
        placeholder="York University"
        error={Boolean(errors?.institution)}
        errorMessage={errors?.institution}
      />

      <div className="space-y-1.5">
        <label
          htmlFor={`${idPrefix}-graduationDate`}
          className="block text-base font-medium text-slate-700"
        >
          Graduation Year
        </label>
        <div className="relative">
          <input
            id={`${idPrefix}-graduationDate`}
            type="number"
            inputMode="numeric"
            min={1900}
            max={new Date().getFullYear() + 10}
            value={graduationYearValue}
            onChange={(e) => onChange({ graduationDate: e.target.value })}
            placeholder="YYYY"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-base text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
        </div>
      </div>
    </div>
  );
}


