'use client';

import { Plus, Trash2 } from "lucide-react";
import InputBlock from "./InputBlock";
import type { UserData } from "../types";

type Entry = UserData["workExperience"]["entries"][number];

type Props = {
  data: UserData["workExperience"];
  errors?: {
    experienceType?: string;
    entries?: Record<number, Partial<Record<keyof Entry, string>>>;
  };
  onExperienceTypeChange: (value: UserData["workExperience"]["experienceType"]) => void;
  onEntryChange: (index: number, patch: Partial<Entry>) => void;
  onAddEntry: () => void;
  onRemoveEntry?: (index: number) => void;
};

export default function WorkExperience({ data, errors, onExperienceTypeChange, onEntryChange, onAddEntry, onRemoveEntry }: Props) {
  const isFresher = data.experienceType === "fresher";
  const entries = data.entries;
  const errorCount = errors?.entries
    ? Object.values(errors.entries).reduce((acc, val) => acc + (val ? Object.keys(val).length : 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-slate-800">
            <input
              type="radio"
              name="experienceType"
              checked={data.experienceType === "experienced"}
              onChange={() => onExperienceTypeChange("experienced")}
              className="w-5 h-5 accent-orange-600 border-gray-300"
            />
            <span className="font-medium">I have experience</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-500">
            <input
              type="radio"
              name="experienceType"
              checked={data.experienceType === "fresher"}
              onChange={() => onExperienceTypeChange("fresher")}
              className="w-5 h-5 accent-orange-600 border-gray-300"
            />
            <span className="font-medium">I am a fresher</span>
          </label>
        </div>
        {errorCount > 0 && data.experienceType === "experienced" ? (
          <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">{String(errorCount).padStart(2, "0")} error</span>
        ) : null}
      </div>

      {isFresher ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-slate-50 px-4 py-4 text-base text-slate-600">
          Marked as fresher. You can add experience later if needed.
        </div>
      ) : null}

      {!isFresher &&
        entries.map((entry, idx) => {
          const entryErrors = errors?.entries?.[idx] || {};
          return (
            <div key={idx} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-800">Experience {idx + 1}</p>
                {onRemoveEntry && entries.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onRemoveEntry(idx)}
                    className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                ) : null}
              </div>

              <InputBlock
                id={`workExp-${idx}-company`}
                label="Company Name"
                value={entry.company}
                onChange={(v) => onEntryChange(idx, { company: v })}
                placeholder="Enter company name"
                error={Boolean(entryErrors.company)}
                errorMessage={entryErrors.company}
              />

              <InputBlock
                id={`workExp-${idx}-role`}
                label="Role"
                value={entry.role}
                onChange={(v) => onEntryChange(idx, { role: v })}
                placeholder="Job title"
                error={Boolean(entryErrors.role)}
                errorMessage={entryErrors.role}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`workExp-${idx}-from`}
                    className={`block text-base font-medium ${entryErrors.from ? "text-red-600" : "text-slate-700"}`}
                  >
                    From
                  </label>
                  <input
                    id={`workExp-${idx}-from`}
                    type="date"
                    value={entry.from}
                    onChange={(e) => onEntryChange(idx, { from: e.target.value })}
                    placeholder="Select start date"
                    className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                      entryErrors.from
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
                    }`}
                  />
                  {entryErrors.from ? <p className="text-sm text-red-600">{entryErrors.from}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor={`workExp-${idx}-to`}
                    className={`block text-base font-medium ${entryErrors.to ? "text-red-600" : "text-slate-700"}`}
                  >
                    To
                  </label>
                  <input
                    id={`workExp-${idx}-to`}
                    type="date"
                    value={entry.to}
                    onChange={(e) => onEntryChange(idx, { to: e.target.value })}
                    placeholder="Select end date"
                    className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                      entryErrors.to
                        ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
                    }`}
                    disabled={entry.current}
                  />
                  {entryErrors.to ? <p className="text-sm text-red-600">{entryErrors.to}</p> : null}
                </div>
              </div>

              <label className="flex items-center gap-2 text-base font-medium text-slate-700">
                <input
                  id={`workExp-${idx}-current`}
                  type="checkbox"
                  checked={entry.current || false}
                  onChange={(e) => onEntryChange(idx, { current: e.target.checked, to: e.target.checked ? "" : entry.to })}
                  className="h-4 w-4 accent-orange-600 border-gray-300 rounded"
                />
                <span>Currently working in this company</span>
              </label>

              <div className="space-y-1.5">
                <label
                  htmlFor={`workExp-${idx}-description`}
                  className={`block text-base font-medium ${entryErrors.description ? "text-red-600" : "text-slate-700"}`}
                >
                  Description
                </label>
                <textarea
                  id={`workExp-${idx}-description`}
                  rows={6}
                  value={entry.description}
                  onChange={(e) => onEntryChange(idx, { description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border text-slate-800 text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 ${
                    entryErrors.description
                      ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
                  }`}
                />
                {entryErrors.description ? <p className="text-sm text-red-600">{entryErrors.description}</p> : null}
              </div>
            </div>
          );
        })}

      {!isFresher ? (
        <button
          type="button"
          onClick={onAddEntry}
          className="inline-flex items-center gap-2 text-[#C27528] border border-[#C27528] px-4 py-2 rounded-lg font-medium text-base hover:bg-orange-50 transition-colors"
        >
          <Plus size={16} />
          Add another experience
        </button>
      ) : null}
    </div>
  );
}


