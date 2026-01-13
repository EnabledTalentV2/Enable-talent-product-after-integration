"use client";

import { type ReactNode } from "react";

type LiveRegionProps = {
  children: ReactNode;
  /**
   * "polite" - Waits for user to be idle before announcing (default)
   * "assertive" - Interrupts current speech to announce immediately
   */
  politeness?: "polite" | "assertive";
  /**
   * When true, the entire region is announced on any change.
   * When false, only the changed content is announced.
   */
  atomic?: boolean;
  /**
   * When true, renders content visually.
   * When false, content is only available to screen readers.
   */
  visible?: boolean;
  className?: string;
};

/**
 * LiveRegion component for announcing dynamic content changes to screen readers.
 * Use for status messages, form validation, loading states, and real-time updates.
 *
 * WCAG 2.1 Success Criterion 4.1.3: Status Messages (Level AA)
 */
export default function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  visible = false,
  className = "",
}: LiveRegionProps) {
  const baseClasses = visible ? className : "sr-only";

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className={baseClasses}
    >
      {children}
    </div>
  );
}
