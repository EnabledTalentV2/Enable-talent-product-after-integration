"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Globe, MapPin, Users } from "lucide-react";
import DashboardProfilePrompt from "@/components/DashboardProfilePrompt";
import { useUserDataStore } from "@/lib/userDataStore";
import { computeProfileCompletion } from "@/lib/profileCompletion";
import { useAppliedJobsStore } from "@/lib/talentAppliedJobsStore";

type CompanyProfile = {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  hiringCount: number;
  lastActive: string;
  hiringStatus: string;
  about: string[];
  details: {
    location: string;
    industry: string;
    founded: string;
    employeeSize: string;
    website: string;
  };
};

type CompanyJob = {
  id: string;
  title: string;
  status: "Active" | "Closed";
  location: string;
  match?: number;
  jobType: string;
  workMode: string;
  yearsExperience: string;
  salary: string;
  posted: string;
  description: string[];
  requirements: string[];
  company: CompanyProfile;
};

const companies: CompanyProfile[] = [
  {
    id: "google",
    name: "Google LLC",
    industry: "Information technology",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    hiringCount: 136,
    lastActive: "3 months ago",
    hiringStatus: "Hiring",
    about: [
      "In an era marked by rapid technological advancement and ever-evolving business landscapes, the quest for top-tier talent remains a cornerstone of organizational success. Recognizing this imperative, [Company Name] emerges as a beacon of innovation in the realm of recruitment. With a commitment to excellence and a passion for connecting talent with opportunity, we have established ourselves as a trusted partner for companies seeking to build high-performing teams and individuals embarking on transformative career journeys.",
      "At the heart of ethos lies a deep-seated belief in the power of human potential. We understand that behind every resume is a story waiting to be told, a skill set waiting to be unleashed, and a dream waiting to be realized. With this understanding as our guiding principle, we have curated a suite of services and tools designed to unlock this potential and facilitate meaningful connections between employers and candidates.",
    ],
    details: {
      location: "Toronto",
      industry: "Information technology",
      founded: "2004",
      employeeSize: "1000 - 10000",
      website: "www.google.com",
    },
  },
  {
    id: "pinterest",
    name: "Pinterest",
    industry: "Information technology",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png",
    hiringCount: 136,
    lastActive: "3 months ago",
    hiringStatus: "Hiring",
    about: [
      "Pinterest helps people discover and save creative ideas. We are focused on building discovery-first experiences for millions of users worldwide.",
      "We partner closely with product, engineering, and data science to craft intuitive interfaces that inspire and convert curiosity into action.",
    ],
    details: {
      location: "San Francisco",
      industry: "Information technology",
      founded: "2010",
      employeeSize: "1000 - 10000",
      website: "www.pinterest.com",
    },
  },
  {
    id: "amazon",
    name: "Amazon",
    industry: "E-commerce",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    hiringCount: 136,
    lastActive: "3 months ago",
    hiringStatus: "Hiring",
    about: [
      "Amazon is driven by customer obsession. Our teams design high-impact workflows that improve the shopping and selling experience at scale.",
      "We value bold experimentation, precise measurement, and clear design systems that unify global product teams.",
    ],
    details: {
      location: "Seattle",
      industry: "E-commerce",
      founded: "1994",
      employeeSize: "10000+",
      website: "www.amazon.com",
    },
  },
  {
    id: "tesla",
    name: "Tesla",
    industry: "Automotive",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
    hiringCount: 136,
    lastActive: "3 months ago",
    hiringStatus: "Hiring",
    about: [
      "Tesla is accelerating the world's transition to sustainable energy. We design digital experiences that connect drivers to intelligent vehicles.",
      "Our team blends research, systems thinking, and rapid iteration to deliver clean, high-performance user experiences.",
    ],
    details: {
      location: "Austin",
      industry: "Automotive",
      founded: "2003",
      employeeSize: "10000+",
      website: "www.tesla.com",
    },
  },
];

