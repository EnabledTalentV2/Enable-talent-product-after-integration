import React from "react";
import { Check } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  message = "The job invites have been sent successfully",
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl bg-[#F0F5FF] p-10 text-center shadow-2xl">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-500" strokeWidth={3} />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-slate-900">Success!</h2>

        <p className="mb-8 text-sm text-slate-600">{message}</p>

        <button
          onClick={onClose}
          className="min-w-[120px] rounded-xl bg-[#C27803] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a36502]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
