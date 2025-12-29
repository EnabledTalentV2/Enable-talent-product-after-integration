import { LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    label: string;
    className: string;
  };
  icon?: LucideIcon;
  className?: string;
}

export default function DashboardMetricCard({
  label,
  value,
  delta,
  className = "",
}: DashboardMetricCardProps) {
  return (
    <div className={`rounded-2xl bg-slate-50 px-4 py-3 ${className}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      {delta && (
        <p className={`text-sm font-semibold ${delta.className}`}>
          {delta.label}
        </p>
      )}
    </div>
  );
}
