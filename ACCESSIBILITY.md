# Accessibility — ENABLED HR LABS INC.

## Target Standard

**WCAG 2.2 Level AAA** across all user-facing pages and components.

Where a specific AAA criterion is technically infeasible (e.g. live media captions — no video content currently exists), it is documented below under [Known Exceptions](#known-exceptions).

---

## Ownership

| Role | Responsibility |
|---|---|
| Engineering lead | Final sign-off before merge |
| PR author | Run axe scan + manual keyboard check on changed components |
| Design | Ensure new designs meet 7:1 contrast ratio and 44×44 px touch targets |

Contact for accessibility concerns: **jeby@enabledtalent.com**

---

## Completed Implementation (Sprints 1–4 + Phases 2–4)

### Sprint 1 — Colour & Focus
- Colour tokens at 7:1 contrast (orange-900 = #7c2d12, 9.4:1 on white)
- Focus ring: 3px solid #C27803 with 2px offset (SC 2.4.13)
- Focus not obscured by sticky headers (SC 2.4.12)
- Touch targets ≥ 44×44 px (SC 2.5.5)

### Sprint 2 — Structure & Forms
- ARIA labels, heading hierarchy, error linkage
- `autoComplete` on all auth/profile fields
- `<fieldset>` + `<legend>` on all radio/checkbox groups

### Sprint 3 — Timing & Feedback
- Toast notifications: no auto-dismiss timer (SC 2.2.3)
- Breadcrumb navigation on all dashboard pages (SC 2.4.8)
- Contrast sweep — all body text ≥ 7:1 (SC 1.4.6)
- Session expiry warning with 2-min countdown (SC 2.2.1)
- ConfirmDialog with `requiresConfirmation` for irreversible actions (SC 3.3.4)

### Sprint 4 — Re-auth, Motion, Abbreviations
- Re-auth data preservation: return path + session-expired banner (SC 2.2.5)
- `scrollBehavior()` util — respects `prefers-reduced-motion` (SC 2.3.3)
- `motion-reduce:animate-none` on animated elements
- `<abbr title="...">` on all abbreviations (SC 3.1.4)

### Phase 2 — Content & Language
- `<Glossary>` component (`<dfn>`) for jargon terms (SC 3.1.3)
- `abbr[title] { text-decoration: none }` in globals.css
- Jargon simplified across signup and OAuth flows (SC 3.1.5)

### Phase 3 — Navigation
- No generic link text found (SC 2.4.9 — clean)
- Page `<h1>` on all dashboard pages (SC 2.4.10)
- Fixed nested `<main>` in home page
- Consistent nav order and identification across both dashboards (SC 3.2.3, 3.2.4)
- `aria-expanded` on expand/collapse buttons

### Phase 4 — Keyboard & Input
- Focus trap on all modals: ConfirmDialog, SendInvitesModal, SuccessModal (SC 2.1.3)
- Apply-to-job confirmation dialog (SC 3.3.6)
- `beforeunload` unsaved-changes warning on profile update (SC 3.3.6)
- Help text (`aria-describedby`) on JobForm title + location fields (SC 3.3.5)

---

## How to Test a PR

### 1. Automated (required)
```bash
npm test -- --testPathPattern=a11y
```
Runs jest-axe checks on all components under `__tests__/a11y/`.

### 2. Browser scan (required for new pages)
Install the **axe DevTools** browser extension (free tier).
Open the new page → click the axe icon → run analysis → 0 violations required before merge.

### 3. Manual keyboard check (required for interactive components)
- Press **Tab** through all interactive elements — every one must be reachable and have a visible focus ring.
- Press **Enter** / **Space** to activate buttons and links.
- Open any modal → Tab must stay trapped inside → **Escape** must close it → focus must return to the trigger.
- Fill a form → submit → error messages must be announced by the browser (check `role="alert"` or `aria-live`).

### 4. Screen reader (required for new flows)
- **Windows**: NVDA + Chrome — test signup, login, job apply.
- **macOS/iOS**: VoiceOver + Safari — test same flows.
- Every interactive element must be announced with its role and label.

### 5. Zoom
- Set browser zoom to **400%** at 1280 px viewport.
- No content should be hidden, clipped, or require horizontal scrolling to read.

---

## Running Tests Locally

```bash
# Install test dependencies (first time only)
npm install --save-dev jest jest-environment-jsdom @testing-library/react \
  @testing-library/jest-dom jest-axe @types/jest @types/jest-axe

# Run all accessibility tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Adding a New Component

1. Create `__tests__/a11y/YourComponent.test.tsx`.
2. Use the existing tests as a template — render the component and call `expect(await axe(container)).toHaveNoViolations()`.
3. Run `npm test` — all tests must pass before opening a PR.

---

## Known Exceptions

| Criterion | Reason | Status |
|---|---|---|
| SC 1.2.6–1.2.9 (Sign Language, Extended Audio) | No video content | N/A — revisit if video is added |
| SC 2.4.9 (Link Purpose — Link Only) | Audited clean — no generic link text | Passing |
| Login/signup amber gradient backgrounds | ~5.6:1 contrast on decorative elements only; all body text meets 7:1 | **Design decision pending** |

---

## Raising an Issue

File a GitHub issue with the label `accessibility` and include:
- The WCAG criterion (e.g. SC 1.4.6)
- The page/component affected
- Steps to reproduce
- Assistive technology and browser used

Or email **jeby@enabledtalent.com**.

---

*Last updated: February 2026 — ENABLED HR LABS INC.*
