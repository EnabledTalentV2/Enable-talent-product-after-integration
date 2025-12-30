"use client";

import type { UserData } from "@/lib/types/user";
import { Plus, Trash2 } from "lucide-react";
import InputBlock from "./InputBlock";

type Entry = UserData["projects"]["entries"][number];

type Props = {
  data: UserData["projects"];
  errors?: {
    entries?: Record<number, Partial<Record<keyof Entry, string>>>;
  };
  onEntryChange: (index: number, patch: Partial<Entry>) => void;
  onAddEntry: () => void;
  onRemoveEntry?: (index: number) => void;
  onNoProjectsChange: (val: boolean) => void;
};

export default function Projects({
  data,
  errors,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  onNoProjectsChange,
}: Props) {
  const entries = data.entries ?? [];
  const noProjects = data.noProjects ?? false;
  const errorCount = errors?.entries
    ? Object.values(errors.entries).reduce(
        (acc, val) => acc + (val ? Object.keys(val).length : 0),
        0
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
        {errorCount > 0 && !noProjects ? (
          <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {String(errorCount).padStart(2, "0")} error
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4">
        <input
          id="noProjects"
          type="checkbox"
          checked={noProjects}
          onChange={(e) => onNoProjectsChange(e.target.checked)}
          className="h-5 w-5 rounded accent-orange-600 cursor-pointer"
        />
        <label
          htmlFor="noProjects"
          className="text-base font-medium text-slate-700 cursor-pointer"
        >
          I don&apos;t have any projects to list
        </label>
      </div>

      {!noProjects && (
        <>
          {entries.map((entry, idx) => {
            const entryErrors = errors?.entries?.[idx] || {};
            const isCurrent = entry.current;

            return (
              <div
                key={idx}
                className="space-y-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-800">
                    Project {idx + 1}
                  </p>
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
                  id={`project-${idx}-projectName`}
                  label="Project name"
                  value={entry.projectName}
                  onChange={(v) => onEntryChange(idx, { projectName: v })}
                  placeholder="Enter project name"
                  error={Boolean(entryErrors.projectName)}
                  errorMessage={entryErrors.projectName}
                />

                <InputBlock
                  id={`project-${idx}-projectDescription`}
                  label="Project description"
                  value={entry.projectDescription}
                  onChange={(v) =>
                    onEntryChange(idx, { projectDescription: v })
                  }
                  placeholder="Enter project description"
                  error={Boolean(entryErrors.projectDescription)}
                  errorMessage={entryErrors.projectDescription}
                />

                <div className="space-y-2">
                  <p className="text-base font-medium text-slate-700">
                    Currently working on this project?
                  </p>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 text-base text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name={`project-${idx}-current`}
                        checked={isCurrent}
                        onChange={() =>
                          onEntryChange(idx, { current: true, to: "" })
                        }
                        className="h-5 w-5 accent-orange-600"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 text-base text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name={`project-${idx}-current`}
                        checked={!isCurrent}
                        onChange={() => onEntryChange(idx, { current: false })}
                        className="h-5 w-5 accent-orange-600"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`project-${idx}-from`}
                      className={`block text-base font-medium ${
                        entryErrors.from ? "text-red-600" : "text-slate-700"
                      }`}
                    >
                      From
                    </label>
                    <input
                      id={`project-${idx}-from`}
                      type="date"
                      value={entry.from}
                      onChange={(e) =>
                        onEntryChange(idx, { from: e.target.value })
                      }
                      className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                        entryErrors.from
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
                      }`}
                    />
                    {entryErrors.from ? (
                      <p className="text-sm text-red-600">{entryErrors.from}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`project-${idx}-to`}
                      className={`block text-base font-medium ${
                        entryErrors.to ? "text-red-600" : "text-slate-700"
                      }`}
                    >
                      To
                    </label>
                    <input
                      id={`project-${idx}-to`}
                      type="date"
                      value={entry.to}
                      onChange={(e) =>
                        onEntryChange(idx, { to: e.target.value })
                      }
                      disabled={isCurrent}
                      className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
                        entryErrors.to
                          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
                      } ${isCurrent ? "bg-slate-50 text-slate-500" : ""}`}
                    />
                    {entryErrors.to ? (
                      <p className="text-sm text-red-600">{entryErrors.to}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddEntry}
            className="inline-flex items-center gap-2 text-[#C27528] border border-[#C27528] px-4 py-2 rounded-lg font-medium text-base hover:bg-orange-50 transition-colors"
          >
            <Plus size={16} />
            {entries.length === 0 ? "Add project" : "Add another project"}
          </button>
        </>
      )}
    </div>
  );
}
