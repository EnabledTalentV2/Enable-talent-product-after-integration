"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ListedJobCard from "@/components/dashboard/ListedJobCard";
import JobDetailView from "@/components/dashboard/JobDetailView";

// --- Types ---

type ListedJob = {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  postedTime: string;
  status: "Active" | "Closed" | "Draft";
  stats: {
    accepted: number;
    declined: number;
    matching: number;
  };
};

type JobDetail = {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  workMode: string;
  experience: string;
  salary: string;
  about: string;
  description: string[];
  requirements: string[];
  stats: {
    accepted: number;
    declined: number;
    requests: number;
    matching: number;
  };
};

// --- Mock Data ---

const listedJobs: ListedJob[] = [
  {
    id: "ui-ux-designer",
    role: "UI/UX Designer",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "12 hrs ago",
    status: "Active",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
  {
    id: "software-engineer",
    role: "Software Engineer",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "12 hrs ago",
    status: "Active",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
  {
    id: "marketing-specialist",
    role: "Marketing Specialist",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "12 hrs ago",
    status: "Active",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
  {
    id: "sales-lead",
    role: "Sales Lead",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    experience: "Exp: 5+ Years",
    postedTime: "12 hrs ago",
    status: "Active",
    stats: {
      accepted: 56,
      declined: 367,
      matching: 97,
    },
  },
];

const jobDetails: Record<string, JobDetail> = {
  "ui-ux-designer": {
    id: "ui-ux-designer",
    role: "UI/UX Designer",
    company: "Meta",
    location: "Toronto",
    type: "Full Time",
    workMode: "Hybrid",
    experience: "12 years",
    salary: "$2000-4500",
    about:
      "We are desertcart, an e-commerce and logistics company based in Dubai, serving customers across 160+ countries worldwide. We are changing the way people shop internationally making it faster, more reliable, and cheaper, and want you to be a part of it.",
    description: [
      "Create wireframes, prototypes, and user flows to visualize and communicate design concepts.",
      "Collaborate with cross-functional teams including product managers, developers, and other designers to ensure seamless implementation.",
      "Translate research insights into actionable design solutions that enhance user satisfaction and engagement.",
    ],
    requirements: [
      "7+ years of experience evolving and scaling high-performing design systems in a highly matrixed company",
      "3+ years of experience in people leadership, with experience in hiring, leading, and coaching high performing teams",
      "Solid understanding of Design Systems - creating, designing, governing, and scaling reusable component libraries - and an ability to communicate its value to a large, complex organizations",
      "Understanding of best practices and process around governance and maintenance of large-scale design systems",
      "Influence strategy by developing partnerships, engaging and collaborating effectively with design, product, and engineering",
      "Operate comfortably in agile environments (e.g. sprints), helping the team prioritize work considering needs, resources and capacity",
    ],
    stats: {
      accepted: 102,
      declined: 4,
      requests: 25,
      matching: 9,
    },
  },
  "marketing-specialist": {
    id: "marketing-specialist",
    role: "Marketing Specialist",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    workMode: "On-site",
    experience: "5+ Years",
    salary: "$1500-3000",
    about: "We are looking for a Marketing Specialist to join our team.",
    description: [
      "Develop and execute marketing strategies.",
      "Manage social media accounts.",
      "Analyze market trends.",
    ],
    requirements: [
      "Bachelor's degree in Marketing or related field.",
      "3+ years of experience in marketing.",
      "Strong communication skills.",
    ],
    stats: {
      accepted: 20,
      declined: 150,
      requests: 40,
      matching: 60,
    },
  },
  "software-engineer": {
    id: "software-engineer",
    role: "Software Engineer",
    company: "Meta",
    location: "Allentown, New Mexico 31134",
    type: "Full Time",
    workMode: "Hybrid",
    experience: "5+ Years",
    salary: "$3000-6000",
    about: "We are looking for a Software Engineer to join our team.",
    description: [
      "Develop and maintain software applications.",
      "Collaborate with cross-functional teams.",
    ],
    requirements: [
      "Bachelor's degree in Computer Science or related field.",
      "5+ years of experience in software development.",
      "Experience with React and Node.js.",
    ],
    stats: {
      accepted: 45,
      declined: 12,
      requests: 15,
      matching: 30,
    },
  },
  // Fallback for other jobs
  default: {
    id: "default",
    role: "Software Engineer",
    company: "Meta",
    location: "Toronto",
    type: "Full Time",
    workMode: "Hybrid",
    experience: "5 years",
    salary: "$3000-6000",
    about:
      "We are desertcart, an e-commerce and logistics company based in Dubai, serving customers across 160+ countries worldwide.",
    description: [
      "Develop and maintain software applications.",
      "Collaborate with cross-functional teams.",
    ],
    requirements: [
      "5+ years of experience in software development.",
      "Experience with React and Node.js.",
    ],
    stats: {
      accepted: 45,
      declined: 12,
      requests: 15,
      matching: 30,
    },
  },
};

// --- Helpers ---

const brandStyles: Record<string, string> = {
  Meta: "bg-blue-100 text-blue-700",
  Google: "bg-amber-100 text-amber-700",
  Amazon: "bg-orange-100 text-orange-700",
};

const getBrandKey = (company: string) => company.split(" ")[0] || company;

const getBrandStyle = (company: string) =>
  brandStyles[getBrandKey(company)] ?? "bg-slate-100 text-slate-700";

export default function ListedJobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>("ui-ux-designer");
  const didMountRef = useRef(false);

  const getJobDetails = (jobId: string) =>
    jobDetails[jobId] || {
      ...jobDetails.default,
      ...listedJobs.find((job) => job.id === jobId),
      // Merge stats from list if needed, but detail has its own stats structure
    };

  const selectedJob = getJobDetails(selectedJobId);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const targetId = isDesktop
      ? `listed-job-details-desktop-${selectedJobId}`
      : `listed-job-details-inline-${selectedJobId}`;

    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }

      if (!isDesktop) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    });
  }, [selectedJobId]);

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Job List */}
        <div className="flex flex-col lg:col-span-4">
          {/* Search and Filter */}
          <div className="flex flex-col gap-3 mb-6 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search your listed jobs"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <button className="w-full sm:w-auto bg-[#D95F35] hover:bg-[#B84D28] text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              Filters
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable List */}
          <div className="space-y-4 lg:pr-2 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent">
            {listedJobs.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <div key={job.id} className="space-y-4">
                  <ListedJobCard
                    job={job}
                    isSelected={isSelected}
                    onClick={() => setSelectedJobId(job.id)}
                    getBrandStyle={getBrandStyle}
                  />
                  {isSelected && (
                    <div
                      id={`listed-job-details-inline-${job.id}`}
                      tabIndex={-1}
                      className="lg:hidden"
                    >
                      <JobDetailView
                        job={getJobDetails(job.id)}
                        getBrandStyle={getBrandStyle}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Job Details */}
        <div
          id={`listed-job-details-desktop-${selectedJobId}`}
          tabIndex={-1}
          className="hidden lg:block lg:col-span-8 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-slate-200 lg:scrollbar-track-transparent pb-10"
        >
          <JobDetailView job={selectedJob} getBrandStyle={getBrandStyle} />
        </div>
      </div>
    </div>
  );
}
