import { Briefcase, MapPin, User } from "lucide-react";

interface AcceptedCandidate {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  matchPercent: number;
  status: "Active" | "Inactive";
  avatarUrl?: string;
}

interface CandidateCardProps {
  candidate: AcceptedCandidate;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full w-full flex items-center justify-center bg-slate-300 text-slate-700">
            <User className="h-6 w-6" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {candidate.name}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-900 text-xs font-medium">
              {candidate.status}
            </span>
          </div>
          <p className="text-sm text-slate-700">{candidate.role}</p>
        </div>
      </div>

      <div className="text-right space-y-1 hidden sm:block">
        <div className="flex items-center justify-end gap-1 text-sm text-slate-700">
          <MapPin className="h-3 w-3" />
          {candidate.location}
        </div>
        <div className="flex items-center justify-end gap-1 text-sm text-slate-700">
          <Briefcase className="h-3 w-3" />
          Experience: {candidate.experience}
        </div>
      </div>

      <div className="flex flex-col items-end justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4DB] text-sm font-bold text-slate-900">
          {candidate.matchPercent}%
        </div>
        <span className="text-[10px] text-slate-700 mt-1">Matching</span>
      </div>
    </div>
  );
}
