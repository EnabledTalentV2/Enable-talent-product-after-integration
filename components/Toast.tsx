"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  tone?: "success" | "error";
  onClose: () => void;
};

export default function Toast({
  message,
  tone = "success",
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const toneStyles =
    tone === "error"
      ? "bg-red-600 text-white"
      : "bg-emerald-600 text-white";

  return (
    <div
      role="alert"
      className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${toneStyles}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold text-white hover:bg-white/30"
      >
        Close
      </button>
    </div>
  );
}
