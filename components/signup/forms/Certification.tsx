"use client";

import { useState } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import InputBlock from "./InputBlock";
import ConfirmDialog from "@/components/a11y/ConfirmDialog";
import type { UserData } from "@/lib/types/user";

type Entry = UserData["certification"]["entries"][number];

type Props = {
  data: UserData["certification"];
  errors?: {
    entries?: Record<number, Partial<Record<keyof Entry, string>>>;
  };
  onToggleNoCertification: (value: boolean) => void;
  onEntryChange: (index: number, patch: Partial<Entry>) => void;
  onAddEntry: () => void;
  onRemoveEntry?: (index: number) => void;
  suppressDeleteWarning?: boolean;
};

export default function Certification({
  data,
  errors,
  onToggleNoCertification,
  onEntryChange,
  onAddEntry,
  onRemoveEntry,
  suppressDeleteWarning = false,
}: Props) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const entries = data.entries;
  const isNone = data.noCertification;
  const showDeleteWarning =
    !suppressDeleteWarning && isNone && entries.length > 0;
  const errorCount = errors?.entries
    ? Object.values(errors.entries).reduce(
        (acc, val) => acc + (val ? Object.keys(val).length : 0),
        0,
      )
    : 0;

  const handleToggleNoCertification = (checked: boolean) => {
    if (!suppressDeleteWarning && checked && entries.length > 0) {
      // Show accessible confirmation dialog instead of window.confirm
      // WCAG 4.1.2: Proper role and ARIA attributes for dialogs
      setShowConfirmDialog(true);
      return;
    }
    onToggleNoCertification(checked);
  };

  const handleConfirmNoCertification = () => {
    setShowConfirmDialog(false);
    onToggleNoCertification(true);
  };

  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Accessible confirmation dialog - WCAG 4.1.2 compliant */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Remove Certifications?"
        message="Choosing 'no certification' will remove your existing certifications when you save. Are you sure you want to continue?"
        confirmLabel="Yes, remove"
        cancelLabel="Keep certifications"
        variant="warning"
        onConfirm={handleConfirmNoCertification}
        onCancel={handleCancelDialog}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Certifications</h3>
        {errorCount > 0 && !isNone ? (
          <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {String(errorCount).padStart(2, "0")}{" "}
            {errorCount === 1 ? "field required" : "fields required"}
          </span>
        ) : null}
      </div>

      {errorCount > 0 && !isNone && entries.length === 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Please add at least one certification or check "No certification"
          below to continue.
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-base font-medium text-slate-700">
        <input
          id="cert-noCertification"
          type="checkbox"
          checked={Boolean(data.noCertification)}
          onChange={(e) => handleToggleNoCertification(e.target.checked)}
          className="h-4 w-4 accent-orange-600 border-gray-300 rounded"
        />
        <span>No certification</span>
      </label>
      <p className="text-sm text-slate-500">
        Don&apos;t have any certifications? Tick &quot;No certification&quot; to
        skip this step.
      </p>
      {showDeleteWarning ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Warning: saving with no certification will delete your existing
          certifications.
        </div>
      ) : null}

      {isNone ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-slate-50 px-4 py-4 text-base text-slate-600">
          You selected &quot;No certification&quot;. You can skip this step.
        </div>
      ) : null}

      {!isNone
        ? entries.map((entry, idx) => {
            const entryErrors = errors?.entries?.[idx] || {};
            const credentialError = entryErrors.credentialIdUrl;

            return (
              <div
                key={idx}
                className="space-y-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-800">
                    Certification {idx + 1}
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
                  id={`cert-${idx}-name`}
                  label="Name of certification"
                  required
                  value={entry.name}
                  onChange={(v) => onEntryChange(idx, { name: v })}
                  placeholder="Design Thinking for Innovation"
                  error={Boolean(entryErrors.name)}
                  errorMessage={entryErrors.name}
                />

                <InputBlock
                  id={`cert-${idx}-issueDate`}
                  label="Issue Date"
                  type="month"
                  value={entry.issueDate}
                  onChange={(v) => onEntryChange(idx, { issueDate: v })}
                  placeholder="2021-08"
                  error={Boolean(entryErrors.issueDate)}
                  errorMessage={entryErrors.issueDate}
                />

                <InputBlock
                  id={`cert-${idx}-expiryDate`}
                  label="Expiry Date"
                  type="month"
                  value={entry.expiryDate ?? ""}
                  onChange={(v) => onEntryChange(idx, { expiryDate: v })}
                  placeholder="2026-08"
                  error={Boolean(entryErrors.expiryDate)}
                  errorMessage={entryErrors.expiryDate}
                />

                <InputBlock
                  id={`cert-${idx}-organization`}
                  label="Issuing organization"
                  value={entry.organization}
                  onChange={(v) => onEntryChange(idx, { organization: v })}
                  placeholder="University of Virginia"
                  error={Boolean(entryErrors.organization)}
                  errorMessage={entryErrors.organization}
                />

                <div className="space-y-2">
                  <label
                    htmlFor={`cert-${idx}-credentialIdUrl`}
                    className={`block text-base font-medium ${
                      credentialError ? "text-red-600" : "text-slate-700"
                    }`}
                  >
                    Credential URL
                  </label>
                  <div
                    className={`flex items-center rounded-lg border px-3 py-2.5 text-base shadow-sm ${
                      credentialError
                        ? "border-red-400 text-slate-700"
                        : "border-gray-200 text-slate-800"
                    }`}
                  >
                    <input
                      id={`cert-${idx}-credentialIdUrl`}
                      type="text"
                      value={entry.credentialIdUrl}
                      onChange={(e) =>
                        onEntryChange(idx, { credentialIdUrl: e.target.value })
                      }
                      placeholder="Enter credential url"
                      className="w-full bg-transparent outline-none"
                    />
                    {credentialError ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : null}
                  </div>
                  {credentialError ? (
                    <p className="text-sm text-red-600">{credentialError}</p>
                  ) : null}
                </div>
              </div>
            );
          })
        : null}

      {!isNone ? (
        <button
          type="button"
          onClick={onAddEntry}
          className="inline-flex items-center gap-2 text-[#C27528] border border-[#C27528] px-4 py-2 rounded-lg font-medium text-base hover:bg-orange-50 transition-colors"
        >
          <Plus size={16} />
          {entries.length === 0
            ? "Add certification"
            : "Add another certification"}
        </button>
      ) : null}
    </div>
  );
}
