"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Check, AlertCircle, Calendar, Plus } from "lucide-react";
import Header from "@/components/signup/Header";

type StepStatus = "pending" | "completed" | "error";
type StepKey =
  | "basicInfo"
  | "education"
  | "workExperience"
  | "skills"
  | "projects"
  | "achievements"
  | "certification"
  | "preference"
  | "otherDetails"
  | "reviewAgree";

type Step = {
  id: number;
  label: string;
  key: StepKey;
  status: StepStatus;
  errorText?: string;
  isActive?: boolean;
};

type UserData = {
  basicInfo: { fullName: string; email: string; phone: string; location: string };
  education: { school: string; degree: string; graduation: string };
  workExperience: {
    experienceType: "experienced" | "fresher";
    company: string;
    role: string;
    from: string;
    to: string;
    description: string;
  };
  skills: { skills: string };
  projects: { projects: string };
  achievements: { achievements: string };
  certification: { certification: string };
  preference: { preference: string };
  otherDetails: { otherDetails: string };
  reviewAgree: { agree: boolean; notes: string };
};

const initialSteps: Step[] = [
  { id: 1, label: "Basic Info", key: "basicInfo", status: "pending", isActive: true },
  { id: 2, label: "Education", key: "education", status: "pending" },
  { id: 3, label: "Work Experience", key: "workExperience", status: "pending" },
  { id: 4, label: "Skills", key: "skills", status: "pending" },
  { id: 5, label: "Projects", key: "projects", status: "pending" },
  { id: 6, label: "Achievements", key: "achievements", status: "pending" },
  { id: 7, label: "Certification", key: "certification", status: "pending" },
  { id: 8, label: "Preference", key: "preference", status: "pending" },
  { id: 9, label: "Other Details", key: "otherDetails", status: "pending" },
  { id: 10, label: "Review And Agree", key: "reviewAgree", status: "pending" },
];

const initialUserData: UserData = {
  basicInfo: { fullName: "", email: "", phone: "", location: "" },
  education: { school: "", degree: "", graduation: "" },
  workExperience: {
    experienceType: "experienced",
    company: "tiktok",
    role: "Sr UX designer",
    from: "",
    to: "21-Jan-2025",
    description:
      "• Collaborated with cross-functional teams including product managers, engineers, and marketers to understand business goals and user needs.\n" +
      "• Conducted user research through interviews, surveys, and usability testing to inform design decisions.\n" +
      "• Created wireframes, prototypes, and user flows to communicate design ideas and facilitate feedback.\n" +
      "• Designed intuitive and elegant user interfaces for web and mobile applications, adhering to design principles and best practices.\n" +
      "• Implemented responsive design techniques to ensure a seamless user experience across devices.",
  },
  skills: { skills: "" },
  projects: { projects: "" },
  achievements: { achievements: "" },
  certification: { certification: "" },
  preference: { preference: "" },
  otherDetails: { otherDetails: "" },
  reviewAgree: { agree: false, notes: "" },
};

