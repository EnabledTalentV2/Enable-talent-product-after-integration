"use client";

type TimeRangeTabsProps<T extends string> = {
  ranges: readonly T[];
  activeRange: T;
  onChange: (range: T) => void;
  className?: string;
};

export default function TimeRangeTabs<T extends string>({
  ranges,
  activeRange,
  onChange,
  className = "",
}: TimeRangeTabsProps<T>) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 sm:flex-nowrap sm:text-sm ${className}`}
    >
      {ranges.map((range) => {
        const isActive = activeRange === range;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            className={`rounded-full px-2.5 py-1 transition sm:px-3 ${
              isActive
                ? "bg-[#C27803] text-white shadow-sm"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {range}
          </button>
        );
      })}
    </div>
  );
}
