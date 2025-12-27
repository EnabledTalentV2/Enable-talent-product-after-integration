"use client";

import React, { useState } from "react";
import JobHeader from "./components/JobHeader";
import CandidateList from "./components/CandidateList";
import CandidateDetail from "./components/CandidateDetail";
import { CandidateProfile, JobInfo, JobStats } from "./types";

// --- Mock Data ---

const MOCK_JOB_INFO: JobInfo = {
  title: "UI/UX Designer",
  company: "Meta",
  location: "Allentown, New Mexico 31134",
  postedTime: "12 hrs ago",
  status: "Active",
};

const MOCK_JOB_STATS: JobStats = {
  accepted: 102,
  declined: 4,
  requestsSent: 25,
  matchingCandidates: 9,
};

const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: "1",
    name: "Nalley Heather D.",
    role: "Website Developer",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 97,
    status: "Active",
    isBestMatch: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about:
      "I'm Nalley, a Product & User Experience Designer passionate about building products and services that solve real-world problems. My work has enabled me to gather a wide range of experiences, including leading, managing, and building multi-disciplinary design teams, and defining vision and designing products, services, brand identity, digital ad campaigns, and interactive design for various emerging platforms.",
    culturalInterest: ["Collaborative", "Innovative", "Fast-paced"],
    education: [
      {
        degree: "Master of Design",
        institution: "University of California",
        year: "2018 - 2020",
      },
      {
        degree: "Bachelor of Arts",
        institution: "University of California",
        year: "2014 - 2018",
      },
    ],
    workExperience: [
      {
        role: "Senior Product Designer",
        company: "Google",
        duration: "2020 - Present",
        description:
          "Leading the design of the new Google Pay app. Responsible for the end-to-end design process, from research to launch.",
      },
    ],
    skills: [
      "Figma",
      "Sketch",
      "Adobe XD",
      "Prototyping",
      "User Research",
      "Wireframing",
    ],
    projects: [
      {
        name: "E-commerce Redesign",
        description: "Redesigned the checkout flow for a major retailer.",
      },
    ],
    achievements: ["Best Design Award 2021", "Speaker at UX Conf 2022"],
    certifications: ["Google UX Design Certificate"],
    preferences: ["Remote", "Full-time"],
    otherDetails: ["Available immediately"],
  },
  {
    id: "2",
    name: "Jennifer Allison",
    role: "UX Designer",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 92,
    status: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Passionate UX Designer with a focus on accessibility.",
    culturalInterest: ["Inclusive", "Diverse"],
    education: [],
    workExperience: [],
    skills: ["Figma", "Accessibility"],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "3",
    name: "Henry Creel",
    role: "Marketing Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 91,
    status: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Data-driven marketing analyst.",
    culturalInterest: ["Data-driven"],
    education: [],
    workExperience: [],
    skills: ["Google Analytics", "SQL"],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "4",
    name: "Milley Arthur",
    role: "Data Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 82,
    status: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Experienced data analyst.",
    culturalInterest: [],
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
  {
    id: "5",
    name: "Henry Creel",
    role: "Marketing Analyst",
    location: "Allentown, New Mexico 31134",
    experience: "12 Yrs",
    matchPercentage: 81,
    status: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    about: "Marketing specialist.",
    culturalInterest: [],
    education: [],
    workExperience: [],
    skills: [],
    projects: [],
    achievements: [],
    certifications: [],
    preferences: [],
    otherDetails: [],
  },
];

const TABS = [
  { id: "accepted", label: "Accepted" },
  { id: "declined", label: "Declined" },
  { id: "request_sent", label: "Request sent" },
  { id: "matching", label: "Matching" },
] as const;

export default function CandidatesPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("matching");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    MOCK_CANDIDATES[0].id
  );

  const selectedCandidate =
    MOCK_CANDIDATES.find((c) => c.id === selectedCandidateId) || null;

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:h-[calc(100vh-120px)]">
      {/* Top Section: Job Header */}
      <div className="shrink-0">
        <JobHeader jobInfo={MOCK_JOB_INFO} stats={MOCK_JOB_STATS} />
      </div>

      {/* Main Content: Split View */}
      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        {/* Left Column: List */}
        <div className="flex flex-1 flex-col gap-4 lg:max-w-[480px]">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#C27803] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Candidate List */}
          <div className="min-h-0 flex-1 rounded-[28px] bg-white p-4 shadow-sm">
            <CandidateList
              candidates={MOCK_CANDIDATES}
              selectedId={selectedCandidateId}
              onSelect={setSelectedCandidateId}
            />
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="hidden min-h-0 flex-1 lg:block">
          <CandidateDetail candidate={selectedCandidate} />
        </div>
      </div>
    </div>
  );
}
