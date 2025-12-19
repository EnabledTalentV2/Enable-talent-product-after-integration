"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/lib/userDataStore";
import { getCurrentUser, hasStoredUsers } from "@/lib/localUserStore";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { computeProfileCompletion } from "@/lib/profileCompletion";

const cardClass = "rounded-2xl bg-white p-6 shadow-sm";
const titleClass = "text-lg font-semibold text-slate-900";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const valueClass = "text-sm text-slate-800";

export default function DashboardPage() {
  const router = useRouter();
  const userData = useUserDataStore((s) => s.userData);
  const setUserData = useUserDataStore((s) => s.setUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { percent: profilePercent } = useMemo(() => computeProfileCompletion(userData), [userData]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const useLocalAuth = hasStoredUsers();
        const localUser = getCurrentUser();

        if (useLocalAuth) {
          if (!localUser?.userData) {
            router.replace("/login");
            return;
          }

          if (active) {
            setUserData(() => localUser.userData);
            setError(null);
            setLoading(false);
          }
          return;
        }

        const response = await fetch("/api/user/me", { credentials: "include" });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load user data.");
        }

        const data = await response.json();
        if (active) {
          setUserData(() => data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load your dashboard right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [router, setUserData]);

  if (loading) {
    return <div className="py-10 text-sm text-slate-600">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="py-10 text-sm font-medium text-red-600">{error}</div>;
  }

  return (
    <section className="space-y-8">
      <DashboardProfilePrompt percent={profilePercent} />

      <header className="space-y-1">
        <p className="text-sm font-semibold text-amber-700">User Dashboard</p>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {userData.basicInfo.firstName || "there"}.
        </h1>
        <p className="text-sm text-slate-600">{userData.basicInfo.currentStatus}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className={titleClass}>Basic Info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className={labelClass}>Name</p>
              <p className={valueClass}>
                {userData.basicInfo.firstName} {userData.basicInfo.lastName}
              </p>
            </div>
            <div>
              <p className={labelClass}>Email</p>
              <p className={valueClass}>{userData.basicInfo.email || "Not provided"}</p>
            </div>
            <div>
              <p className={labelClass}>Phone</p>
              <p className={valueClass}>{userData.basicInfo.phone}</p>
            </div>
            <div>
              <p className={labelClass}>Location</p>
              <p className={valueClass}>{userData.basicInfo.location}</p>
            </div>
            <div>
              <p className={labelClass}>Citizenship</p>
              <p className={valueClass}>{userData.basicInfo.citizenshipStatus}</p>
            </div>
            <div>
              <p className={labelClass}>Gender</p>
              <p className={valueClass}>{userData.basicInfo.gender}</p>
            </div>
            <div>
              <p className={labelClass}>Ethnicity</p>
              <p className={valueClass}>{userData.basicInfo.ethnicity}</p>
            </div>
            <div>
              <p className={labelClass}>LinkedIn</p>
              <p className={valueClass}>{userData.basicInfo.linkedinUrl || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Education</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className={labelClass}>Institution</p>
              <p className={valueClass}>{userData.education.institution || "Not provided"}</p>
            </div>
            <div>
              <p className={labelClass}>Major</p>
              <p className={valueClass}>{userData.education.major || "Not provided"}</p>
            </div>
            <div>
              <p className={labelClass}>Course</p>
              <p className={valueClass}>{userData.education.courseName || "Not provided"}</p>
            </div>
            <div>
              <p className={labelClass}>Graduation Date</p>
              <p className={valueClass}>{userData.education.graduationDate || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(userData.skills.primaryList || []).length > 0 ? (
              userData.skills.primaryList?.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className={valueClass}>No skills added yet.</p>
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Preferences</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className={labelClass}>Company Size</p>
              <p className={valueClass}>{userData.preference.companySize.join(", ")}</p>
            </div>
            <div>
              <p className={labelClass}>Job Type</p>
              <p className={valueClass}>{userData.preference.jobType.join(", ")}</p>
            </div>
            <div>
              <p className={labelClass}>Search Status</p>
              <p className={valueClass}>{userData.preference.jobSearch.join(", ")}</p>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Work Experience</h2>
          <div className="mt-4 space-y-4">
            {userData.workExperience.entries.length === 0 ? (
              <p className={valueClass}>No experience added yet.</p>
            ) : (
              userData.workExperience.entries.map((entry, index) => (
                <div key={`${entry.company}-${index}`} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{entry.role}</p>
                  <p className="text-sm text-slate-600">{entry.company}</p>
                  <p className="text-xs text-slate-500">
                    {entry.from || "Start"} - {entry.current ? "Present" : entry.to || "End"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Projects</h2>
          <div className="mt-4 space-y-4">
            {userData.projects.entries.length === 0 ? (
              <p className={valueClass}>No projects added yet.</p>
            ) : (
              userData.projects.entries.map((entry, index) => (
                <div key={`${entry.projectName}-${index}`} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{entry.projectName}</p>
                  <p className="text-sm text-slate-600">{entry.projectDescription}</p>
                  <p className="text-xs text-slate-500">
                    {entry.from || "Start"} - {entry.current ? "Present" : entry.to || "End"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Achievements</h2>
          <div className="mt-4 space-y-4">
            {userData.achievements.entries.length === 0 ? (
              <p className={valueClass}>No achievements added yet.</p>
            ) : (
              userData.achievements.entries.map((entry, index) => (
                <div key={`${entry.title}-${index}`} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                  <p className="text-sm text-slate-600">{entry.description}</p>
                  <p className="text-xs text-slate-500">{entry.issueDate}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Certifications</h2>
          <div className="mt-4 space-y-4">
            {userData.certification.entries.length === 0 ? (
              <p className={valueClass}>No certifications added yet.</p>
            ) : (
              userData.certification.entries.map((entry, index) => (
                <div key={`${entry.name}-${index}`} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{entry.name}</p>
                  <p className="text-sm text-slate-600">{entry.organization}</p>
                  <p className="text-xs text-slate-500">{entry.issueDate}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Other Details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className={labelClass}>Career Stage</p>
              <p className={valueClass}>{userData.otherDetails.careerStage}</p>
            </div>
            <div>
              <p className={labelClass}>Desired Salary</p>
              <p className={valueClass}>{userData.otherDetails.desiredSalary || "Not provided"}</p>
            </div>
            <div>
              <p className={labelClass}>Languages</p>
              <div className="mt-2 space-y-2">
                {userData.otherDetails.languages.map((language, index) => (
                  <div key={`${language.language}-${index}`} className="text-sm text-slate-700">
                    {language.language}: {language.speaking}, {language.reading}, {language.writing}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={titleClass}>Review &amp; Consent</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className={labelClass}>Agreed</p>
              <p className={valueClass}>{userData.reviewAgree.agree ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className={labelClass}>Discovery Channel</p>
              <p className={valueClass}>{userData.reviewAgree.discover || "Not provided"}</p>
            </div>
            <div>
              <p className={labelClass}>Comments</p>
              <p className={valueClass}>{userData.reviewAgree.comments || "None"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
