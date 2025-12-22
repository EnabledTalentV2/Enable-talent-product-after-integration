'use client';

import { useMemo, useRef, useState } from "react";
import { Banknote, MapPin } from "lucide-react";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { useUserDataStore } from "@/lib/userDataStore";
import { computeProfileCompletion } from "@/lib/profileCompletion";

type JobStatus = "Accepted" | "Rejected";

type Job = {
  id: string;
  title: string;
  company: string;
  logo?: string;
  posted: string;
  status: string;
  location: string;
  salary: string;
  match: number;
  applicationStatus: JobStatus;
  jobType: string;
  workMode: string;
  yearsExperience: string;
  about: string;
  description: string[];
  requirements: string[];
};

const jobs: Job[] = [
  {
    id: "google-ux",
    title: "UI/UX Designer",
    company: "Google LLC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg",
    posted: "Posted 12 hrs ago",
    status: "Active",
    location: "Allentown, New Mexico 31134",
    salary: "$2000-4500",
    match: 97,
    applicationStatus: "Accepted",
    jobType: "Full Time",
    workMode: "Hybrid",
    yearsExperience: "12 years",
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
  },
  {
    id: "amazon-ux",
    title: "UI/UX Designer",
    company: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    posted: "Posted 12 hrs ago",
    status: "Active",
    location: "Allentown, New Mexico 31134",
    salary: "$2000-4500",
    match: 92,
    applicationStatus: "Rejected",
    jobType: "Contract",
    workMode: "Onsite",
    yearsExperience: "8 years",
    about: "Join a fast-paced retail design team focused on customer-centric journeys.",
    description: [
      "Define UX patterns that support global e-commerce workflows.",
      "Partner with research to refine journeys and reduce friction.",
      "Align product roadmap with measurable experience improvements.",
    ],
    requirements: [
      "5+ years in UX or product design.",
      "Experience with experimentation and analytics.",
      "Ability to communicate trade-offs to stakeholders.",
    ],
  },
  {
    id: "pinterest-ux",
    title: "UI/UX Designer",
    company: "Pinterest",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png",
    posted: "Posted 12 hrs ago",
    status: "Active",
    location: "Allentown, New Mexico 31134",
    salary: "$2000-4500",
    match: 95,
    applicationStatus: "Accepted",
    jobType: "Part Time",
    workMode: "Remote",
    yearsExperience: "6 years",
    about: "Help craft discovery-first experiences for inspiration-seeking users.",
    description: [
      "Create interaction models that improve content discovery.",
      "Design experiments and measure engagement improvements.",
      "Collaborate with content strategy on storytelling.",
    ],
    requirements: [
      "Portfolio showing strong visual and UX fundamentals.",
      "Experience designing for personalization.",
      "Comfort with rapid iteration cycles.",
    ],
  },
  {
    id: "meta-ux",
    title: "UI/UX Designer",
    company: "Facebook",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
    posted: "Posted 12 hrs ago",
    status: "Active",
    location: "Allentown, New Mexico 31134",
    salary: "$2000-4500",
    match: 89,
    applicationStatus: "Rejected",
    jobType: "Full Time",
    workMode: "Hybrid",
    yearsExperience: "10 years",
    about: "Design collaboration tools that enable teams to build community together.",
    description: [
      "Own end-to-end UX for collaboration and messaging workflows.",
      "Build prototypes to validate complex interaction flows.",
      "Drive alignment with engineering on feasible solutions.",
    ],
    requirements: [
      "7+ years of experience designing consumer products.",
      "Proficiency in Figma and prototyping tools.",
      "Strong communication and facilitation skills.",
    ],
  },
];

const filters = ["All", "Accepted", "Rejected"] as const;

export default function MyJobsPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState(jobs[0]?.id ?? "");
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const userData = useUserDataStore((s) => s.userData);
  const { percent: profilePercent } = useMemo(() => computeProfileCompletion(userData), [userData]);

  const filteredJobs = useMemo(() => {
    if (activeFilter === "All") {
      return jobs;
    }
    return jobs.filter((job) => job.applicationStatus === activeFilter);
  }, [activeFilter]);

  const activeJob = filteredJobs.find((job) => job.id === selectedId) ?? filteredJobs[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <section className="space-y-6 max-w-360 mx-auto py-10">
    <DashboardProfilePrompt percent={profilePercent} />
    <div className=" ">
      <div className="mx-auto ">
        <div className="mb-6 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl px-6 py-2.5 text-base font-bold transition ${
                activeFilter === filter
                  ? "bg-[#C27803] text-white"
                  : "bg-[#E2E8F0] text-slate-900 hover:bg-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full space-y-4 lg:w-[450px] lg:shrink-0">
            {filteredJobs.map((job) => {
              const isSelected = selectedId === job.id;
              return (
                <button
                  key={job.id}
                  onClick={() => handleSelect(job.id)}
                  className={`relative w-full rounded-[32px] border-2 bg-white p-5 text-left shadow-sm transition-all sm:p-6 ${
                    isSelected ? "border-[#C27803]" : "border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-slate-400">{job.posted}</span>
                    <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-sm font-bold text-[#10B981]">
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="h-12 w-12 object-contain" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                        {job.company.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                      <p className="font-medium text-slate-500">{job.company}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={18} className="text-orange-400" />
                        <span className="text-base font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Banknote size={18} className="text-orange-400" />
                        <span className="text-base font-medium">{job.salary}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#FEF3C7] px-4 py-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{job.match}%</p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-700">Matching</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div ref={detailsRef} className="w-full rounded-[40px] bg-white p-6 shadow-sm md:p-10 lg:flex-1">
            {activeJob && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {activeJob.logo ? (
                      <img
                        src={activeJob.logo}
                        alt={activeJob.company}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-600">
                        {activeJob.company.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">{activeJob.title}</h2>
                      <p className="text-lg font-medium text-slate-500">{activeJob.company}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#ECFDF5] px-4 py-1 text-base font-bold text-[#10B981]">
                    {activeJob.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-10 md:grid-cols-4">
                  <div>
                    <p className="mb-1 text-base font-medium text-slate-400">Job Type</p>
                    <p className="text-lg font-bold text-slate-900">{activeJob.jobType}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-base font-medium text-slate-400">Location</p>
                    <p className="text-lg font-bold text-slate-900">{activeJob.location}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-base font-medium text-slate-400">Work Mode</p>
                    <p className="text-lg font-bold text-slate-900">{activeJob.workMode}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-base font-medium text-slate-400">Years of Experience</p>
                    <p className="text-lg font-bold text-slate-900">{activeJob.yearsExperience}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-base font-medium text-slate-400">Salary</p>
                  <p className="text-2xl font-bold text-slate-900">{activeJob.salary}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-900">About the job</h4>
                  <p className="leading-relaxed text-slate-600">{activeJob.about}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-900">Description</h4>
                  <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                    {activeJob.description.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-900">Requirement</h4>
                  <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                    {activeJob.requirements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
  );
}