const companyById = companies.reduce<Record<string, CompanyProfile>>((acc, company) => {
  acc[company.id] = company;
  return acc;
}, {});

const jobs: CompanyJob[] = [
  {
    id: "google-frontend",
    title: "Frontend Developer",
    status: "Active",
    location: "Toronto",
    match: 92,
    jobType: "Full Time",
    workMode: "Hybrid",
    yearsExperience: "4+ years",
    salary: "$120k-$160k",
    posted: "Posted 3 days ago",
    description: [
      "Build accessible UI components used across search and workspace surfaces.",
      "Collaborate with design to ship responsive, polished experiences.",
    ],
    requirements: [
      "Strong React and TypeScript experience.",
      "Comfortable with performance and accessibility audits.",
    ],
    company: companyById["google"],
  },
  {
    id: "google-backend",
    title: "Backend Developer",
    status: "Active",
    location: "Toronto",
    match: 89,
    jobType: "Full Time",
    workMode: "Hybrid",
    yearsExperience: "5+ years",
    salary: "$130k-$175k",
    posted: "Posted 1 week ago",
    description: [
      "Design APIs that power employer dashboards and candidate matching.",
      "Own reliability and latency targets for high-traffic services.",
    ],
    requirements: [
      "Experience with distributed systems and observability.",
      "Familiar with SQL and data modeling.",
    ],
    company: companyById["google"],
  },
  {
    id: "pinterest-product-designer",
    title: "Product Designer",
    status: "Active",
    location: "San Francisco",
    match: 94,
    jobType: "Full Time",
    workMode: "Remote",
    yearsExperience: "5+ years",
    salary: "$110k-$150k",
    posted: "Posted 4 days ago",
    description: [
      "Lead end-to-end product design for discovery flows.",
      "Prototype quickly to validate new interaction patterns.",
    ],
    requirements: [
      "Strong portfolio of consumer product work.",
      "Experience collaborating with product and research.",
    ],
    company: companyById["pinterest"],
  },
  {
    id: "pinterest-ux-researcher",
    title: "UX Researcher",
    status: "Closed",
    location: "San Francisco",
    match: 86,
    jobType: "Full Time",
    workMode: "Remote",
    yearsExperience: "4+ years",
    salary: "$100k-$140k",
    posted: "Closed last month",
    description: [
      "Plan and run mixed-methods research across creator tools.",
      "Translate insights into actionable design guidance.",
    ],
    requirements: [
      "Experience in qualitative and quantitative research.",
      "Ability to synthesize and present findings.",
    ],
    company: companyById["pinterest"],
  },
  {
    id: "amazon-ux-designer",
    title: "UI/UX Designer",
    status: "Active",
    location: "Seattle",
    match: 91,
    jobType: "Contract",
    workMode: "Onsite",
    yearsExperience: "6+ years",
    salary: "$105k-$145k",
    posted: "Posted 2 days ago",
    description: [
      "Design high-impact retail workflows for global customers.",
      "Partner with engineering to ship scalable patterns.",
    ],
    requirements: [
      "Experience with complex enterprise UI.",
      "Comfortable with data-informed design.",
    ],
    company: companyById["amazon"],
  },
  {
    id: "amazon-design-systems",
    title: "Design Systems Lead",
    status: "Active",
    location: "Seattle",
    match: 93,
    jobType: "Full Time",
    workMode: "Hybrid",
    yearsExperience: "8+ years",
    salary: "$150k-$190k",
    posted: "Posted 1 week ago",
    description: [
      "Own the design system roadmap and governance.",
      "Lead cross-team adoption and documentation.",
    ],
    requirements: [
      "History of scaling design systems.",
      "Strong stakeholder management.",
    ],
    company: companyById["amazon"],
  },
  {
    id: "tesla-ux-researcher",
    title: "UX Researcher",
    status: "Active",
    location: "Austin",
    match: 88,
    jobType: "Full Time",
    workMode: "Onsite",
    yearsExperience: "5+ years",
    salary: "$115k-$155k",
    posted: "Posted 5 days ago",
    description: [
      "Drive research for in-vehicle and mobile experiences.",
      "Partner with design to translate insights into flows.",
    ],
    requirements: [
      "Experience in hardware-adjacent UX.",
      "Strong facilitation skills.",
    ],
    company: companyById["tesla"],
  },
  {
    id: "tesla-product-designer",
    title: "Product Designer",
    status: "Active",
    location: "Austin",
    match: 90,
    jobType: "Full Time",
    workMode: "Hybrid",
    yearsExperience: "5+ years",
    salary: "$120k-$160k",
    posted: "Posted 3 days ago",
    description: [
      "Design connected vehicle experiences with tight constraints.",
      "Collaborate with engineers on prototypes and UI specs.",
    ],
    requirements: [
      "Strong visual design and systems thinking.",
      "Ability to iterate quickly.",
    ],
    company: companyById["tesla"],
  },
];

