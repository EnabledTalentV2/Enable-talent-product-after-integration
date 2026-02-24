import React, { useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      // Focus trap: only one focusable element (OK button), keep focus on it
      if (event.key === "Tab") {
        event.preventDefault();
        primaryButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    primaryButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
        className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl bg-[#F0F5FF] p-10 text-center shadow-2xl"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-emerald-900" strokeWidth={3} aria-hidden="true" />
        </div>

        <h2
          id="success-modal-title"
          className="mb-2 text-2xl font-bold text-slate-900"
        >
          Success!
        </h2>

        <p
          id="success-modal-description"
          className="mb-8 whitespace-pre-wrap text-sm text-slate-700"
        >
          {message}
        </p>

        <button
          ref={primaryButtonRef}
          type="button"
          onClick={onClose}
          className="min-w-[120px] rounded-xl bg-[#C27803] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#a36502]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
