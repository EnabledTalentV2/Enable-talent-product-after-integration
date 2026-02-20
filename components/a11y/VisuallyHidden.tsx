"use client";

import { type ReactNode } from "react";

type VisuallyHiddenProps = {
  children: ReactNode;
  as?: "span" | "div";
};

/**
 * VisuallyHidden component hides content visually but keeps it accessible to screen readers.
 * Use this for skip links, form instructions, or any content that should be announced
 * but not displayed visually.
 *
 * WCAG 2.1: Supports multiple criteria including 2.4.1 (Bypass Blocks)
 */
export default function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return (
    <Component className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-slate-900 focus:ring focus:ring-[#C27803]">
      {children}
    </Component>
  );
}
