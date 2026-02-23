"use client";

/**
 * SC 3.1.3 (Unusual Words, AAA) — provides definitions for jargon and
 * technical terms via a styled <dfn> with a dotted underline and a
 * title tooltip.  Screen readers announce the definition when focused.
 *
 * Usage:
 *   <Glossary term="Resume parsing" definition="Automatically reading your resume file to fill in your profile">
 *     Resume parsing
 *   </Glossary>
 */

import type { ReactNode } from "react";

type GlossaryProps = {
  /** The visible text (can include child elements). */
  children: ReactNode;
  /** Plain-language definition shown on hover and read by screen readers. */
  definition: string;
  /** Optional: override the term name for the aria-label. Defaults to children text. */
  term?: string;
};

export default function Glossary({ children, definition, term }: GlossaryProps) {
  return (
    <dfn
      title={definition}
      aria-label={term ? `${term}: ${definition}` : undefined}
      className="not-italic cursor-help border-b border-dotted border-slate-400"
    >
      {children}
    </dfn>
  );
}
