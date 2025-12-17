'use client';

type InputBlockProps = {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: boolean;
  errorMessage?: string;
};

export default function InputBlock({ label, id, value, onChange, placeholder, type = "text", error, errorMessage }: InputBlockProps) {
  return (
    <div className="space-y-1.5">
      <label className={`block text-sm font-medium ${error ? "text-red-600" : "text-slate-700"}`}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-500"
            : "border-gray-200 focus:ring-orange-500/30 focus:border-orange-500"
        }`}
      />
      {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
