"use client";

import type { UserData } from "@/lib/types/user";

type AccessibilityNeeds = NonNullable<UserData["accessibilityNeeds"]>;

type Props = {
  data: AccessibilityNeeds;
  onChange: (patch: Partial<AccessibilityNeeds>) => void;
};

const categories = [
  {
    id: "physical",
    title: "Physical Disability",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "sensory",
    title: "Sensory Disability",
    description: "Includes vision and hearing impairments",
  },
  {
    id: "neurodevelopmental",
    title: "Neurodevelopmental",
    description: "Includes ADHD, autism spectrum, and learning disabilities",
  },
  {
    id: "mental_health",
    title: "Mental Health",
    description:
      "Includes anxiety, depression, and other mental health conditions",
  },
  {
    id: "intellectual",
    title: "Intellectual Disability",
    description: "Includes developmental and cognitive disabilities",
  },
  {
    id: "acquired",
    title: "Acquired Disability",
    description:
      "Includes traumatic brain injury, stroke, and other acquired conditions",
  },
  {
    id: "chronic",
    title: "Chronic Health Condition",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "other",
    title: "Other Disability",
    description: "Any disability not covered in the categories above",
  },
  {
    id: "prefer_not_to_disclose",
    title: "Prefer not to disclose",
    description: "",
  },
];

const accommodationNeedOptions = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "discuss_later", label: "Prefer to discuss later" },
];

const disclosureOptions = [
  { id: "during_application", label: "During Application" },
  { id: "during_interview", label: "During Interview" },
  { id: "after_offer", label: "After job offer" },
  { id: "after_start", label: "After starting work" },
  { id: "not_applicable", label: "Not applicable" },
];

const accommodationOptions = [
  { id: "flexible_schedule", label: "Flexible schedule" },
  { id: "remote_work", label: "Remote work" },
  { id: "assistive_tech", label: "Assistive technology" },
  { id: "accessible_workspace", label: "Accessible workspace" },
  { id: "flexible_deadlines", label: "Flexible deadlines" },
  { id: "support_person", label: "Support person" },
  { id: "other", label: "Other" },
  { id: "non_needed", label: "Non needed" },
  { id: "prefer_discuss_later", label: "Prefer to discuss later" },
];

export default function AccessibilityNeeds({ data, onChange }: Props) {
  const selectedCategories = data.categories ?? [];
  const selectedAccommodations = data.accommodations ?? [];

  const toggleCategory = (value: string) => {
    if (value === "prefer_not_to_disclose") {
      return selectedCategories.includes(value) ? [] : [value];
    }
    const withoutPrefer = selectedCategories.filter(
      (item) => item !== "prefer_not_to_disclose"
    );
    if (withoutPrefer.includes(value)) {
      return withoutPrefer.filter((item) => item !== value);
    }
    return [...withoutPrefer, value];
  };
  const toggleAccommodation = (value: string) => {
    const isExclusiveOption =
      value === "prefer_discuss_later" || value === "non_needed";
    if (isExclusiveOption) {
      return selectedAccommodations.includes(value) ? [] : [value];
    }
    if (
      selectedAccommodations.includes("prefer_discuss_later") ||
      selectedAccommodations.includes("non_needed")
    ) {
      return [value];
    }
    if (selectedAccommodations.includes(value)) {
      return selectedAccommodations.filter((item) => item !== value);
    }
    return [...selectedAccommodations, value];
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          Accessibility needs
        </h3>
        <p className="text-sm text-slate-500">
          This information is optional and helps us support your journey.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">
          Disability categories
        </p>
        <p className="text-sm text-slate-500">Select all that apply.</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <label
                key={category.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    onChange({
                      categories: toggleCategory(category.id),
                    })
                  }
                  className="mt-1 h-4 w-4 rounded accent-orange-600"
                />
                <span>
                  <span className="block text-base font-medium text-slate-800">
                    {category.title}
                  </span>
                  {category.description ? (
                    <span className="block text-sm text-slate-500">
                      {category.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">
          Accommodation needs
        </p>
        <div className="flex flex-wrap gap-6">
          {accommodationNeedOptions.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-base text-slate-700"
            >
              <input
                type="radio"
                name="accessibility-accommodation-need"
                checked={data.accommodationNeed === option.id}
                onChange={() => onChange({ accommodationNeed: option.id })}
                className="h-4 w-4 accent-orange-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">
          Disclosure preference
        </p>
        <div className="flex flex-wrap gap-6">
          {disclosureOptions.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-base text-slate-700"
            >
              <input
                type="radio"
                name="accessibility-disclosure-preference"
                checked={data.disclosurePreference === option.id}
                onChange={() => onChange({ disclosurePreference: option.id })}
                className="h-4 w-4 accent-orange-600"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-base font-semibold text-slate-800">
          Workplace accommodations
        </p>
        <p className="text-sm text-slate-500">Select all that apply.</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {accommodationOptions.map((option) => {
            const isSelected = selectedAccommodations.includes(option.id);
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    onChange({
                      accommodations: toggleAccommodation(option.id),
                    })
                  }
                  className="h-4 w-4 rounded accent-orange-600"
                />
                <span className="text-base text-slate-700">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
