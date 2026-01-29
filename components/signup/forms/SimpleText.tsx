"use client";

import { useId } from "react";

type SimpleTextProps = {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
};

export default function SimpleText({
  label,
  id,
  value,
  onChange,
  placeholder,
  error,
  errorMessage,
  required = false,
}: SimpleTextProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className={`block text-base font-medium ${error ? "text-red-700" : "text-slate-700"}`}
      >
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-red-600">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      <textarea
        id={inputId}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error || undefined}
        aria-required={required || undefined}
        aria-describedby={errorId}
        className={`w-full px-4 py-3 rounded-lg border text-slate-800 text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
        }`}
      />
      {errorMessage && (
        <p id={errorId} role="alert" className="text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
