import React, { useState } from "react";
import { CandidateProfile } from "@/app/(employer)/employer/dashboard/candidates/types";
import ProfileSection from "./ProfileSection";
import SendInvitesModal from "./SendInvitesModal";
import SuccessModal from "./SuccessModal";

interface CandidateDetailProps {
  candidate: CandidateProfile | null;
}

export default function CandidateDetail({ candidate }: CandidateDetailProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSendInvites = (selectedJobIds: string[]) => {
    console.log("Sending invites for jobs:", selectedJobIds);
    // Here you would implement the actual logic to send invites
    setIsInviteModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  if (!candidate) {
    return (
      <div className="flex h-full items-center justify-center rounded-[28px] bg-white p-8 text-slate-400">
        Select a candidate to view details
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col gap-4 overflow-y-auto pr-2">
        {/* Header Card */}
        <div className="rounded-[28px] bg-[#FCD34D] p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-white/20">
                {candidate.avatarUrl ? (
                  <img
                    src={candidate.avatarUrl}
                    alt={candidate.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-yellow-800">
                    {candidate.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {candidate.name}
                </h2>
                <p className="text-sm font-medium text-slate-800">
                  {candidate.role}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-slate-900">
                {candidate.matchPercentage}%
              </span>
              <span className="text-xs font-medium text-slate-800">
                Matching
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="mt-6 w-full rounded-xl bg-[#C27803] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a36502]"
          >
            Send Invites for Jobs →
          </button>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-3">
          <ProfileSection title="About" defaultOpen>
            <p className="text-sm leading-relaxed text-slate-600">
              {candidate.about}
            </p>
          </ProfileSection>

          <ProfileSection title="Cultural Interest">
            <div className="flex flex-wrap gap-2">
              {candidate.culturalInterest.map((interest, i) => (
                <span
                  key={i}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {interest}
                </span>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            title="Education"
            count={`${candidate.education.length} added`}
          >
            <div className="space-y-4">
              {candidate.education.map((edu, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-4">
                  <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                  <p className="text-xs text-slate-400">{edu.year}</p>
                </div>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            title="Work Experience"
            count={`${candidate.workExperience.length} added`}
          >
            <div className="space-y-4">
              {candidate.workExperience.map((exp, i) => (
                <div key={i} className="border-l-2 border-slate-200 pl-4">
                  <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                  <p className="text-sm text-slate-600">
                    {exp.company} • {exp.duration}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            title="Skills"
            count={`${candidate.skills.length} added`}
          >
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            title="Projects"
            count={`${candidate.projects.length} added`}
          >
            <div className="space-y-4">
              {candidate.projects.map((project, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-slate-900">
                    {project.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            title="Achievements"
            count={`${candidate.achievements.length} added`}
          >
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {candidate.achievements.map((achievement, i) => (
                <li key={i}>{achievement}</li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection
            title="Certifications"
            count={`${candidate.certifications.length} added`}
          >
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {candidate.certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection title="Preference">
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {candidate.preferences.map((pref, i) => (
                <li key={i}>{pref}</li>
              ))}
            </ul>
          </ProfileSection>

          <ProfileSection title="Other details">
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
              {candidate.otherDetails.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          </ProfileSection>
        </div>
      </div>

      <SendInvitesModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvites={handleSendInvites}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  );
}