export default function ManualResumeFill() {
  const [stepsState, setStepsState] = useState<Step[]>(initialSteps);
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const activeIndex = stepsState.findIndex((s) => s.isActive);
  const activeStep = stepsState[activeIndex === -1 ? 0 : activeIndex];

  const setActiveStep = (nextIndex: number) => {
    setStepsState((prev) =>
      prev.map((step, idx) => ({
        ...step,
        isActive: idx === nextIndex,
      }))
    );
  };

  const updateStepStatus = (idx: number, status: StepStatus, errorText?: string) => {
    setStepsState((prev) =>
      prev.map((step, i) =>
        i === idx
          ? {
              ...step,
              status,
              errorText,
            }
          : step
      )
    );
  };

  const validateStep = (key: StepKey) => {
    switch (key) {
      case "basicInfo":
        return Boolean(userData.basicInfo.fullName && userData.basicInfo.email);
      case "education":
        return Boolean(userData.education.school && userData.education.degree);
      case "workExperience":
        return Boolean(
          userData.workExperience.company &&
            userData.workExperience.role &&
            userData.workExperience.experienceType
        );
      case "reviewAgree":
        return userData.reviewAgree.agree;
      default:
        return true; // other steps are optional in this flow
    }
  };

  const handleSaveAndNext = () => {
    if (activeIndex === -1) return;
    const isValid = validateStep(activeStep.key);

    if (!isValid) {
      updateStepStatus(activeIndex, "error", "Please complete required fields");
      return;
    }

    setStepsState((prev) =>
      prev.map((step, idx) => {
        if (idx === activeIndex) {
          return { ...step, status: "completed", isActive: false, errorText: undefined };
        }
        if (idx === activeIndex + 1) {
          return { ...step, isActive: true };
        }
        return step;
      })
    );
  };

  const handlePrevious = () => {
    if (activeIndex <= 0) return;
    setActiveStep(activeIndex - 1);
  };

  const renderForm = useMemo(() => {
    switch (activeStep.key) {
      case "basicInfo":
        return (
          <BasicInfoForm
            data={userData.basicInfo}
            onChange={(patch) => setUserData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, ...patch } }))}
          />
        );
      case "education":
        return (
          <EducationForm
            data={userData.education}
            onChange={(patch) => setUserData((prev) => ({ ...prev, education: { ...prev.education, ...patch } }))}
          />
        );
      case "workExperience":
        return (
          <WorkExperienceForm
            data={userData.workExperience}
            onChange={(patch) =>
              setUserData((prev) => ({ ...prev, workExperience: { ...prev.workExperience, ...patch } }))
            }
          />
        );
      case "skills":
        return (
          <SimpleTextForm
            title="Skills"
            placeholder="List your top skills..."
            value={userData.skills.skills}
            onChange={(value) => setUserData((prev) => ({ ...prev, skills: { skills: value } }))}
          />
        );
      case "projects":
        return (
          <SimpleTextForm
            title="Projects"
            placeholder="Describe your projects..."
            value={userData.projects.projects}
            onChange={(value) => setUserData((prev) => ({ ...prev, projects: { projects: value } }))}
          />
        );
      case "achievements":
        return (
          <SimpleTextForm
            title="Achievements"
            placeholder="Add achievements or awards..."
            value={userData.achievements.achievements}
            onChange={(value) => setUserData((prev) => ({ ...prev, achievements: { achievements: value } }))}
          />
        );
      case "certification":
        return (
          <SimpleTextForm
            title="Certification"
            placeholder="List certifications..."
            value={userData.certification.certification}
            onChange={(value) => setUserData((prev) => ({ ...prev, certification: { certification: value } }))}
          />
        );
      case "preference":
        return (
          <SimpleTextForm
            title="Preference"
            placeholder="Add role/location preferences..."
            value={userData.preference.preference}
            onChange={(value) => setUserData((prev) => ({ ...prev, preference: { preference: value } }))}
          />
        );
      case "otherDetails":
        return (
          <SimpleTextForm
            title="Other Details"
            placeholder="Anything else we should know..."
            value={userData.otherDetails.otherDetails}
            onChange={(value) => setUserData((prev) => ({ ...prev, otherDetails: { otherDetails: value } }))}
          />
        );
      case "reviewAgree":
        return (
          <ReviewForm
            data={userData.reviewAgree}
            onChange={(patch) => setUserData((prev) => ({ ...prev, reviewAgree: { ...prev.reviewAgree, ...patch } }))}
          />
        );
      default:
        return null;
    }
  }, [activeStep.key, userData]);

  return (
    <div className="min-h-screen bg-[#EFF6FF] px-4 py-6 md:px-10 md:py-10 text-slate-800 flex justify-center">
      <div className="max-w-7xl w-full flex flex-col gap-6">
        <Header />

        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-3 bg-white rounded-3xl p-6 shadow-lg flex flex-col justify-between h-fit min-h-[620px]">
            <ul className="space-y-4">
              {stepsState.map((step, idx) => {
                const isActive = step.isActive;
                return (
                  <li
                    key={step.id}
                    className={`flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors ${
                      isActive ? "bg-orange-50 border border-orange-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {step.status === "completed" ? (
                        <span className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                          <Check size={15} className="text-white" strokeWidth={3} />
                        </span>
                      ) : step.status === "error" ? (
                        <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                          <AlertCircle size={15} className="text-white" strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center shadow-sm text-[10px] text-slate-400">
                          {idx + 1}
                        </span>
                      )}
                      <span className={`text-sm ${isActive ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                        {step.label}
                      </span>
                    </div>
                    {step.status === "error" && step.errorText ? (
                      <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{step.errorText}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
              <Image src="/logo/et-new.svg" alt="Enable Talent" width={140} height={36} className="h-9 w-auto opacity-85" />
            </div>
          </aside>

          <main className="md:col-span-9 bg-white rounded-3xl p-8 md:p-10 shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <p className="text-sm text-slate-500">Step {activeStep.id}</p>
                <h2 className="text-2xl font-bold text-slate-900">{activeStep.label}</h2>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Profile completion tracking</span>
              </div>
            </div>

            <form className="space-y-6">
              {renderForm}

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  disabled={activeIndex === 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="px-6 py-2.5 bg-[#C27528] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  {activeIndex === stepsState.length - 1 ? "Finish" : "Save & Next"}
                </button>
              </div>
            </form>
          </main>
        </section>
      </div>
    </div>
  );
}

/* --- Step Forms --- */

type BasicInfoFormProps = {
  data: UserData["basicInfo"];
  onChange: (patch: Partial<UserData["basicInfo"]>) => void;
};
function BasicInfoForm({ data, onChange }: BasicInfoFormProps) {
  return (
    <div className="space-y-6">
      <InputBlock label="Full Name" value={data.fullName} onChange={(v) => onChange({ fullName: v })} placeholder="Enter your full name" />
      <InputBlock label="Email" value={data.email} onChange={(v) => onChange({ email: v })} placeholder="you@example.com" type="email" />
      <InputBlock label="Phone" value={data.phone} onChange={(v) => onChange({ phone: v })} placeholder="+1 555 123 4567" />
      <InputBlock label="Location" value={data.location} onChange={(v) => onChange({ location: v })} placeholder="City, Country" />
    </div>
  );
}

type EducationFormProps = {
  data: UserData["education"];
  onChange: (patch: Partial<UserData["education"]>) => void;
};
function EducationForm({ data, onChange }: EducationFormProps) {
  return (
    <div className="space-y-6">
      <InputBlock label="School / University" value={data.school} onChange={(v) => onChange({ school: v })} placeholder="University name" />
      <InputBlock label="Degree" value={data.degree} onChange={(v) => onChange({ degree: v })} placeholder="BSc Computer Science" />
      <InputBlock label="Graduation" value={data.graduation} onChange={(v) => onChange({ graduation: v })} placeholder="May 2025" />
    </div>
  );
}

type WorkExperienceFormProps = {
  data: UserData["workExperience"];
  onChange: (patch: Partial<UserData["workExperience"]>) => void;
};
function WorkExperienceForm({ data, onChange }: WorkExperienceFormProps) {
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

      <InputBlock
        label="Company Name"
        value={data.company}
        onChange={(v) => onChange({ company: v })}
        placeholder="Enter company name"
      />

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

/* Simple text form for placeholder steps */
type SimpleTextFormProps = {
  title: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};
function SimpleTextForm({ title, placeholder, value, onChange }: SimpleTextFormProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{title}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-slate-800 text-sm leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
      />
    </div>
  );
}

/* Review / Agree form */
type ReviewFormProps = {
  data: UserData["reviewAgree"];
  onChange: (patch: Partial<UserData["reviewAgree"]>) => void;
};
function ReviewForm({ data, onChange }: ReviewFormProps) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
        <input
          type="checkbox"
          checked={data.agree}
          onChange={(e) => onChange({ agree: e.target.checked })}
          className="w-5 h-5 accent-orange-600 border-gray-300"
        />
        <span className="font-medium">I confirm the above information is accurate.</span>
      </label>
      <SimpleTextForm
        title="Notes"
        placeholder="Add any final comments..."
        value={data.notes}
        onChange={(value) => onChange({ notes: value })}
      />
    </div>
  );
}

/* Shared input block */
type InputBlockProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};
function InputBlock({ label, value, onChange, placeholder, type = "text" }: InputBlockProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
      />
    </div>
  );
}
