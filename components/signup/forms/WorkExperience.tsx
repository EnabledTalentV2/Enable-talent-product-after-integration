'use client';

import { Calendar, Plus } from "lucide-react";
import InputBlock from "./InputBlock";
import type { UserData } from "../types";

type Props = {
  data: UserData["workExperience"];
  onChange: (patch: Partial<UserData["workExperience"]>) => void;
};

export default function WorkExperience({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <label className="flex items-center gap-2 cursor-pointer text-slate-800">
          <input
            type="radio"
            name="experienceType"
            checked={data.experienceType === "experienced"}
            onChange={() => onChange({ experienceType: "experienced" })}
            className="w-5 h-5 accent-orange-600 border-gray-300"
          />
          <span className="font-medium">I have experience</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-slate-500">
          <input
            type="radio"
            name="experienceType"
            checked={data.experienceType === "fresher"}
            onChange={() => onChange({ experienceType: "fresher" })}
            className="w-5 h-5 accent-orange-600 border-gray-300"
          />
          <span className="font-medium">I am a fresher</span>
        </label>
      </div>

      <InputBlock label="Company Name" value={data.company} onChange={(v) => onChange({ company: v })} placeholder="Enter company name" />

      <InputBlock label="Role" value={data.role} onChange={(v) => onChange({ role: v })} placeholder="Job title" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">From</label>
          <div className="relative">
            <input
              type="text"
              value={data.from}
              onChange={(e) => onChange({ from: e.target.value })}
              placeholder="Select start date"
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
            <Calendar className="absolute right-3 top-2.5 text-slate-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">To</label>
          <div className="relative">
            <input
              type="text"
              value={data.to}
              onChange={(e) => onChange({ to: e.target.value })}
              placeholder="Select end date"
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
            <Calendar className="absolute right-3 top-2.5 text-slate-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={6}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-slate-800 text-sm leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
        />
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 text-[#C27528] border border-[#C27528] px-4 py-2 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
      >
        <Plus size={16} />
        Add another experience
      </button>
    </div>
  );
}
