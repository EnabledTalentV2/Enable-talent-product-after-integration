'use client';

import type { UserData } from "@/lib/types/user";

type Props = {
  data: UserData["preference"];
  errors?: {
    hasWorkVisa?: string;
  };
  onChange: (patch: Partial<UserData["preference"]>) => void;
};

export default function Preference({ data, errors, onChange }: Props) {
  const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const companySizeOptions = ["1 - 10", "10 - 100", "100 - 1000", "1000 - 10000"];
  const jobTypeOptions = ["Full time", "Contract", "Part time", "Intern"];
  const jobSearchOptions = ["Open to Offer", "Ready for Interviews"];

  const Option = ({
    name,
    label,
    checked,
    onCheckedChange,
  }: {
    name: string;
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => (
    <label className="inline-flex items-center gap-2 text-base cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm peer-checked:border-orange-600 peer-checked:bg-orange-50 after:content-[''] after:absolute after:h-2 after:w-2 after:rounded-full after:bg-orange-600 after:opacity-0 peer-checked:after:opacity-100" />
      <span className="text-slate-600 peer-checked:text-slate-800">{label}</span>
    </label>
  );

  const RadioOption = ({
    name,
    label,
    checked,
    onSelect,
  }: {
    name: string;
    label: string;
    checked: boolean;
    onSelect: () => void;
  }) => (
    <label className="inline-flex items-center gap-2 text-base cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm peer-checked:border-orange-600 peer-checked:bg-orange-50 after:content-[''] after:absolute after:h-2 after:w-2 after:rounded-full after:bg-orange-600 after:opacity-0 peer-checked:after:opacity-100" />
      <span className="text-slate-600 peer-checked:text-slate-800">{label}</span>
    </label>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">Company Size</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {companySizeOptions.map((option) => (
            <Option
              key={option}
              name="preference-companySize"
              label={option}
              checked={data.companySize.includes(option)}
              onCheckedChange={() =>
                onChange({ companySize: toggleValue(data.companySize, option) })
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">Type of Job</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {jobTypeOptions.map((option) => (
            <Option
              key={option}
              name="preference-jobType"
              label={option}
              checked={data.jobType.includes(option)}
              onCheckedChange={() =>
                onChange({ jobType: toggleValue(data.jobType, option) })
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">Job Search</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {jobSearchOptions.map((option) => (
            <Option
              key={option}
              name="preference-jobSearch"
              label={option}
              checked={data.jobSearch.includes(option)}
              onCheckedChange={() =>
                onChange({ jobSearch: toggleValue(data.jobSearch, option) })
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">Willing to Relocate</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Option
            name="preference-willingToRelocate"
            label="Yes, I am willing to relocate for the right opportunity"
            checked={data.willingToRelocate}
            onCheckedChange={(checked) =>
              onChange({ willingToRelocate: checked })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">
          Do you have a valid work visa?
          <span className="text-red-500 ml-1">*</span>
        </p>
        <div
          id="preference-hasWorkVisa"
          className="flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          <RadioOption
            name="preference-hasWorkVisa"
            label="Yes"
            checked={data.hasWorkVisa === true}
            onSelect={() => onChange({ hasWorkVisa: true })}
          />
          <RadioOption
            name="preference-hasWorkVisa"
            label="No"
            checked={data.hasWorkVisa === false}
            onSelect={() => onChange({ hasWorkVisa: false })}
          />
        </div>
        {errors?.hasWorkVisa && (
          <p className="text-sm text-red-600">{errors.hasWorkVisa}</p>
        )}
      </div>
    </div>
  );
}

