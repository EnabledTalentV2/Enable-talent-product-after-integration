"use client";

import { useEffect, useRef } from "react";

type ToastProps = {
  message: string;
  tone?: "success" | "error";
  onClose: () => void;
};

/**
 * Accessible Toast notification component.
 * WCAG 4.1.3: Status Messages - Uses aria-live for screen reader announcements.
 */
export default function Toast({
  message,
  tone = "success",
  onClose,
}: ToastProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000); // Extended for accessibility
    return () => window.clearTimeout(timer);
  }, [onClose]);

  // Allow dismissal with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toneStyles =
    tone === "error"
      ? "bg-red-700 text-white" // Improved contrast
      : "bg-emerald-700 text-white"; // Improved contrast

  const iconLabel = tone === "error" ? "Error" : "Success";

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ${toneStyles}`}
    >
      <span className="sr-only">{iconLabel}:</span>
      <span>{message}</span>
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-current"
      >
        Close
      </button>
    </div>
  );
}
