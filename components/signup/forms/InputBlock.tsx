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
};

export default function InputBlock({ label, id, value, onChange, placeholder, type = "text", error, errorMessage }: InputBlockProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className={`block text-sm font-medium ${error ? "text-red-600" : "text-slate-700"}`}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error || undefined}
        aria-describedby={errorId}
        className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
        }`}
      />
      {errorMessage ? (
        <p id={errorId} className="text-xs text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
