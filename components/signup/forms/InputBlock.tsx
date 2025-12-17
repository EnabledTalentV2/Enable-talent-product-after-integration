'use client';

type InputBlockProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

export default function InputBlock({ label, value, onChange, placeholder, type = "text" }: InputBlockProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
      />
    </div>
  );
}
