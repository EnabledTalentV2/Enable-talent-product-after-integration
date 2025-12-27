import React from "react";
import { Candidate } from "../types";
import CandidateListItem from "./CandidateListItem";

interface CandidateListProps {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CandidateList({
  candidates,
  selectedId,
  onSelect,
}: CandidateListProps) {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2">
      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search candidates"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#C27803] focus:ring-1 focus:ring-[#C27803]"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#D25B36] px-4 py-2 text-sm font-medium text-white hover:bg-[#b54d2e]">
          Filters
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 pb-4">
        {candidates.map((candidate) => (
          <CandidateListItem
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedId === candidate.id}
            onClick={() => onSelect(candidate.id)}
          />
        ))}
      </div>
    </div>
  );
}
