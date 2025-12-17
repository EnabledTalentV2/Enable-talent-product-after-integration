"use client";

import React, { useMemo, useState } from "react";
import Header from "@/components/signup/Header";
import Sidebar from "@/components/signup/Sidebar";
import BasicInfo from "@/components/signup/forms/BasicInfo";
import Education from "@/components/signup/forms/Education";
import WorkExperience from "@/components/signup/forms/WorkExperience";
import ReviewAndAgree from "@/components/signup/forms/ReviewAndAgree";
import Skills from "@/components/signup/forms/Skills";
import Projects from "@/components/signup/forms/Projects";
import Achievements from "@/components/signup/forms/Achievements";
import Certification from "@/components/signup/forms/Certification";
import Preference from "@/components/signup/forms/Preference";
import OtherDetails from "@/components/signup/forms/OtherDetails";
import type { Step, StepKey, StepStatus, UserData } from "@/components/signup/types";

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
    description: [
      "- Collaborated with cross-functional teams including product managers, engineers, and marketers to understand business goals and user needs.",
      "- Conducted user research through interviews, surveys, and usability testing to inform design decisions.",
      "- Created wireframes, prototypes, and user flows to communicate design ideas and facilitate feedback.",
      "- Designed intuitive and elegant user interfaces for web and mobile applications, adhering to design principles and best practices.",
      "- Implemented responsive design techniques to ensure a seamless user experience across devices.",
    ].join("\n"),
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
          userData.workExperience.company && userData.workExperience.role && userData.workExperience.experienceType
        );
      case "reviewAgree":
        return userData.reviewAgree.agree;
      default:
        return true;
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
          <BasicInfo
            data={userData.basicInfo}
            onChange={(patch) => setUserData((prev) => ({ ...prev, basicInfo: { ...prev.basicInfo, ...patch } }))}
          />
        );
      case "education":
        return (
          <Education
            data={userData.education}
            onChange={(patch) => setUserData((prev) => ({ ...prev, education: { ...prev.education, ...patch } }))}
          />
        );
      case "workExperience":
        return (
          <WorkExperience
            data={userData.workExperience}
            onChange={(patch) => setUserData((prev) => ({ ...prev, workExperience: { ...prev.workExperience, ...patch } }))}
          />
        );
      case "skills":
        return (
          <Skills
            data={userData.skills}
            onChange={(patch) => setUserData((prev) => ({ ...prev, skills: { ...prev.skills, ...patch } }))}
          />
        );
      case "projects":
        return (
          <Projects
            data={userData.projects}
            onChange={(patch) => setUserData((prev) => ({ ...prev, projects: { ...prev.projects, ...patch } }))}
          />
        );
      case "achievements":
        return (
          <Achievements
            data={userData.achievements}
            onChange={(patch) => setUserData((prev) => ({ ...prev, achievements: { ...prev.achievements, ...patch } }))}
          />
        );
      case "certification":
        return (
          <Certification
            data={userData.certification}
            onChange={(patch) => setUserData((prev) => ({ ...prev, certification: { ...prev.certification, ...patch } }))}
          />
        );
      case "preference":
        return (
          <Preference
            data={userData.preference}
            onChange={(patch) => setUserData((prev) => ({ ...prev, preference: { ...prev.preference, ...patch } }))}
          />
        );
      case "otherDetails":
        return (
          <OtherDetails
            data={userData.otherDetails}
            onChange={(patch) => setUserData((prev) => ({ ...prev, otherDetails: { ...prev.otherDetails, ...patch } }))}
          />
        );
      case "reviewAgree":
        return (
          <ReviewAndAgree
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
          <Sidebar steps={stepsState} />

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
