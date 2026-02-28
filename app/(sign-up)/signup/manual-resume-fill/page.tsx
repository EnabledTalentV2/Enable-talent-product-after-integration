"use client";
import { scrollBehavior } from "@/lib/utils/scrollBehavior";

import { useEffect, useMemo } from "react";
import Navbar from "@/components/signup/Navbar";
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
import { useManualResumeFill } from "@/lib/hooks/useManualResumeFill";
import type { UserData } from "@/lib/types/user";

type WorkEntry = UserData["workExperience"]["entries"][number];
type ProjectEntry = UserData["projects"]["entries"][number];
type CertificationEntry = UserData["certification"]["entries"][number];
type LanguageEntry = UserData["otherDetails"]["languages"][number];

export default function ManualResumeFill() {
  const form = useManualResumeFill();

  const renderForm = useMemo(() => {
    switch (form.activeStep.key) {
      case "basicInfo":
        return (
          <BasicInfo
            data={form.userData.basicInfo}
            errors={form.basicInfoErrors}
            hideProfilePhoto
            onChange={(patch) => {
              form.setUserData((prev) => ({
                ...prev,
                basicInfo: { ...prev.basicInfo, ...patch },
              }));
              form.setBasicInfoErrors((prev) => {
                const cleared = { ...prev };
                (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                  (key) => {
                    if (patch[key]) {
                      delete (cleared as Record<string, string>)[key as string];
                    }
                  },
                );
                return cleared;
              });
              form.setBasicInfoFirstError((prev) => {
                if (!prev) return prev;
                const firstKey = prev.replace(
                  "basicInfo-",
                  "",
                ) as keyof UserData["basicInfo"];
                const updatedKeys = Object.keys(
                  patch,
                ) as (keyof typeof patch)[];
                if (updatedKeys.includes(firstKey) && patch[firstKey]) {
                  return null;
                }
                return prev;
              });
            }}
          />
        );
      case "education":
        return (
          <Education
            data={form.userData.education}
            errors={form.educationErrors}
            onChange={(patch) => {
              form.setUserData((prev) => ({
                ...prev,
                education: { ...prev.education, ...patch },
              }));
              form.setEducationErrors((prev) => {
                const cleared = { ...prev };
                (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                  (key) => {
                    if (patch[key]) {
                      delete (cleared as Record<string, string>)[key as string];
                    }
                  },
                );
                return cleared;
              });
              form.setEducationFirstError((prev) => {
                if (!prev) return prev;
                const firstKey = prev.replace(
                  "education-",
                  "",
                ) as keyof UserData["education"];
                const updatedKeys = Object.keys(
                  patch,
                ) as (keyof typeof patch)[];
                if (updatedKeys.includes(firstKey) && patch[firstKey]) {
                  return null;
                }
                return prev;
              });
            }}
          />
        );
      case "workExperience":
        return (
          <WorkExperience
            data={form.userData.workExperience}
            errors={form.workExpErrors}
            onExperienceTypeChange={(experienceType) => {
              form.setUserData((prev) => ({
                ...prev,
                workExperience: {
                  ...prev.workExperience,
                  experienceType,
                },
              }));
              if (experienceType === "fresher") {
                form.setWorkExpErrors({});
                form.setWorkExpFirstError(null);
              }
            }}
            onEntryChange={(index, patch) => {
              form.setUserData((prev) => {
                const nextEntries = prev.workExperience.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  workExperience: {
                    ...prev.workExperience,
                    entries: nextEntries,
                  },
                };
              });
              form.setWorkExpErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.entries && cleared.entries[index]) {
                  const updated = {
                    ...(cleared.entries[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  if (patch.current === true) {
                    delete updated.to;
                  }
                  cleared.entries = { ...cleared.entries, [index]: updated };
                }
                return cleared;
              });
              form.setWorkExpFirstError((prev) => {
                if (!prev) return prev;
                const [, idxStr, field] = prev.split("-");
                const idxNum = Number(idxStr);
                if (
                  idxNum === index &&
                  field === "to" &&
                  patch.current === true
                ) {
                  return null;
                }
                if (
                  idxNum === index &&
                  (Object.keys(patch) as string[]).includes(field) &&
                  patch[field as keyof WorkEntry]
                ) {
                  return null;
                }
                return prev;
              });
            }}
            onAddEntry={() => {
              form.setUserData((prev) => ({
                ...prev,
                workExperience: {
                  ...prev.workExperience,
                  entries: [
                    ...prev.workExperience.entries,
                    {
                      company: "",
                      role: "",
                      from: "",
                      to: "",
                      description: "",
                    },
                  ],
                },
              }));
            }}
            onRemoveEntry={(index) => {
              form.setUserData((prev) => {
                const nextEntries = prev.workExperience.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  workExperience: {
                    ...prev.workExperience,
                    entries: nextEntries,
                  },
                };
              });
              form.setWorkExpErrors({});
              form.setWorkExpFirstError(null);
            }}
          />
        );
      case "skills":
        return (
          <Skills
            data={form.userData.skills}
            errors={form.skillErrors}
            onChange={(patch) => {
              form.setUserData((prev) => ({
                ...prev,
                skills: { ...prev.skills, ...patch },
              }));
              form.setSkillErrors((prev) => {
                const cleared = { ...prev };
                if (
                  typeof patch.skills === "string" &&
                  patch.skills.trim().length > 0
                ) {
                  delete (cleared as Record<string, string>).skills;
                }
                if ("primaryList" in patch) {
                  delete (cleared as Record<string, string>).skills;
                }
                return cleared;
              });
              form.setSkillFirstError((prev) => {
                if (!prev) return prev;
                if (
                  typeof patch.skills === "string" &&
                  patch.skills.trim().length > 0
                )
                  return null;
                if ("primaryList" in patch) return null;
                return prev;
              });
            }}
          />
        );
      case "projects":
        return (
          <Projects
            data={form.userData.projects}
            errors={form.projectErrors}
            onNoProjectsChange={(val) => {
              form.setUserData((prev) => ({
                ...prev,
                projects: { ...prev.projects, noProjects: val },
              }));
              if (val) {
                form.setProjectErrors({});
                form.setProjectFirstError(null);
              }
            }}
            onEntryChange={(index, patch) => {
              form.setUserData((prev) => {
                const nextEntries = prev.projects.entries.map((entry, idx) =>
                  idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  projects: { ...prev.projects, entries: nextEntries },
                };
              });
              form.setProjectErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.entries && cleared.entries[index]) {
                  const updated = {
                    ...(cleared.entries[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  if (patch.current === true) {
                    delete updated.to;
                  }
                  cleared.entries = { ...cleared.entries, [index]: updated };
                }
                return cleared;
              });
              form.setProjectFirstError((prev) => {
                if (!prev) return prev;
                const [, idxStr, field] = prev.split("-");
                const idxNum = Number(idxStr);
                if (
                  idxNum === index &&
                  field === "to" &&
                  patch.current === true
                ) {
                  return null;
                }
                if (
                  idxNum === index &&
                  (Object.keys(patch) as string[]).includes(field) &&
                  patch[field as keyof ProjectEntry]
                ) {
                  return null;
                }
                return prev;
              });
            }}
            onAddEntry={() =>
              form.setUserData((prev) => ({
                ...prev,
                projects: {
                  ...prev.projects,
                  entries: [
                    ...prev.projects.entries,
                    {
                      projectName: "",
                      projectDescription: "",
                      current: false,
                      from: "",
                      to: "",
                    },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) => {
              form.setUserData((prev) => {
                const nextEntries = prev.projects.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  projects: { ...prev.projects, entries: nextEntries },
                };
              });
              form.setProjectErrors({});
              form.setProjectFirstError(null);
            }}
          />
        );
      case "achievements":
        return (
          <Achievements
            data={form.userData.achievements}
            onEntryChange={(index, patch) =>
              form.setUserData((prev) => {
                const nextEntries = prev.achievements.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  achievements: { ...prev.achievements, entries: nextEntries },
                };
              })
            }
            onAddEntry={() =>
              form.setUserData((prev) => ({
                ...prev,
                achievements: {
                  ...prev.achievements,
                  entries: [
                    ...prev.achievements.entries,
                    { title: "", issueDate: "", description: "" },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) =>
              form.setUserData((prev) => {
                const nextEntries = prev.achievements.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  achievements: { ...prev.achievements, entries: nextEntries },
                };
              })
            }
          />
        );
      case "certification":
        return (
          <Certification
            data={form.userData.certification}
            errors={form.certErrors}
            suppressDeleteWarning
            onToggleNoCertification={(value) => {
              form.setUserData((prev) => {
                const nextEntries = prev.certification.entries.length
                  ? prev.certification.entries
                  : [
                      {
                        name: "",
                        issueDate: "",
                        expiryDate: "",
                        organization: "",
                        credentialIdUrl: "",
                      },
                    ];
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    noCertification: value,
                    entries: nextEntries,
                  },
                };
              });
              if (value) {
                form.setCertErrors({});
                form.setCertFirstError(null);
              }
            }}
            onEntryChange={(index, patch) => {
              form.setUserData((prev) => {
                const nextEntries = prev.certification.entries.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    entries: nextEntries,
                  },
                };
              });
              form.setCertErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.entries && cleared.entries[index]) {
                  const updated = {
                    ...(cleared.entries[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  cleared.entries = { ...cleared.entries, [index]: updated };
                }
                return cleared;
              });
              form.setCertFirstError((prev) => {
                if (!prev) return prev;
                const [, idxStr, field] = prev.split("-");
                const idxNum = Number(idxStr);
                if (
                  idxNum === index &&
                  (Object.keys(patch) as string[]).includes(field) &&
                  patch[field as keyof CertificationEntry]
                ) {
                  return null;
                }
                return prev;
              });
            }}
            onAddEntry={() =>
              form.setUserData((prev) => ({
                ...prev,
                certification: {
                  ...prev.certification,
                  entries: [
                    ...prev.certification.entries,
                    {
                      name: "",
                      issueDate: "",
                      expiryDate: "",
                      organization: "",
                      credentialIdUrl: "",
                    },
                  ],
                },
              }))
            }
            onRemoveEntry={(index) => {
              form.setUserData((prev) => {
                const nextEntries = prev.certification.entries.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  certification: {
                    ...prev.certification,
                    entries: nextEntries,
                  },
                };
              });
              form.setCertErrors({});
              form.setCertFirstError(null);
            }}
          />
        );
      case "preference":
        return (
          <Preference
            data={form.userData.preference}
            errors={form.preferenceErrors}
            hideCompanySize
            onChange={(patch) => {
              form.setUserData((prev) => ({
                ...prev,
                preference: { ...prev.preference, ...patch },
              }));
              if (
                "hasWorkVisa" in patch &&
                typeof patch.hasWorkVisa === "boolean"
              ) {
                form.setPreferenceErrors((prev) => {
                  if (!prev.hasWorkVisa) return prev;
                  return { ...prev, hasWorkVisa: undefined };
                });
                form.setPreferenceFirstError(null);
              }
            }}
          />
        );
      case "otherDetails":
        return (
          <OtherDetails
            data={form.userData.otherDetails}
            errors={form.otherDetailsErrors}
            hideCareerStage
            onChange={(patch) => {
              form.setUserData((prev) => ({
                ...prev,
                otherDetails: { ...prev.otherDetails, ...patch },
              }));
              form.setOtherDetailsErrors((prev) => {
                const cleared = { ...prev };
                (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                  (key) => {
                    if (patch[key]) {
                      delete (cleared as Record<string, unknown>)[
                        key as string
                      ];
                    }
                  },
                );
                return cleared;
              });
              form.setOtherDetailsFirstError((prev) => {
                if (!prev) return prev;
                const updatedKeys = Object.keys(patch) as Array<
                  keyof typeof patch
                >;
                if (
                  updatedKeys.some(
                    (key) =>
                      prev === `otherDetails-${String(key)}` && patch[key],
                  )
                ) {
                  return null;
                }
                return prev;
              });
            }}
            onLanguageChange={(index, patch) => {
              form.setUserData((prev) => {
                const nextLanguages = prev.otherDetails.languages.map(
                  (entry, idx) =>
                    idx === index ? { ...entry, ...patch } : entry,
                );
                return {
                  ...prev,
                  otherDetails: {
                    ...prev.otherDetails,
                    languages: nextLanguages,
                  },
                };
              });
              form.setOtherDetailsErrors((prev) => {
                const cleared = { ...prev };
                if (cleared.languages && cleared.languages[index]) {
                  const updated = {
                    ...(cleared.languages[index] as Record<string, string>),
                  };
                  (Object.keys(patch) as (keyof typeof patch)[]).forEach(
                    (key) => {
                      if (patch[key]) {
                        delete updated[key as string];
                      }
                    },
                  );
                  cleared.languages = {
                    ...cleared.languages,
                    [index]: updated,
                  };
                }
                return cleared;
              });
              form.setOtherDetailsFirstError((prev) => {
                if (!prev) return prev;
                const parts = prev.split("-");
                if (parts[0] === "otherDetails" && parts[1] === "lang") {
                  const idxNum = Number(parts[2]);
                  const field = parts[3] as keyof LanguageEntry;
                  if (
                    idxNum === index &&
                    (Object.keys(patch) as string[]).includes(field) &&
                    patch[field]
                  ) {
                    return null;
                  }
                }
                return prev;
              });
            }}
            onAddLanguage={() =>
              form.setUserData((prev) => ({
                ...prev,
                otherDetails: {
                  ...prev.otherDetails,
                  languages: [
                    ...prev.otherDetails.languages,
                    { language: "", speaking: "", reading: "", writing: "" },
                  ],
                },
              }))
            }
            onRemoveLanguage={(index) => {
              form.setUserData((prev) => {
                const nextLanguages = prev.otherDetails.languages.filter(
                  (_, idx) => idx !== index,
                );
                return {
                  ...prev,
                  otherDetails: {
                    ...prev.otherDetails,
                    languages: nextLanguages,
                  },
                };
              });
              form.setOtherDetailsErrors({});
              form.setOtherDetailsFirstError(null);
            }}
          />
        );
      case "reviewAgree":
        return (
          <ReviewAndAgree
            data={form.userData.reviewAgree}
            onChange={(patch) =>
              form.setUserData((prev) => ({
                ...prev,
                reviewAgree: { ...prev.reviewAgree, ...patch },
              }))
            }
          />
        );
      default:
        return null;
    }
  }, [form]);

  // Focus management effects
  useEffect(() => {
    if (form.basicInfoFirstError && form.activeStep.key === "basicInfo") {
      const el = document.getElementById(form.basicInfoFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.basicInfoFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.educationFirstError && form.activeStep.key === "education") {
      const el = document.getElementById(form.educationFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.educationFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.workExpFirstError && form.activeStep.key === "workExperience") {
      const el = document.getElementById(form.workExpFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.workExpFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.skillFirstError && form.activeStep.key === "skills") {
      const el = document.getElementById(form.skillFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.skillFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.projectFirstError && form.activeStep.key === "projects") {
      const el = document.getElementById(form.projectFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.projectFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.certFirstError && form.activeStep.key === "certification") {
      const el = document.getElementById(form.certFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.certFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.preferenceFirstError && form.activeStep.key === "preference") {
      const el = document.getElementById(form.preferenceFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.preferenceFirstError, form.activeStep.key]);

  useEffect(() => {
    if (form.otherDetailsFirstError && form.activeStep.key === "otherDetails") {
      const el = document.getElementById(form.otherDetailsFirstError);
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
      }
    }
  }, [form.otherDetailsFirstError, form.activeStep.key]);

  if (form.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFF6FF]">
        <div className="text-slate-700">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF6FF] text-slate-800 flex flex-col">
      <Navbar />

      <div className="flex-1 px-4 py-6 md:px-10 md:py-10 flex justify-center">
        <div className="max-w-7xl w-full flex flex-col gap-6">
          <Header percent={form.profilePercent} />

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Sidebar steps={form.stepsState} />

            <main id="main-content" className="md:col-span-9 bg-white rounded-3xl p-8 md:p-10 shadow-lg">
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-base text-slate-700">
                    Step {form.activeStep.id}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {form.activeStep.label}
                  </h2>
                </div>
                <div className="hidden md:flex items-center gap-2 text-base text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Profile completion tracking</span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {renderForm}

                {form.finishError ? (
                  <p className="text-base font-medium text-red-800">
                    {form.finishError}
                  </p>
                ) : null}

                <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={form.handlePrevious}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    disabled={form.activeIndex === 0 || form.isUpdating}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={form.handleSaveAndNext}
                    className="px-6 py-2.5 bg-orange-900 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      form.isUpdating ||
                      (form.activeStep.key === "reviewAgree" &&
                        !form.userData.reviewAgree.agree)
                    }
                  >
                    {form.isUpdating && form.isLastStep
                      ? "Finishing..."
                      : form.isLastStep
                        ? "Finish"
                        : "Save & Next"}
                  </button>
                </div>
              </form>
            </main>
          </section>
        </div>
      </div>
    </div>
  );
}
