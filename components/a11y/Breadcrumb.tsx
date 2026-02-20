"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  /** Override auto-derived crumbs for dynamic routes (e.g. job name, candidate name). */
  items?: BreadcrumbItem[];
};

/**
 * WCAG SC 2.4.8 (Location, AAA) — shows the user's location within the site.
 *
 * Usage:
 *   Auto-derives crumbs from the URL:  <Breadcrumb />
 *   Custom crumbs for dynamic routes:  <Breadcrumb items={[{ label: "Dashboard", href: "/employer/dashboard" }, { label: jobName }]} />
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();
  const crumbs: BreadcrumbItem[] = items ?? deriveFromPathname(pathname);

  if (crumbs.length <= 1) return null; // no crumb trail needed on root pages

  return (
    <nav aria-label="Breadcrumb" className="px-6 py-3 md:px-12">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index === 0 && (
                <Home
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 text-slate-400"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-slate-900 truncate max-w-[200px]"
                >
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link
                    href={crumb.href ?? "#"}
                    className="text-slate-500 hover:text-orange-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-1 rounded-sm transition-colors"
                  >
                    {crumb.label}
                  </Link>
                  <ChevronRight
                    size={14}
                    aria-hidden="true"
                    className="shrink-0 text-slate-300"
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Route → crumb map
// ---------------------------------------------------------------------------

/** Segments that are UUID/slug-like and should be skipped or shown as generic labels. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Route-namespace segments that are purely structural and should be omitted
 * from the visible crumb trail.
 * e.g. "/employer/dashboard/candidates" → Dashboard > Candidates  (not Employer > Dashboard > Candidates)
 */
const SKIP_SEGMENTS = new Set(["employer"]);

const SEGMENT_LABELS: Record<string, string> = {
  // Candidate dashboard
  dashboard: "Dashboard",
  home: "Home",
  "my-jobs": "My Jobs",
  profile: "Profile",
  "profile-update": "Update Profile",
  "career-coach": "Career Coach",
  start: "Chat",
  companies: "Companies",
  // Employer dashboard
  candidates: "Candidates",
  "listed-jobs": "Listed Jobs",
  "company-profile": "Company Profile",
  "company-profile-edit": "Edit Company Profile",
  "post-jobs": "Post a Job",
  "edit-job": "Edit Job",
  "ai-search": "AI Candidate Search",
  "oauth-complete": "Complete Sign-Up",
  "email-verification": "Verify Email",
  "organisation-info": "Organisation Info",
};

/**
 * Returns the human-readable label for a URL segment.
 * UUID/numeric segments are skipped (returns null).
 */
function segmentLabel(segment: string): string | null {
  if (SKIP_SEGMENTS.has(segment)) return null; // route-namespace segments
  if (UUID_RE.test(segment)) return null;
  if (/^\d+$/.test(segment)) return null; // pure numeric IDs
  return SEGMENT_LABELS[segment] ?? titleCase(segment);
}

function titleCase(str: string): string {
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveFromPathname(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];

  // Build up hrefs segment by segment, skipping UUID segments
  let href = "";
  for (const segment of segments) {
    href += `/${segment}`;
    const label = segmentLabel(segment);
    if (!label) continue; // skip UUID/numeric IDs silently

    crumbs.push({ label, href });
  }

  // Remove href from the last crumb (current page — not a link)
  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1] = { label: crumbs[crumbs.length - 1].label };
  }

  return crumbs;
}
