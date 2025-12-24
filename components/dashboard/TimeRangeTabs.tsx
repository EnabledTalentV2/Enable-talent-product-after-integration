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
      className={`flex items-center gap-2 text-sm font-semibold text-slate-500 ${className}`}
    >
      {ranges.map((range) => {
        const isActive = activeRange === range;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            className={`rounded-full px-3 py-1 transition ${
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
