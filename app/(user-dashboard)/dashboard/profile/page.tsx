"use client";

import { useMemo } from "react";
import { useUserDataStore } from "@/lib/userDataStore";
import { initialUserData } from "@/lib/userDataDefaults";
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

export default function ProfilePage() {
  const rawUserData = useUserDataStore((s) => s.userData);
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
                  {basicInfo.firstName} {basicInfo.lastName}
                </h1>
                <p className="text-lg text-slate-500 font-medium">
                  {otherDetails.careerStage}
                </p>
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
                <span>{basicInfo.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={18} className="text-orange-500" />
                <span>{basicInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={18} className="text-orange-500" />
                <span>{basicInfo.location}</span>
              </div>
              {basicInfo.linkedinUrl && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Linkedin size={18} className="text-orange-500" />
                  <a
                    href={basicInfo.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-600 transition-colors"
                  >
                    LinkedIn Profile
                  </a>
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
            {workExperience.experienceType === "fresher" ? (
              <p className="text-slate-500 italic">
                Fresher - No work experience listed.
              </p>
            ) : (
              <div className="space-y-8">
                {workExperience.entries.map((exp, idx) => (
                  <div
                    key={idx}
                    className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-orange-100 last:before:hidden"
                  >
                    <div className="absolute left-[-4px] top-2 w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <div className="space-y-2">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <h3 className="font-bold text-slate-800 text-lg">
                          {exp.role}
                        </h3>
                        <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                          {exp.from} - {exp.current ? "Present" : exp.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Building2 size={16} />
                        <span>{exp.company}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Projects */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <FolderKanban className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Projects</h2>
            </div>
            {projects.noProjects || projects.entries.length === 0 ? (
              <p className="text-slate-500 italic">No projects listed.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.entries.map((project, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800">
                        {project.projectName}
                      </h3>
                      <Calendar size={16} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      {project.from} -{" "}
                      {project.current ? "Present" : project.to}
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {project.projectDescription}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Education */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-orange-600" />
              <h2 className="text-xl font-bold text-slate-900">Education</h2>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {education.courseName} in {education.major}
                  </h3>
                  <p className="text-slate-600 font-medium">
                    {education.institution}
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Graduated: {education.graduationDate}
                </span>
              </div>
            </div>
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
              {skills.primaryList?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-100"
                >
                  {skill}
                </span>
              ))}
              {(!skills.primaryList || skills.primaryList.length === 0) && (
                <p className="text-slate-500 italic">No skills listed.</p>
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
            {certification.noCertification ||
            certification.entries.length === 0 ? (
              <p className="text-slate-500 italic">No certifications listed.</p>
            ) : (
              <div className="space-y-4">
                {certification.entries.map((cert, idx) => (
                  <div key={idx} className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {cert.organization} • {cert.issueDate}
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
                ))}
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
              {otherDetails.languages.map((lang, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    {lang.language}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      S: {lang.speaking}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      R: {lang.reading}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      W: {lang.writing}
                    </span>
                  </div>
                </div>
              ))}
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
                  {preference.jobType.map((type, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-md"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Company Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {preference.companySize.map((size, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-md"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-50">
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">
                    Desired Salary:
                  </span>{" "}
                  {otherDetails.desiredSalary}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">
                    Availability:
                  </span>{" "}
                  {otherDetails.availability}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
