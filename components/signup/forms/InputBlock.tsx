'use client';

import { useId } from "react";

type InputBlockProps = {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
};

/**
 * Accessible form input component.
 * WCAG 1.3.1: Info and Relationships - Proper label association
 * WCAG 3.3.1: Error Identification - Clear error messages
 * WCAG 3.3.2: Labels or Instructions - Required field indication
 */
export default function InputBlock({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  errorMessage,
  required = false,
  hint,
  autoComplete,
}: InputBlockProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  // Build aria-describedby from available descriptions
  const describedByIds = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className={`block text-base font-medium ${error ? "text-red-800" : "text-slate-700"}`}
      >
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-red-800"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-slate-700">
          {hint}
        </p>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error || undefined}
        aria-describedby={describedByIds}
        aria-required={required || undefined}
        autoComplete={autoComplete}
        className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-gray-200 focus:ring-[#C27803]/20 focus:border-[#C27803]"
        }`}
      />
      {errorMessage && (
        <p id={errorId} role="alert" className="text-sm text-red-800">
          {errorMessage}
        </p>
      )}
    </div>
  );
}


