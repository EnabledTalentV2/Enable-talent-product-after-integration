"use client";

import { useState } from "react";
import type { UserData } from "@/lib/types/user";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/a11y/ConfirmDialog";
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
  const [showNoProjectsConfirm, setShowNoProjectsConfirm] = useState(false);
  const entries = data.entries ?? [];
  const noProjects = data.noProjects ?? false;
  const showDeleteWarning = noProjects && entries.length > 0;
  const errorCount = errors?.entries
    ? Object.values(errors.entries).reduce(
        (acc, val) => acc + (val ? Object.keys(val).length : 0),
        0,
      )
    : 0;

  const handleNoProjectsChange = (checked: boolean) => {
    if (checked && entries.length > 0) {
      setShowNoProjectsConfirm(true);
      return;
    }
    onNoProjectsChange(checked);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
        {errorCount > 0 && !noProjects ? (
          <span className="text-sm font-semibold text-red-800 bg-red-50 px-3 py-1 rounded-full">
            {String(errorCount).padStart(2, "0")}{" "}
            {errorCount === 1 ? "field required" : "fields required"}
          </span>
        ) : null}
      </div>

      {errorCount > 0 && !noProjects && entries.length === 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Please add at least one project or check &quot;I don&apos;t have any
          projects to list&quot; below to continue.
        </div>
      ) : null}

      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4">
        <input
          id="noProjects"
          type="checkbox"
          checked={noProjects}
          onChange={(e) => handleNoProjectsChange(e.target.checked)}
          className="h-5 w-5 rounded accent-orange-600 cursor-pointer"
        />
        <label
          htmlFor="noProjects"
          className="text-base font-medium text-slate-700 cursor-pointer"
        >
          I don&apos;t have any projects to list
        </label>
      </div>
      {showDeleteWarning ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Warning: saving with no projects will delete your existing project
          entries.
        </div>
      ) : null}

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
                      className="flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>

                <InputBlock
                  id={`project-${idx}-projectName`}
                  label="Project name"
                  required
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
                        entryErrors.from ? "text-red-800" : "text-slate-700"
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
                          : "border-gray-200 focus:ring-[#C27803]/20 focus:border-[#C27803]"
                      }`}
                    />
                    {entryErrors.from ? (
                      <p className="text-sm text-red-800">{entryErrors.from}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`project-${idx}-to`}
                      className={`block text-base font-medium ${
                        entryErrors.to ? "text-red-800" : "text-slate-700"
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
                          : "border-gray-200 focus:ring-[#C27803]/20 focus:border-[#C27803]"
                      } ${isCurrent ? "bg-slate-50 text-slate-700" : ""}`}
                    />
                    {entryErrors.to ? (
                      <p className="text-sm text-red-800">{entryErrors.to}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onAddEntry}
            className="inline-flex items-center gap-2 text-orange-900 border border-orange-900 px-4 py-2 rounded-lg font-medium text-base hover:bg-orange-50 transition-colors"
          >
            <Plus size={16} />
            {entries.length === 0 ? "Add project" : "Add another project"}
          </button>
        </>
      )}

      <ConfirmDialog
        isOpen={showNoProjectsConfirm}
        title="Remove existing projects?"
        message="Choosing 'I don't have any projects to list' will remove your existing project entries when you save."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        variant="warning"
        requiresConfirmation
        onConfirm={() => {
          setShowNoProjectsConfirm(false);
          onNoProjectsChange(true);
        }}
        onCancel={() => setShowNoProjectsConfirm(false)}
      />
    </div>
  );
}
