"use client";

import { Plus, X } from "lucide-react";
import type { UserData } from "../types";

type SkillData = UserData["skills"] & { primaryList?: string[] };

type Props = {
  data: SkillData;
  errors?: Partial<Record<keyof SkillData, string>>;
  onChange: (patch: Partial<SkillData>) => void;
};

export default function Skills({ data, errors, onChange }: Props) {
  const skillList = data.primaryList || [];
  const errorCount = errors?.skills ? 1 : 0;

  const addSkill = () => {
    const value = data.skills.trim();
    if (!value) return;
    if (skillList.includes(value)) return;
    onChange({ primaryList: [...skillList, value], skills: "" });
  };

  const removeSkill = (skill: string) => {
    onChange({ primaryList: skillList.filter((s) => s !== skill) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
        {errorCount > 0 ? (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {String(errorCount).padStart(2, "0")} error
          </span>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Skills
        </label>
        <p className="text-xs text-slate-500">
          Example: Design, Research, Frontend, Backend, Data, Cloud, Agile,
          Testing
        </p>
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 shadow-sm ${
            errors?.skills ? "border-red-400" : "border-gray-200"
          }`}
        >
          <input
            id="skills-input"
            type="text"
            value={data.skills}
            onChange={(e) => onChange({ skills: e.target.value })}
            placeholder="Type a skill and click Add"
            className="w-full bg-transparent text-sm text-slate-800 outline-none"
          />
          
        </div>
        {errors?.skills ? (
          <p className="text-xs text-red-600">{errors.skills}</p>
        ) : null}

        <div>
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#C27528] px-4 py-2 text-sm font-semibold text-[#C27528] hover:bg-orange-50 transition"
          >
            <Plus size={16} />
            Add Skills 
          </button>
        </div>
      </div>

      {skillList.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {skillList.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-slate-700 border border-orange-100"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-slate-500 hover:text-slate-700"
                aria-label={`Remove ${skill}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