const getStatusStyles = (status: CompanyJob["status"]) =>
  status === "Active" ? "bg-[#ECFDF5] text-[#10B981]" : "bg-slate-100 text-slate-500";

export default function CompaniesPage() {
  const [selectedId, setSelectedId] = useState(jobs[0]?.id ?? "");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const userData = useUserDataStore((s) => s.userData);
  const appliedJobs = useAppliedJobsStore((s) => s.appliedJobs);
  const applyJob = useAppliedJobsStore((s) => s.applyJob);
  const { percent: profilePercent } = useMemo(() => computeProfileCompletion(userData), [userData]);

  const activeJob = useMemo(
    () => jobs.find((job) => job.id === selectedId) ?? jobs[0],
    [selectedId]
  );
  const activeCompany = activeJob?.company;
  const appliedJobIds = useMemo(() => new Set(appliedJobs.map((job) => job.id)), [appliedJobs]);
  const isApplied = activeJob ? appliedJobIds.has(activeJob.id) : false;
  const canApply = Boolean(activeJob) && activeJob.status === "Active" && !isApplied;
  const descriptionItems = activeJob?.description ?? [];
  const canToggleDescription = descriptionItems.length > 2;
  const visibleDescriptionItems = showFullDescription
    ? descriptionItems
    : descriptionItems.slice(0, 2);

  useEffect(() => {
    setShowFullDescription(false);
  }, [activeJob?.id]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleApply = () => {
    if (!activeJob || !activeCompany || !canApply) {
      return;
    }

    applyJob({
      id: activeJob.id,
      title: activeJob.title,
      status: activeJob.status,
      location: activeJob.location,
      match: activeJob.match,
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      companyLogo: activeCompany.logo,
      companyIndustry: activeCompany.industry,
      hiringCount: activeCompany.hiringCount,
      lastActive: activeCompany.lastActive,
      posted: activeJob.posted,
      salary: activeJob.salary,
      jobType: activeJob.jobType,
      workMode: activeJob.workMode,
      yearsExperience: activeJob.yearsExperience,
      about: activeCompany.about[0],
      description: activeJob.description,
      requirements: activeJob.requirements,
    });
  };

  return (
    <section className="mx-auto max-w-360 space-y-6">
      <DashboardProfilePrompt percent={profilePercent} />
      <div>
        <div className="mx-auto max-w-360">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full space-y-4 lg:w-[450px] lg:shrink-0">
              {jobs.map((job) => {
                const isSelected = selectedId === job.id;
                const matchLabel = typeof job.match === "number" ? `${job.match}%` : "--";

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelect(job.id)}
                    className={`relative w-full rounded-[32px] border-2 bg-white p-5 text-left shadow-sm transition-all sm:p-6 ${
                      isSelected ? "border-[#C27803]" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-slate-400">
                        {job.company.lastActive}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${getStatusStyles(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      {job.company.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                          {job.company.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-bold text-slate-900">{job.title}</h3>
                        <p className="truncate font-medium text-slate-500">
                          {job.company.name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={18} className="text-orange-400" />
                          <span className="text-base font-medium">{job.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <Users size={18} className="text-orange-400" />
                          <span className="text-base font-medium">
                            {job.company.hiringCount} Hiring
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#FEF3C7] px-4 py-3 text-center">
                        <p className="text-lg font-bold text-slate-900">{matchLabel}</p>
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-700">
                          Matching
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              ref={detailsRef}
              className="w-full rounded-[40px] bg-white p-6 shadow-sm md:p-10 lg:flex-1"
            >
              {activeJob && activeCompany && (
                <div className="space-y-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {activeCompany.logo ? (
                        <img
                          src={activeCompany.logo}
                          alt={activeCompany.name}
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-600">
                          {activeCompany.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-3xl font-bold text-slate-900">
                          {activeCompany.name}
                        </h2>
                        <p className="truncate text-lg font-medium text-slate-500">
                          {activeCompany.industry}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`rounded-full px-4 py-1 text-base font-bold ${getStatusStyles(
                          activeJob.status
                        )}`}
                      >
                        {activeJob.status}
                      </span>
                      <button
                        type="button"
                        onClick={handleApply}
                        disabled={!canApply}
                        className={`rounded-full px-6 py-2 text-base font-bold transition ${
                          canApply
                            ? "bg-[#C27803] text-white hover:bg-[#A56303]"
                            : "cursor-not-allowed bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isApplied ? "Applied" : activeJob.status === "Active" ? "Apply now" : "Closed"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[#FFFBEB] p-5">
                    <p className="text-base font-medium text-slate-400">Role</p>
                    <p className="text-2xl font-bold text-slate-900">{activeJob.title}</p>
                    <div className="mt-4 flex flex-wrap gap-6 text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-orange-400" />
                        <span>{activeJob.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-orange-400" />
                        <span>{activeCompany.hiringCount} Hiring</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-slate-900">Job description</h4>
                    {visibleDescriptionItems.length > 0 ? (
                      <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                        {visibleDescriptionItems.map((item, index) => (
                          <li key={`${activeJob.id}-desc-${index}`}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-600">Details will be shared after you apply.</p>
                    )}
                    {canToggleDescription && (
                      <button
                        type="button"
                        onClick={() => setShowFullDescription((prev) => !prev)}
                        className="text-sm font-semibold text-[#C27803] transition hover:text-[#A56303]"
                      >
                        {showFullDescription ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-10 md:grid-cols-4">
                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">Location</p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.location}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">Industry</p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.industry}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">Founded year</p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.founded}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-base font-medium text-slate-400">Employee size</p>
                      <p className="text-lg font-bold text-slate-900">
                        {activeCompany.details.employeeSize}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-base font-medium text-slate-400">Open roles / Hiring</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {activeCompany.hiringCount}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-slate-900">About the company</h4>
                    <div className="space-y-4 leading-relaxed text-slate-600">
                      {activeCompany.about.map((paragraph, i) => (
                        <p key={`${activeCompany.id}-about-${i}`}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-slate-900">Company details</h4>

                    <ul className="list-outside list-disc space-y-3 pl-5 text-slate-600">
                      <li className="flex items-center gap-2">
                        <Globe size={16} className="text-orange-400" />
                        <a
                          href={`https://${activeCompany.details.website}`}
                          className="font-semibold text-slate-900 transition hover:text-[#C27803]"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {activeCompany.details.website}
                        </a>
                      </li>

                      <li className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-400" />
                        <span>Last active: {activeCompany.lastActive}</span>
                      </li>

                      <li className="flex items-center gap-2">
                        <Users size={16} className="text-orange-400" />
                        <span>Hiring status: {activeCompany.hiringStatus}</span>
                      </li>
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
