"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useUserDataStore } from "@/lib/userDataStore";
import { useCandidateProfileStore } from "@/lib/candidateProfileStore";
import { initialUserData } from "@/lib/userDataDefaults";
import { CandidateProfileSkeleton } from "@/components/CandidateDashboardSkeletons";
import ConfirmDialog from "@/components/a11y/ConfirmDialog";
import LiveRegion from "@/components/a11y/LiveRegion";
import { apiRequest, getApiErrorMessage } from "@/lib/api-client";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  FolderKanban,
  Languages,
  Calendar,
  Building2,
  User,
  Pencil,
} from "lucide-react";

const fallbackText = "Data unavailable";
const toTrimmed = (value?: unknown) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value).trim();
  return "";
};
const withFallback = (value?: string) => {
  const trimmed = toTrimmed(value);
  return trimmed ? trimmed : fallbackText;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const toYearDate = (value?: string) => {
  const trimmed = toTrimmed(value);
  if (!trimmed) return "";
  const match = trimmed.match(/\d{4}/);
  return match ? `${match[0]}-01-01` : "";
};
const toDateValue = (value?: string) => {
  const trimmed = toTrimmed(value);
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  return trimmed;
};
const toYearLabel = (value?: string) => {
  const trimmed = toTrimmed(value);
  if (!trimmed) return "";
  const match = trimmed.match(/\d{4}/);
  return match ? match[0] : "";
};
const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const toMonthYearLabel = (value?: string) => {
  const trimmed = toTrimmed(value);
  if (!trimmed) return "";
  const match = trimmed.match(/^(\d{4})-(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIndex = Number(match[2]) - 1;
    if (monthIndex >= 0 && monthIndex < monthLabels.length) {
      return `${monthLabels[monthIndex]} ${year}`;
    }
    return year;
  }
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  return trimmed;
};

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const rawUserData = useUserDataStore((s) => s.userData);
  const resetUserData = useUserDataStore((s) => s.resetUserData);
  const isProfileLoading = useCandidateProfileStore((s) => s.isLoading);
  const candidateProfile = useCandidateProfileStore((s) => s.profile);
  const resetCandidateProfile = useCandidateProfileStore((s) => s.reset);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState<string | null>(
    null
  );
  const userData = useMemo(
    () => ({
      ...initialUserData,
      ...rawUserData,
      basicInfo: { ...initialUserData.basicInfo, ...rawUserData?.basicInfo },
      workExperience: {
        ...initialUserData.workExperience,
        ...rawUserData?.workExperience,
      },
    education: { ...initialUserData.education, ...rawUserData?.education },
      skills: { ...initialUserData.skills, ...rawUserData?.skills },
      projects: { ...initialUserData.projects, ...rawUserData?.projects },
      achievements: {
        ...initialUserData.achievements,
        ...rawUserData?.achievements,
      },
      certification: {
        ...initialUserData.certification,
        ...rawUserData?.certification,
      },
      preference: { ...initialUserData.preference, ...rawUserData?.preference },
      otherDetails: {
        ...initialUserData.otherDetails,
        ...rawUserData?.otherDetails,
      },
      accessibilityNeeds: {
        ...(initialUserData.accessibilityNeeds ?? {
          categories: [],
          accommodationNeed: "",
          disclosurePreference: "",
          accommodations: [],
        }),
        ...rawUserData?.accessibilityNeeds,
      },
      reviewAgree: {
        ...initialUserData.reviewAgree,
        ...rawUserData?.reviewAgree,
      },
    }),
    [rawUserData]
  );

  const {
    basicInfo,
    education,
    workExperience,
    skills,
    projects,
    achievements,
    certification,
    preference,
    otherDetails,
  } = userData;
  const displayName =
    [basicInfo.firstName, basicInfo.lastName]
      .map(toTrimmed)
      .filter(Boolean)
      .join(" ") || fallbackText;
  const careerStageLabel = toTrimmed(otherDetails.careerStage);
  const emailLabel = withFallback(basicInfo.email);
  const phoneLabel = withFallback(basicInfo.phone);
  const locationLabel = withFallback(basicInfo.location);
  const linkedInUrl = toTrimmed(basicInfo.linkedinUrl);
  const workEntries = workExperience.entries.filter(
    (entry) =>
      toTrimmed(entry.role) ||
      toTrimmed(entry.company) ||
      toTrimmed(entry.description) ||
      toTrimmed(entry.from) ||
      toTrimmed(entry.to)
  );
  const projectEntries = projects.entries.filter(
    (project) =>
      toTrimmed(project.projectName) ||
      toTrimmed(project.projectDescription)
  );
  const primarySkills = (skills.primaryList ?? [])
    .map((skill) => toTrimmed(skill.name))
    .filter(Boolean);
  const certificationEntries = certification.entries.filter(
    (cert) =>
      toTrimmed(cert.name) ||
      toTrimmed(cert.organization) ||
      toTrimmed(cert.issueDate)
  );
  const languageEntries = otherDetails.languages.filter((lang) =>
    toTrimmed(lang.language)
  );
  const jobTypeList = preference.jobType.map(toTrimmed).filter(Boolean);
  const desiredSalaryLabel = withFallback(otherDetails.desiredSalary);
  const availabilityValue = toTrimmed(otherDetails.availability).toLowerCase();
  const availabilityLabel =
    availabilityValue === "yes"
      ? "Yes"
      : availabilityValue === "no"
        ? "No"
        : withFallback(otherDetails.availability);
  const educationEntries = useMemo(() => {
    const profileRoot = isRecord(candidateProfile) ? candidateProfile : null;
    const verifiedProfile = isRecord(profileRoot?.verified_profile)
      ? profileRoot?.verified_profile
      : isRecord(profileRoot?.verifiedProfile)
      ? profileRoot?.verifiedProfile
      : null;
    const rawEducation = Array.isArray(verifiedProfile?.education)
      ? verifiedProfile.education
      : Array.isArray(profileRoot?.education)
      ? profileRoot.education
      : [];
    const mapped = rawEducation
      .filter(isRecord)
      .map((entry) => ({
        id: entry.id ?? entry.education_id ?? entry.educationId,
        courseName: toTrimmed(
          entry.course_name ?? entry.courseName ?? entry.degree ?? entry.course
        ),
        major: toTrimmed(entry.major ?? entry.field_of_study),
        institution: toTrimmed(entry.institution ?? entry.school),
        graduationDate:
          toDateValue(
            typeof entry.graduation_date === "string"
              ? entry.graduation_date
              : typeof entry.graduationDate === "string"
              ? entry.graduationDate
              : typeof entry.end_date === "string"
              ? entry.end_date
              : typeof entry.to === "string"
              ? entry.to
              : undefined
          ) ||
          toYearDate(
            typeof entry.end_year === "string" || typeof entry.end_year === "number"
              ? String(entry.end_year)
              : typeof entry.graduation_year === "string" ||
                typeof entry.graduation_year === "number"
              ? String(entry.graduation_year)
              : undefined
          ),
      }))
      .filter(
        (entry) =>
          entry.courseName || entry.major || entry.institution || entry.graduationDate
      );
    if (mapped.length > 0) return mapped;
    return [
      {
        id: undefined,
        courseName: toTrimmed(education.courseName),
        major: toTrimmed(education.major),
        institution: toTrimmed(education.institution),
        graduationDate: toDateValue(education.graduationDate),
      },
    ].filter(
      (entry) =>
        entry.courseName || entry.major || entry.institution || entry.graduationDate
    );
  }, [candidateProfile, education]);

  const deleteAccountStatusMessage = deleteAccountError || deleteAccountSuccess;
  const isDeleteAccountDisabled = isDeletingAccount;

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    setDeleteAccountSuccess(null);
    setIsDeleteAccountDialogOpen(false);

    try {
      await apiRequest("/api/user/me", {
        method: "DELETE",
      });
      resetCandidateProfile();
      resetUserData();
      await signOut();
      router.replace("/login-talent");
    } catch (error) {
      setDeleteAccountError(
        getApiErrorMessage(
          error,
          "Failed to delete your account. Please try again."
        )
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const openDeleteAccountDialog = () => {
    setDeleteAccountError(null);
    setIsDeleteAccountDialogOpen(true);
  };

  const closeDeleteAccountDialog = () => {
    setIsDeleteAccountDialogOpen(false);
  };

  if (isProfileLoading) {
    return <CandidateProfileSkeleton />;
  }

  return (
    <div className="max-w-360 mx-auto space-y-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 overflow-hidden">
            {basicInfo.profilePhoto ? (
              <img
                src={basicInfo.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={64} />
            )}
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {displayName}
                </h1>
                {careerStageLabel ? (
                  <p className="text-lg text-slate-500 font-medium">
                    {careerStageLabel}
                  </p>
                ) : null}
              </div>
              <Link
                href="/dashboard/profile-update
                "
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-md shadow-orange-200"
              >
                <Pencil size={16} />
                <span>Edit Profile</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={18} className="text-orange-500" />
                <span>{emailLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={18} className="text-orange-500" />
                <span>{phoneLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={18} className="text-orange-500" />
                <span>{locationLabel}</span>
              </div>
              {linkedInUrl ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Linkedin size={18} className="text-orange-500" />
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-600 transition-colors"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <Linkedin size={18} className="text-orange-500" />
                  <span>{fallbackText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Work Experience */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Work Experience
              </h2>
            </div>
            {workEntries.length === 0 ? (
              <p className="text-slate-500 italic">{fallbackText}.</p>
            ) : (
              <div className="space-y-8">
                {workEntries.map((exp, idx) => {
                  const roleLabel = toTrimmed(exp.role) || fallbackText;
                  const companyLabel = toTrimmed(exp.company) || fallbackText;
                  const fromLabel = withFallback(toMonthYearLabel(exp.from));
                  const toLabel = exp.current
                    ? "Present"
                    : withFallback(toMonthYearLabel(exp.to));
                  const descriptionLabel =
                    toTrimmed(exp.description) || fallbackText;

                  return (
                    <div
                      key={idx}
                      className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-orange-100 last:before:hidden"
                    >
                      <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <div className="space-y-2">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h3 className="font-bold text-slate-800 text-lg">
                            {roleLabel}
                          </h3>
                          <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            Duration: {fromLabel} - {toLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Building2 size={16} />
                          <span>{companyLabel}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                          {descriptionLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Projects */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <FolderKanban className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Projects</h2>
            </div>
            {projectEntries.length === 0 ? (
              <p className="text-slate-500 italic">{fallbackText}.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectEntries.map((project, idx) => {
                  const projectNameLabel =
                    toTrimmed(project.projectName) || fallbackText;
                  const projectDescLabel =
                    toTrimmed(project.projectDescription) || fallbackText;
                  const projectFromLabel =
                    toTrimmed(project.from) || fallbackText;
                  const projectToLabel = project.current
                    ? "Present"
                    : toTrimmed(project.to) || fallbackText;

                  return (
                    <div
                      key={idx}
                      className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800">
                          {projectNameLabel}
                        </h3>
                        <Calendar size={16} className="text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        {projectFromLabel} - {projectToLabel}
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {projectDescLabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

            {/* Education */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="text-orange-600" />
                <h2 className="text-xl font-bold text-slate-900">Education</h2>
              </div>
              {educationEntries.length > 0 ? (
                <div className="space-y-6">
                  {educationEntries.map((entry, index) => {
                    const courseLabel = withFallback(entry.courseName);
                    const majorLabel = withFallback(entry.major);
                    const institutionLabel = withFallback(entry.institution);
                    const graduationYear = toYearLabel(entry.graduationDate);
                    const graduationLabel = graduationYear
                      ? graduationYear
                      : withFallback(entry.graduationDate);

                    return (
                      <div
                        key={
                          typeof entry.id === "string" || typeof entry.id === "number"
                            ? String(entry.id)
                            : `${entry.courseName}-${index}`
                        }
                        className="flex justify-between items-start flex-wrap gap-2"
                      >
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">
                            {courseLabel} in {majorLabel}
                          </h3>
                          <p className="text-slate-600 font-medium">
                            {institutionLabel}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          Graduated: {graduationLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500">No education details provided.</p>
              )}
            </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Skills */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Code className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {primarySkills.length > 0 ? (
                primarySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-100"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 italic">{fallbackText}.</p>
              )}
            </div>
          </section>

          {/* Certifications */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Certifications
              </h2>
            </div>
            {certificationEntries.length === 0 ? (
              <p className="text-slate-500 italic">{fallbackText}.</p>
            ) : (
              <div className="space-y-4">
                {certificationEntries.map((cert, idx) => {
                  const certName = toTrimmed(cert.name) || fallbackText;
                  const certOrg = toTrimmed(cert.organization) || fallbackText;
                  const certDate = toTrimmed(cert.issueDate) || fallbackText;

                  return (
                    <div key={idx} className="space-y-1">
                      <h3 className="font-bold text-slate-800 text-sm">
                        {certName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {certOrg} - {certDate}
                      </p>
                      {cert.credentialIdUrl && (
                        <a
                          href={cert.credentialIdUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:underline"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Languages */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Languages</h2>
            </div>
            <div className="space-y-4">
              {languageEntries.length > 0 ? (
                languageEntries.map((lang, idx) => {
                  const languageLabel =
                    toTrimmed(lang.language) || fallbackText;
                  const speakingLabel =
                    toTrimmed(lang.speaking) || fallbackText;
                  const readingLabel =
                    toTrimmed(lang.reading) || fallbackText;
                  const writingLabel =
                    toTrimmed(lang.writing) || fallbackText;

                  return (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">
                        {languageLabel}
                      </span>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          S: {speakingLabel}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          R: {readingLabel}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          W: {writingLabel}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 italic">{fallbackText}.</p>
              )}
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Job Types
                </p>
                <div className="flex flex-wrap gap-2">
                  {jobTypeList.length > 0 ? (
                    jobTypeList.map((type, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-md"
                      >
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      {fallbackText}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="pt-2 border-t border-slate-50">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-800">
                      Desired Salary:
                  </span>{" "}
                  {desiredSalaryLabel}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">
                    Availability:
                  </span>{" "}
                  {availabilityLabel}
                </p>
              </div>
            </div>
          </div>
          </section>

          {/* Account Actions */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-red-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Delete Account
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              Deleting your account removes your login and access to Enabled
              Talent. This action cannot be undone.
            </p>
            {deleteAccountStatusMessage ? (
              <LiveRegion
                politeness={deleteAccountError ? "assertive" : "polite"}
                visible
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  deleteAccountError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {deleteAccountStatusMessage}
              </LiveRegion>
            ) : null}
            <button
              type="button"
              onClick={openDeleteAccountDialog}
              disabled={isDeleteAccountDisabled}
              className="mt-4 min-h-[44px] w-full rounded-xl border border-red-300 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </section>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteAccountDialogOpen}
        title="Delete your account?"
        message="This permanently deletes your account and ends access to Enabled Talent. You can sign up again, but this action cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Keep account"
        variant="danger"
        onConfirm={handleDeleteAccount}
        onCancel={closeDeleteAccountDialog}
      />
    </div>
  );
}
