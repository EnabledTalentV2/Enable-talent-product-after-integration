import type { ReactNode } from "react";

import DashboardMetricCard from "@/components/dashboard/DashboardMetricCard";

type SummaryMetric = {
  label: string;
  value: string | number;
  delta?: {
    label: string;
    className: string;
  };
};

type DashboardSummaryCardProps = {
  title: string;
  value: ReactNode;
  subtitle: string;
  metrics: SummaryMetric[];
};

export default function DashboardSummaryCard({
  title,
  value,
  subtitle,
  metrics,
}: DashboardSummaryCardProps) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="rounded-2xl bg-[#FFF4DB] px-4 py-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <DashboardMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
          />
        ))}
      </div>
    </div>
  );
}
