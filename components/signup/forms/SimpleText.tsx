'use client';

import { useId } from "react";

type Props = {
  title: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SimpleText({ title, id, placeholder, value, onChange }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-base font-medium text-slate-700">
        {title}
      </label>
      <textarea
        id={inputId}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-slate-800 text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
      />
    </div>
  );
}

