'use client';

type Props = {
  title: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SimpleText({ title, placeholder, value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{title}</label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-slate-800 text-sm leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
      />
    </div>
  );
}
