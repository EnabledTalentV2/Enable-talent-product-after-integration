interface AttentionItem {
  id: string;
  tone: "warning" | "danger" | "neutral";
  text: string;
}

interface AttentionWidgetProps {
  items: AttentionItem[];
}

const attentionToneStyles: Record<AttentionItem["tone"], string> = {
  warning: "bg-amber-400",
  danger: "bg-red-500",
  neutral: "bg-slate-300",
};

export default function AttentionWidget({ items }: AttentionWidgetProps) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">
          Attention Needed
        </h3>
        <p className="text-sm text-slate-500">
          {items.length} issues require action this week
        </p>
      </div>
      <ul className="mt-4 space-y-3 text-base text-slate-700">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${attentionToneStyles[item.tone]}`}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#C27803] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto whitespace-normal leading-snug"
      >
        Review all alerts →
      </button>
    </div>
  );
}
