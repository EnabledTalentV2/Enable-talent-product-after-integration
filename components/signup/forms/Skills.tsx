"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { UserData } from "@/lib/types/user";

type SkillLevel = "basic" | "intermediate" | "advanced";
type SkillEntry = { name: string; level: SkillLevel };
type SkillData = UserData["skills"];

type Props = {
  data: SkillData;
  errors?: Partial<Record<keyof SkillData, string>>;
  onChange: (patch: Partial<SkillData>) => void;
};

const levelLabels: Record<SkillLevel, string> = {
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const levelColors: Record<SkillLevel, string> = {
  basic: "bg-slate-100 border-slate-200 text-slate-600",
  intermediate: "bg-blue-50 border-blue-200 text-blue-700",
  advanced: "bg-green-50 border-green-200 text-green-700",
};

export default function Skills({ data, errors, onChange }: Props) {
  const skillList: SkillEntry[] = data.primaryList || [];
  const [selectedLevel, setSelectedLevel] =
    useState<SkillLevel>("intermediate");
  const errorCount = errors?.skills ? 1 : 0;

  const splitSkills = (value: string) =>
    value
      .split(/[,;\n]+/)
      .map((skill) => skill.trim())
      .filter(Boolean);

  const addSkill = () => {
    const entries = splitSkills(data.skills);
    if (!entries.length) return;
    const existingNames = skillList.map((s) => s.name.toLowerCase());
    const newSkills = entries
      .filter((skill) => !existingNames.includes(skill.toLowerCase()))
      .map((name) => ({ name, level: selectedLevel }));
    if (!newSkills.length) return;
    onChange({ primaryList: [...skillList, ...newSkills], skills: "" });
  };

  const removeSkill = (skillName: string) => {
    onChange({ primaryList: skillList.filter((s) => s.name !== skillName) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
        {errorCount > 0 ? (
          <span className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {String(errorCount).padStart(2, "0")} error
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="skills-input"
            className="block text-base font-medium text-slate-700"
          >
            Add Your Skills
            <span aria-hidden="true" className="text-red-600">
              {" "}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </label>
          <p className="text-sm text-slate-500">
            Type a skill name and press{" "}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-slate-100 border border-slate-300 rounded">
              Enter
            </kbd>{" "}
            or click the &quot;Add&quot; button. You can add multiple skills one at a
            time.
          </p>
          <p className="text-sm text-slate-500 italic">
            Examples: Python, Communication, Microsoft Excel, Time Management,
            SQL, Leadership
          </p>
          <div className="flex gap-2">
            <div
              className={`flex-1 flex items-center gap-2 rounded-lg border px-3 py-2.5 shadow-sm ${
                errors?.skills ? "border-red-400" : "border-gray-200"
              }`}
            >
              <input
                id="skills-input"
                type="text"
                value={data.skills}
                onChange={(e) => onChange({ skills: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="e.g., JavaScript"
                aria-required="true"
                aria-describedby="skills-help"
                className="w-full bg-transparent text-base text-slate-800 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={addSkill}
              disabled={!data.skills.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C27528] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#A86321] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Add skill to your list"
            >
              <Plus size={18} />
              Add
            </button>
          </div>
          {errors?.skills ? (
            <p className="text-sm text-red-600">{errors.skills}</p>
          ) : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-base font-medium text-slate-700">
            Proficiency Level
          </legend>
          <div className="flex flex-wrap items-center gap-4">
            {(Object.keys(levelLabels) as SkillLevel[]).map((level) => (
              <label
                key={level}
                className="inline-flex items-center gap-2 text-base cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="skill-level"
                  value={level}
                  checked={selectedLevel === level}
                  onChange={() => setSelectedLevel(level)}
                  className="peer sr-only"
                />
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm peer-checked:border-orange-600 peer-checked:bg-orange-50 after:content-[''] after:absolute after:h-2 after:w-2 after:rounded-full after:bg-orange-600 after:opacity-0 peer-checked:after:opacity-100" />
                <span className="text-slate-600 peer-checked:text-slate-800">
                  {levelLabels[level]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {skillList.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600">Added Skills:</p>
          <div className="flex flex-wrap gap-3">
            {skillList.map((skill) => (
              <span
                key={skill.name}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border ${levelColors[skill.level]}`}
              >
                <span>{skill.name}</span>
                <span className="text-xs opacity-75">
                  ({levelLabels[skill.level]})
                </span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name)}
                  className="text-current opacity-60 hover:opacity-100"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
