"use client";

import { useMemo, useRef, useState } from "react";
import { Calendar, Globe, Users, MapPin } from "lucide-react";

type Company = {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  hiringCount: number;
  lastActive: string;
  hiringStatus: string;
  jobTitle: string;
  jobStatus: string;
  about: string[];
  details: {
    location: string;
    industry: string;
    founded: string;
    employeeSize: string;
    website: string;
  };
};

const companies: Company[] = [
  {
    id: "google",
    name: "Google LLC",
    industry: "Information technology",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    hiringCount: 136,
    lastActive: "3 months ago",
    hiringStatus: "Hiring",
    jobTitle: "UI/UX Designer",
    jobStatus: "Active",
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
    jobTitle: "Product Designer",
    jobStatus: "Active",
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
    jobTitle: "UI/UX Designer",
    jobStatus: "Active",
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
    jobTitle: "UX Researcher",
    jobStatus: "Active",
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

export default function CompaniesPage() {
  const [selectedId, setSelectedId] = useState(companies[0]?.id ?? "");
  const detailsRef = useRef<HTMLDivElement | null>(null);

  const activeCompany = useMemo(
    () => companies.find((company) => company.id === selectedId) ?? companies[0],
    [selectedId]
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <section className="rounded-[32px] bg-[#F1F5F9] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* LEFT LIST (match MyJobsPage card style) */}
          <div className="w-full space-y-4 lg:w-[450px] lg:shrink-0">
            {companies.map((company) => {
              const isSelected = selectedId === company.id;

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelect(company.id)}
                  className={`relative w-full rounded-[32px] border-2 bg-white p-5 text-left shadow-sm transition-all sm:p-6 ${
                    isSelected ? "border-[#C27803]" : "border-transparent"
                  }`}
                >
                  {/* top row like "posted + status" */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">{company.lastActive}</span>
                    <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#10B981]">
                      {company.hiringStatus}
                    </span>
                  </div>

                  {/* main row like logo + title/company */}
                  <div className="mt-4 flex items-center gap-4">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="h-12 w-12 object-contain" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
                        {company.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold text-slate-900">{company.name}</h3>
                      <p className="truncate font-medium text-slate-500">{company.industry}</p>
                    </div>
                  </div>

                  {/* bottom info row + right highlight box (match "match%") */}
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={18} className="text-orange-400" />
                        <span className="text-sm font-medium">{company.details.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <Users size={18} className="text-orange-400" />
                        <span className="text-sm font-medium">{company.hiringCount} Hiring</span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#FEF3C7] px-4 py-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{company.jobTitle}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        Hiring focus
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT DETAILS (match MyJobsPage details panel) */}
          <div ref={detailsRef} className="w-full rounded-[40px] bg-white p-6 shadow-sm md:p-10 lg:flex-1">
            {activeCompany && (
              <div className="space-y-10">
                {/* header block */}
                <div className="flex items-center justify-between gap-4">
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
                      <h2 className="truncate text-3xl font-bold text-slate-900">{activeCompany.name}</h2>
                      <p className="truncate text-lg font-medium text-slate-500">{activeCompany.industry}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#ECFDF5] px-4 py-1 text-sm font-bold text-[#10B981]">
                    {activeCompany.hiringStatus}
                  </span>
                </div>

                {/* metrics grid like Job Type / Location / Work Mode / YoE */}
                <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-10 md:grid-cols-4">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-400">Location</p>
                    <p className="text-lg font-bold text-slate-900">{activeCompany.details.location}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-400">Industry</p>
                    <p className="text-lg font-bold text-slate-900">{activeCompany.details.industry}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-400">Founded year</p>
                    <p className="text-lg font-bold text-slate-900">{activeCompany.details.founded}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-400">Employee size</p>
                    <p className="text-lg font-bold text-slate-900">{activeCompany.details.employeeSize}</p>
                  </div>
                </div>

                {/* hiring count (like Salary block) */}
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-400">Open roles / Hiring</p>
                  <p className="text-2xl font-bold text-slate-900">{activeCompany.hiringCount}</p>
                </div>

                {/* about block */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-slate-900">About the company</h4>
                  <div className="space-y-4 leading-relaxed text-slate-600">
                    {activeCompany.about.map((paragraph, i) => (
                      <p key={`${activeCompany.id}-about-${i}`}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* link + last active (like Description / Requirement sections) */}
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
    </section>
  );
}
