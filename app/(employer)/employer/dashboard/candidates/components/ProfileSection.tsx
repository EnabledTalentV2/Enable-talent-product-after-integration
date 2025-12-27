import React, { useState } from "react";

interface ProfileSectionProps {
  title: string;
  count?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ProfileSection({
  title,
  count,
  children,
  defaultOpen = false,
}: ProfileSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl bg-white p-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        <div className="flex items-center gap-3">
          {count && <span className="text-sm text-slate-400">{count}</span>}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && <div className="px-4 pb-4 pt-2">{children}</div>}
    </div>
  );
}
