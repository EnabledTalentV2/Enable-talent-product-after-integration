"use client";

import { useState } from "react";
import {
  ValidationResult,
  generateValidationReport,
} from "@/lib/backendDataValidator";

interface BackendValidationBannerProps {
  validationResult: ValidationResult | null;
}

/**
 * Developer Mode Banner for Backend Data Validation
 *
 * Shows warnings about missing backend fields in development mode.
 * This helps frontend developers communicate data requirements to the backend team.
 *
 * Only renders in development environment (process.env.NODE_ENV === 'development')
 */
export default function BackendValidationBanner({
  validationResult,
}: BackendValidationBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Don't show if no validation result or if all required fields are present
  if (!validationResult) {
    return null;
  }

  const requiredMissing = validationResult.missingFields.filter(
    (f) => f.required
  );
  const optionalMissing = validationResult.missingFields.filter(
    (f) => !f.required
  );

  // Don't show banner if everything is valid
  if (requiredMissing.length === 0 && optionalMissing.length === 0) {
    return null;
  }

  const handleCopyReport = async () => {
    const report = generateValidationReport(validationResult);
    try {
      await navigator.clipboard.writeText(report);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy report:", err);
    }
  };

  const handleLogToConsole = () => {
    console.log(generateValidationReport(validationResult));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      <div
        className={`rounded-lg border-2 shadow-lg ${
          requiredMissing.length > 0
            ? "border-red-400 bg-red-50"
            : "border-yellow-400 bg-yellow-50"
        }`}
      >
        {/* Header */}
        <div
          className="flex cursor-pointer items-center justify-between p-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {requiredMissing.length > 0 ? "🚨" : "⚠️"}
            </span>
            <span className="font-semibold text-slate-800">
              Backend Data Mismatch
            </span>
            <span className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
              DEV MODE
            </span>
          </div>
          <div className="flex items-center gap-3">
            {requiredMissing.length > 0 && (
              <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
                {requiredMissing.length} required missing
              </span>
            )}
            {optionalMissing.length > 0 && (
              <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-medium text-yellow-800">
                {optionalMissing.length} optional missing
              </span>
            )}
            <span className="text-slate-500">{isExpanded ? "▼" : "▲"}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto border-t border-slate-200 p-4">
            {/* Required Missing Fields */}
            {requiredMissing.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 font-semibold text-red-700">
                  🚨 Required Fields Missing:
                </h4>
                <div className="space-y-2">
                  {requiredMissing.map((field, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-red-200 bg-white p-2 text-sm"
                    >
                      <div className="font-mono text-red-800">
                        {field.frontendPath}
                      </div>
                      <div className="text-slate-600">{field.description}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Expected backend field(s):{" "}
                        <code className="rounded bg-slate-100 px-1">
                          {field.expectedBackendPaths.join(" | ")}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Missing Fields */}
            {optionalMissing.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 font-semibold text-yellow-700">
                  ⚠️ Optional Fields Missing:
                </h4>
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {optionalMissing.map((field, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-yellow-200 bg-white p-2 text-sm"
                    >
                      <div className="font-mono text-yellow-800">
                        {field.frontendPath}
                      </div>
                      <div className="text-slate-600">{field.description}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Expected backend field(s):{" "}
                        <code className="rounded bg-slate-100 px-1">
                          {field.expectedBackendPaths.join(" | ")}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 border-t border-slate-200 pt-3">
              <button
                onClick={handleCopyReport}
                className="rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                {isCopied ? "✓ Copied!" : "📋 Copy Report for Backend Team"}
              </button>
              <button
                onClick={handleLogToConsole}
                className="rounded bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300"
              >
                🖥️ Log to Console
              </button>
            </div>

            {/* Tip */}
            <p className="mt-3 text-xs text-slate-500">
              💡 Tip: Click &quot;Copy Report&quot; and share with your backend
              team to communicate the required API changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
