# Enabled Talent - Agent Documentation

## Application Overview

**Enabled Talent** is a digital platform designed to connect talented professionals with disabilities to inclusive employers who are committed to creating accessible and supportive work environments. The platform serves as a bridge between exceptional talent and forward-thinking organizations that value diversity, equity, and inclusion.

## Mission & Purpose

This application is built specifically for **persons with disabilities** to:

- Showcase their professional skills and experience
- Find employment opportunities with inclusive employers
- Access career coaching and support services
- Voluntarily self-identify disability categories and accessibility needs
- Request and communicate workplace accommodations
- Build professional profiles highlighting their unique capabilities

## Core User Groups

### 1. Talent (Candidates with Disabilities)

- Professionals with various types of disabilities seeking inclusive employment
- Users can specify disability categories including:
  - Physical disabilities
  - Sensory disabilities (vision, hearing)
  - Neurodevelopmental conditions (ADHD, autism spectrum, learning disabilities)
  - Mental health conditions
  - Intellectual disabilities
  - Acquired disabilities (TBI, stroke)
  - Chronic health conditions
  - Option to prefer not to disclose

### 2. Employers

- Organizations committed to inclusive hiring practices
- Companies seeking to diversify their workforce
- Employers who provide accessible workplaces and accommodations

## Key Features

### For Talent

- **Resume upload and AI-powered parsing** - Automated extraction of profile information
- **Voluntary self-identification** - Confidential disclosure of disability categories
- **Accommodation preferences** - Specify workplace accommodations needed:
  - Flexible schedule
  - Remote work options
  - Assistive technology
  - Accessible workspace
  - Flexible deadlines
  - Support person access
- **Disclosure preferences** - Control when to discuss accommodation needs (application, interview, post-offer, after starting)
- **Profile building** - Manual and automated profile completion
- **Job browsing** - Access to inclusive job opportunities
- **Career coaching** - AI-powered career guidance and support
- **Company discovery** - Browse and learn about inclusive employers

### For Employers

- **Job posting** - List positions with accessibility features
- **AI-powered candidate search** - Find talent based on skills and requirements
- **Candidate management** - Review and manage applications
- **Company profile** - Showcase commitment to accessibility and inclusion
- **Organization branding** - Upload logos and highlight inclusive practices

## Accessibility First Design

This application targets **WCAG 2.2 Level AAA** — the highest W3C standard — with **AODA** compliance as a legal requirement. Three implementation sprints have been completed; further phases are in progress.

### WCAG 2.2 AAA — Implemented Success Criteria

#### Sprint 1 — Visual & Focus Foundations

