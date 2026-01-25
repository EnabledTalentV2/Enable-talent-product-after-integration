"use client";

import { useEffect, useRef, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "warning" | "danger" | "info";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Accessible confirmation dialog component
 * WCAG 2.2 compliant with:
 * - role="alertdialog" for screen reader announcements
 * - aria-modal="true" for modal behavior
 * - aria-labelledby and aria-describedby for proper labeling
 * - Focus trap to keep focus within dialog
 * - Escape key to close
 * - Focus restoration on close
 * - Minimum 24x24px touch targets (WCAG 2.5.8)
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element when dialog opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the cancel button by default (safer action)
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 0);
    } else if (previousFocusRef.current) {
      // Restore focus when dialog closes
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent scrolling on body when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const iconColors = {
    warning: "text-amber-600 bg-amber-100",
    danger: "text-red-600 bg-red-100",
    info: "text-blue-600 bg-blue-100",
  };

  const confirmButtonStyles = {
    warning: "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500",
    danger: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500",
    info: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        {/* Close button - WCAG 2.5.8: 24x24px minimum touch target */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Icon */}
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${iconColors[variant]}`}
          aria-hidden="true"
        >
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          className="mt-4 text-center text-lg font-semibold text-slate-900"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirm-dialog-description"
          className="mt-2 text-center text-base text-slate-600"
        >
          {message}
        </p>

        {/* Actions - WCAG 2.5.8: Minimum 44x44px touch targets for mobile */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:flex-initial sm:px-6"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] flex-1 rounded-xl px-4 py-2.5 text-base font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:flex-initial sm:px-6 ${confirmButtonStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
