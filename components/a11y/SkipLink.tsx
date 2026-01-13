"use client";

type SkipLinkProps = {
  href?: string;
  children?: React.ReactNode;
};

/**
 * SkipLink component provides a way for keyboard users to bypass repetitive navigation.
 * Hidden until focused, then appears at the top-left of the viewport.
 *
 * WCAG 2.1 Success Criterion 2.4.1: Bypass Blocks (Level A)
 */
export default function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:px-4 focus:py-3 focus:rounded-lg focus:shadow-lg focus:text-slate-900 focus:font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
    >
      {children}
    </a>
  );
}