| SC | Criterion | Implementation |
|----|-----------|---------------|
| 1.4.6 | Contrast (Enhanced) | AAA token system in `globals.css`; `orange-900` (#7c2d12) = 9.4:1 on white; `#C27803` focus ring = 3:1+ on all backgrounds |
| 2.4.12 | Focus Not Obscured (Enhanced) | `scroll-padding-top: 80px` on `html`; `id="main-content"` on all `<main>` elements |
| 2.4.13 | Focus Appearance | 3 px `focus-visible` outline + box-shadow halo; white ring override for dark-bg buttons |
| 2.5.5 | Target Size (Enhanced) | All interactive elements ≥ 44×44 px; Pagination + CandidateDecisionButtons updated |

#### Sprint 2 — Semantics & Forms

| SC | Criterion | Implementation |
|----|-----------|---------------|
| 1.3.5 | Identify Input Purpose | `autoComplete` attributes on all sign-up inputs |
| 1.3.1 | Info and Relationships | Fieldset/legend groups for accessibility-needs checkboxes |
| 3.3.1/3.3.3 | Error Identification/Suggestion | `aria-invalid` + `aria-describedby` linkage on all form inputs and selects |
| 2.4.6 | Headings and Labels | Full heading hierarchy audit across both dashboards |
| 4.1.2 | Name, Role, Value | ARIA label sweep across navbars, buttons, and icon-only controls |

#### Sprint 3 — Timing, Navigation & Contrast

| SC | Criterion | Implementation |
|----|-----------|---------------|
| 2.2.3 | No Timing | Toast `setTimeout` auto-dismiss removed; user-controlled dismiss only |
| 2.2.1 | Timing Adjustable | `SessionExpiryWarning` — 28-min inactivity → 2-min countdown → Clerk `signOut()`; SR announcements at 60 s / 30 s / 10 s |
| 2.4.8 | Location | `Breadcrumb` component auto-derives trail from URL; structural segments (e.g. `employer`) skipped |
| 3.3.4/3.3.6 | Error Prevention | `ConfirmDialog` `requiresConfirmation` prop adds "I understand" checkbox before irreversible actions |
| 1.4.6 (sweep) | Contrast (Enhanced) | Status badges, icon colours, remove buttons all raised to `-900` shade family (7:1+) |

### Accessibility Components (`components/a11y/`)

| Component | Purpose | WCAG SC |
|-----------|---------|---------|
| `Breadcrumb.tsx` | Auto-derived breadcrumb nav; `aria-current="page"` on last crumb | 2.4.8 (AAA) |
| `ConfirmDialog.tsx` | `role="alertdialog"`, focus trap, Escape, `requiresConfirmation` checkbox | 3.3.4, 2.5.8 |
| `LiveRegion.tsx` | Polite/assertive live region for dynamic announcements | 4.1.3 |
| `SessionExpiryWarning.tsx` | Inactivity warning with countdown and extend-session button | 2.2.1 |
| `SkipLink.tsx` | Skip to main content | 2.4.1 |
| `ValidationIcon.tsx` | Non-colour error/success indicators | 1.4.1 |
| `VisuallyHidden.tsx` | Screen-reader-only content wrapper | — |

### AAA Colour Token System

```css
/* globals.css */
--focus-ring-color: #C27803;          /* amber-900 — 3:1+ against all light backgrounds */
/* Primary brand — orange-900 (#7c2d12) — 9.4:1 on white */
/* All focus rings: focus-visible:ring-[#C27803] */
/* All primary CTAs: bg-orange-900 hover:bg-orange-950 */
/* Status badge family: bg-{colour}-50/-100, text-{colour}-900 */
```

### Remaining WCAG Phases (not yet started)

| Phase | Topic |
|-------|-------|
| Phase 2 | Content/language — plain language, glossary, reading level, abbreviation expansion |
| Phase 3 | Navigation enhancements — additional keyboard shortcuts |
| Phase 4 | Keyboard/input operability audit |
| Phase 5 | Media policy — captions, audio descriptions |
| Phase 6 | Automated WCAG testing + governance documentation |

> **Open design decision**: Login/signup amber gradient backgrounds test at ~5.6:1 — below the AAA 7:1 threshold. Requires a design call.

### Supported Assistive Technologies

- Screen readers (NVDA, JAWS, VoiceOver, TalkBack)
- Screen magnification software
- Speech recognition software
- Keyboard-only navigation
- Switch devices and alternative input methods

## Technical Architecture

### Tech Stack

- **Frontend Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Validation**: Zod
- **Icons**: Lucide React
- **Authentication**: Clerk (`@clerk/nextjs`) + JWT (Clerk-issued template tokens; `jose` used for decoding/debugging)
- **Charts**: Chart.js with react-chartjs-2
- **Content**: React Markdown

### File Structure

```
app/
├── (login)/ - Authentication pages
│   ├── login-talent/
│   └── login-employer/
├── (sign-up)/ - Registration flows
│   ├── signup/ - Talent signup
│   │   ├── accessability-needs/ - Disability self-identification
│   │   ├── resume-upload/
│   │   └── manual-resume-fill/
│   └── signup-employer/ - Employer registration
├── (user-dashboard)/ - Talent dashboard
│   └── dashboard/
│       ├── profile/
│       ├── home/
│       ├── career-coach/
│       ├── my-jobs/
│       └── companies/
├── (employer)/ - Employer dashboard
│   └── employer/
│       └── dashboard/
│           ├── ai-search/
│           ├── candidates/
│           ├── listed-jobs/
│           ├── post-jobs/
│           ├── company-profile/
│           └── edit-job/
├── accessibility/ - Public accessibility statement
├── terms/ - Terms of Service (public)
├── privacy/ - Privacy Policy — PIPEDA/AODA (public)
└── page.tsx - Landing page
```

## Important Principles for Development

### 1. Accessibility is Non-Negotiable

- Every new feature must target **WCAG 2.2 AAA** standards (AA is the minimum floor)
- Test with keyboard navigation before deploying
- Include ARIA labels and semantic HTML
- Maintain **AAA contrast ratios: 7:1 for normal text, 4.5:1 for large text** (SC 1.4.6)
- Focus rings must use `focus-visible:ring-[#C27803]` and be at least 3 px (SC 2.4.13)
- Test with screen readers (NVDA, JAWS, VoiceOver)
- All interactive elements must be ≥ 44×44 px (SC 2.5.5)
- Use accessible dialogs from `components/a11y/ConfirmDialog` — never `window.confirm/alert/prompt`
- Don't rely on colour alone for information (use icons + text)
- Never add auto-dismissing toasts or timed actions without user control (SC 2.2.3)
- Add `<Breadcrumb />` to any new layout that is more than one level deep (SC 2.4.8)

### 2. Respect User Privacy and Dignity

- All disability information is **voluntary self-identification**
- Keep accessibility needs confidential
- Never require disclosure of disability information
- Provide options to "prefer not to disclose" or "discuss later"
- Emphasize dignity and independence in all messaging

### 3. Inclusive Language

- Use person-first language ("persons with disabilities" not "disabled persons")
- Focus on capabilities and talent, not limitations
- Emphasize "inclusive employers" rather than "employers who hire disabled people"
- Use empowering language: "exceptional talent," "unique capabilities"

### 4. Accommodation-Focused

- Always provide multiple ways to accomplish tasks
- Offer flexibility in deadlines and processes
- Support assistive technologies
- Allow users to control their disclosure timeline
- Provide clear, understandable instructions

### 5. Data Handling

- Resume parsing must handle failures gracefully (30-second timeout, retry options)
- Always offer manual entry as an alternative
- Validate and normalize data for backend compatibility
- Transform backend resume data to frontend schema properly

### 6. User Experience

- Provide clear feedback for all actions
- Use loading states during async operations
- Show error messages with actionable solutions
- Maintain focus management for screen reader users
- Use live regions for dynamic content announcements

## API Integration Patterns

### Candidate Profile Management

- `GET/POST /api/candidates/profiles/` - Create and retrieve profiles
- `PATCH /api/candidates/profiles/{slug}/` - Update profile data
- `POST /api/candidates/profiles/{slug}/parse-resume/` - Trigger resume parsing
- `GET /api/candidates/profiles/{slug}/parsing-status/?include_resume=true` - Poll parsing status

### Authentication

- **Clerk is the source of truth for user authentication** (email/password, OTP, OAuth, session management).
- **Frontend session** is maintained by Clerk cookies. Server-side code uses `auth()` from `@clerk/nextjs/server` to read the logged-in user.
- **Backend API authentication** is done by sending a Clerk-issued JWT in `Authorization: Bearer <token>` when proxying requests to Django.
  - Tokens are issued via `getToken({ template })` using a Clerk JWT template (commonly `template="api"` so `aud` is set).
  - `sub` is the Clerk user id (`user_...`) and is what the backend uses to identify the user.
  - The template name is controlled by `CLERK_JWT_TEMPLATE` (environment variable) in this codebase.
- `GET /api/user/me` is the frontend "who am I" call: it checks that a Clerk session exists, then calls the backend `/api/auth/users/me/` with the Bearer token to fetch Django user + role data.

#### Debugging (local/dev only)

- `GET /api/auth/debug-token` can be used to manually fetch a Clerk JWT for the currently logged-in user/session for backend testing.
- Never log or expose full JWTs in production logs.

### Resume Parsing Flow

1. Upload resume file
2. POST to `/parse-resume/` endpoint
3. Immediately GET `/parsing-status/` to start processing
4. Poll `/parsing-status/?include_resume=true` every 1.5 seconds
5. Max 20 attempts (30 seconds timeout)
6. Handle states: "parsing", "parsed", "failed"
7. Offer retry or manual entry on failure

## Environment Value

The platform emphasizes:

- **Empowering careers through accessibility and opportunity** (tagline)
- **Connecting exceptional talent with inclusive employers** (mission)
- Equal access to employment opportunities
- Dignity and independence for persons with disabilities
- Continuous improvement of accessibility features
- **Commitment to AODA and WCAG 2.2 AAA compliance**

## Legal & Standards Compliance

- **WCAG 2.2 Level AAA** — W3C Web Content Accessibility Guidelines (target level; AA is the legal minimum)
- **AODA** — Accessibility for Ontarians with Disabilities Act (legal requirement)
- **PIPEDA** — Personal Information Protection and Electronic Documents Act (Privacy Policy covers full rights: access, correction, deletion, portability, OPC complaint)
- **ISO/IEC 40500:2025** — International accessibility standard (equivalent to WCAG 2.2)
- **EAA** — European Accessibility Act compliance ready

### Legal Pages
- `app/privacy/page.tsx` — Privacy Policy (12 sections; PIPEDA/AODA; disability data protections; contact: privacy@enabledtalent.com)
- `app/terms/page.tsx` — Terms of Service (13 sections; Ontario courts; contact: legal@enabledtalent.com)
- `app/accessibility/page.tsx` — Accessibility Statement (contact: accessibility@enabledtalent.com)

## Contact & Feedback

- **Accessibility Feedback**: accessibility@enabledtalent.com
- **Response Time**: 5 business days for accessibility concerns
- **Landing Page**: https://www.enabledtalent.com/

## Development Guidelines

### When Adding Features

1. **Start with accessibility** - Design with keyboard and screen reader users in mind
2. **Test early and often** - Use automated tools and manual testing
3. **Consider cognitive load** - Keep interfaces simple and clear
4. **Provide alternatives** - Offer multiple ways to complete tasks
5. **Use semantic HTML** - Let the browser do the heavy lifting
6. **Focus management** - Move focus logically and announce changes
7. **Error handling** - Provide clear, actionable error messages
8. **Loading states** - Always show progress for async operations

### Before Deploying (WCAG 2.2 AAA Checklist)

**Visual & Contrast**
- [ ] Colour contrast ≥ 7:1 for normal text, ≥ 4.5:1 for large text (SC 1.4.6)
- [ ] Focus ring visible: `focus-visible:ring-[#C27803]` 3 px (SC 2.4.13)
- [ ] No information conveyed by colour alone — icons or text alongside (SC 1.4.1)
- [ ] Status badges use `-900` text on `-50`/`-100` backgrounds

**Keyboard & Focus**
- [ ] Test with keyboard only (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [ ] Focus indicator never fully hidden behind sticky headers (SC 2.4.12)
- [ ] All interactive elements ≥ 44×44 px (SC 2.5.5)
- [ ] No drag-only interactions without single-pointer alternatives (SC 2.5.7)

**Screen Reader**
- [ ] Test with NVDA (Windows) or VoiceOver (macOS/iOS)
- [ ] Validate ARIA labels, roles, and `aria-current` on active nav items
- [ ] Error messages announced immediately (`role="alert"` or `aria-live="assertive"`)
- [ ] Forms: `aria-invalid` + `aria-describedby` linked to error text
- [ ] Decorative icons have `aria-hidden="true"`

**Forms & Input**
- [ ] `autoComplete` attributes on all personal data inputs (SC 1.3.5)
- [ ] Grouped controls use `<fieldset>`/`<legend>` (SC 1.3.1)
- [ ] Irreversible actions use `<ConfirmDialog requiresConfirmation>` (SC 3.3.4)
- [ ] No CAPTCHA or cognitive tests in authentication (SC 3.3.8)

**Navigation & Timing**
- [ ] `<Breadcrumb />` present in layouts ≥ 2 levels deep (SC 2.4.8)
- [ ] No auto-dismissing toasts or timed UI — user controls all dismissal (SC 2.2.3)
- [ ] `<SessionExpiryWarning />` present in authenticated layouts (SC 2.2.1)
- [ ] `id="main-content"` on `<main>` element; `<SkipLink />` in layout header (SC 2.4.1)

**Language & Content**
- [ ] Review for inclusive, person-first language
- [ ] Heading hierarchy is logical (h1 → h2 → h3, no skips)

**Tooling**
- [ ] Run axe DevTools or Lighthouse accessibility audit (zero violations)
- [ ] Run `npm run lint` — zero ESLint errors

## Git Repository

- **Current Branch**: feature/new-branch
- **Main Branch**: master (use for PRs)
- Recent work includes: WCAG AAA Sprint 1–3 (colour tokens, focus, touch targets, breadcrumbs, session expiry, contrast sweep), Google Places API integration replacing OpenStreetMap, date validation improvements, Terms of Service and Privacy Policy pages

---

**Remember**: Every line of code in this application serves people with disabilities seeking meaningful employment. Build with empathy, test thoroughly, and prioritize accessibility in every decision.
