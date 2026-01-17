"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfiles";
import ResumeChatPanel from "@/components/employer/ai/ResumeChatPanel";
// import CandidateDecisionButtons from "@/components/employer/candidates/CandidateDecisionButtons"; // Removed - Backend API not ready yet
import {
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  Mail,
  FileText,
  Linkedin,
  Github,
  Globe,
  Video
} from "lucide-react";
import Link from "next/link";

export default function CandidateProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const jobId = searchParams.get("jobId") || "";
  const applicationId = searchParams.get("applicationId") || "";

  // Debug logging
  console.log("[CandidateProfile] URL Params:", { slug, jobId, applicationId });
  console.log("[CandidateProfile] Full search params:", Object.fromEntries(searchParams.entries()));

  const { data: candidate, isLoading, error } = useCandidateProfile(slug || "");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C27803] border-r-transparent"></div>
        <p className="ml-4 text-slate-600">Loading candidate profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-800">Failed to load candidate profile</p>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg bg-slate-50 p-6 shadow-sm">
          <p className="text-slate-600">Candidate not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Back Link */}
      <Link
        href="/employer/dashboard/candidates"
        className="inline-flex items-center text-sm text-slate-600 hover:text-[#C27803]"
      >
        ← Back to Candidates
      </Link>

      {/* Header Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {candidate.first_name} {candidate.last_name}
              </h1>
              {candidate.is_verified && (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              {candidate.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={18} />
                  <a href={`mailto:${candidate.email}`} className="hover:text-[#C27803]">
                    {candidate.email}
                  </a>
                </div>
              )}

              {candidate.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={18} />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>
          </div>

          {candidate.resume_url && (
            <a
              href={candidate.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#C27803] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#A66602]"
            >
              View Resume
            </a>
          )}
        </div>

        {/* Bio */}
        {candidate.bio && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-slate-700">{candidate.bio}</p>
          </div>
        )}
      </div>

      {/* Candidate Actions */}
      {jobId && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Candidate Actions
          </h2>
          <button
            onClick={() => {
              // Placeholder - Backend API not ready yet
              console.log("Send invite to candidate:", slug, "for job:", jobId);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Send Invite
          </button>
        </div>
      )}

      {/* Work Preferences */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Work Preferences</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {candidate.job_type && (
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Employment Type</p>
                <p className="font-medium text-slate-900">{candidate.job_type}</p>
              </div>
            </div>
          )}

          {candidate.work_arrangement && (
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Work Mode</p>
                <p className="font-medium text-slate-900">{candidate.work_arrangement}</p>
              </div>
            </div>
          )}

          {(candidate.salary_min || candidate.salary_max) && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Expected Salary</p>
                <p className="font-medium text-slate-900">
                  {candidate.salary_min && `$${candidate.salary_min.toLocaleString()}`}
                  {candidate.salary_min && candidate.salary_max && " - "}
                  {candidate.salary_max && `$${candidate.salary_max.toLocaleString()}`}
                </p>
              </div>
            </div>
          )}

          {candidate.availability && (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Availability</p>
                <p className="font-medium text-slate-900">{candidate.availability}</p>
              </div>
            </div>
          )}

          {candidate.visa_required !== undefined && (
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Visa Sponsorship</p>
                <p className="font-medium text-slate-900">
                  {candidate.visa_required ? "Required" : "Not Required"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Data */}
      {candidate.resume_parsed && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Resume Summary</h2>

          <div className="space-y-4">
            {candidate.resume_parsed.summary && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Summary</h3>
                <p className="text-slate-700">{candidate.resume_parsed.summary}</p>
              </div>
            )}

            {candidate.resume_parsed.skills && candidate.resume_parsed.skills.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.resume_parsed.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {candidate.resume_parsed.experience && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Experience</h3>
                <p className="whitespace-pre-wrap text-slate-700">
                  {candidate.resume_parsed.experience}
                </p>
              </div>
            )}

            {candidate.resume_parsed.education && (
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Education</h3>
                <p className="whitespace-pre-wrap text-slate-700">
                  {candidate.resume_parsed.education}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Links & Media */}
      {(candidate.linkedin || candidate.github || candidate.portfolio || candidate.video_pitch) && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Links & Media</h2>

          <div className="flex flex-wrap gap-4">
            {candidate.linkedin && (
              <a
                href={candidate.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition-colors hover:border-[#C27803] hover:text-[#C27803]"
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </a>
            )}

            {candidate.github && (
              <a
                href={candidate.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition-colors hover:border-[#C27803] hover:text-[#C27803]"
              >
                <Github size={20} />
                <span>GitHub</span>
              </a>
            )}

            {candidate.portfolio && (
              <a
                href={candidate.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition-colors hover:border-[#C27803] hover:text-[#C27803]"
              >
                <Globe size={20} />
                <span>Portfolio</span>
              </a>
            )}

            {candidate.video_pitch && (
              <a
                href={candidate.video_pitch}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition-colors hover:border-[#C27803] hover:text-[#C27803]"
              >
                <Video size={20} />
                <span>Video Pitch</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* AI Resume Chat */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm" style={{ height: "600px" }}>
        <ResumeChatPanel
          resumeSlug={slug || ""}
          candidateName={`${candidate.first_name} ${candidate.last_name}`}
        />
      </div>
    </div>
  );
}
