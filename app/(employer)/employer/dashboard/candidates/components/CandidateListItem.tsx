import React from "react";
import { Candidate } from "../types";

interface CandidateListItemProps {
  candidate: Candidate;
  isSelected: boolean;
  onClick: () => void;
}

export default function CandidateListItem({
  candidate,
  isSelected,
  onClick,
}: CandidateListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
        isSelected
          ? "border-[#C27803] bg-[#FFFDF5] ring-1 ring-[#C27803]"
          : "border-slate-100 bg-white hover:border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={candidate.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-500">
                {candidate.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{candidate.name}</h3>
            <p className="text-xs text-slate-500">{candidate.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              {candidate.status}
            </span>
            {candidate.isBestMatch && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                Best Match
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex flex-col gap-1 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {candidate.location}
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Experience: {candidate.experience}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-bold text-slate-900">
            {candidate.matchPercentage}%
          </span>
          <span className="text-[10px] text-slate-500">Matching</span>
        </div>
      </div>
    </div>
  );
}
