"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export type EngagementPoint = {
  label: string;
  actual: number;
  expected: number;
};

type EngagementTrendChartProps = {
  points: EngagementPoint[];
  metricLabel: string;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      intersect: false,
      mode: "index" as const,
    },
  },
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#94A3B8",
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "rgba(148, 163, 184, 0.2)",
      },
      ticks: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
} as const;

export default function EngagementTrendChart({ points, metricLabel }: EngagementTrendChartProps) {
  const chartData = useMemo(
    () => ({
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: `Actual ${metricLabel}`,
          data: points.map((point) => point.actual),
          borderColor: "#4F7DF3",
          backgroundColor: "rgba(79, 125, 243, 0.15)",
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
          fill: true,
        },
        {
          label: `Expected ${metricLabel}`,
          data: points.map((point) => point.expected),
          borderColor: "#E6A24E",
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
          borderDash: [4, 4],
          fill: false,
        },
      ],
    }),
    [metricLabel, points]
  );

  return <Line data={chartData} options={chartOptions} />;
}
