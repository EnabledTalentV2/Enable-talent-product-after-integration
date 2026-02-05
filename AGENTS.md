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

This application is built with **WCAG 2.2 Level AA compliance** (the current W3C standard as of December 2024) and **AODA standards** as core requirements:

### WCAG 2.2 Compliance

WCAG 2.2 is the latest W3C accessibility standard, published October 2023 and updated December 2024. It builds upon WCAG 2.1 with 9 new success criteria focused on:

- Mobile/touch accessibility
- Cognitive accessibility
- Focus management
- Authentication without cognitive tests

### Implemented Accessibility Features

#### Core Features (WCAG 2.0/2.1)

- **Keyboard navigation** - All functionality accessible without a mouse
- **Skip navigation links** - Bypass repetitive content (2.4.1)
- **Visible focus indicators** - Clear visual feedback for keyboard users (2.4.7)
- **High contrast ratios** - 4.5:1 for normal text, 3:1 for large text (1.4.3)
- **Screen reader support** - Proper ARIA labels, semantic HTML, live regions (4.1.2, 4.1.3)
- **Form accessibility** - Clear labels, error messages, required field indicators (3.3.1, 3.3.2)
- **Alternative text** - Descriptive alt text for all images (1.1.1)
- **Reduced motion support** - Respects user preferences (2.3.3)
- **High contrast mode compatibility** - Windows High Contrast Mode support

#### WCAG 2.2 New Criteria

- **Focus Not Obscured (2.4.11)** - Focused elements never hidden by sticky headers
- **Dragging Movements (2.5.7)** - Single-pointer alternatives for drag operations
- **Target Size Minimum (2.5.8)** - 24x24px minimum, 44x44px for touch devices
- **Consistent Help (3.2.6)** - Help mechanisms in consistent locations
- **Redundant Entry (3.3.7)** - Previously entered info auto-populated
- **Accessible Authentication (3.3.8)** - No CAPTCHA or cognitive tests required

### Accessibility Components

The codebase includes dedicated accessibility components in `components/a11y/`:

- **SkipLink** - Skip to main content link
- **VisuallyHidden** - Screen reader-only content
- **LiveRegion** - Announcements for dynamic content
- **ConfirmDialog** - Accessible modal dialogs (replaces window.confirm)
- **ValidationIcon** - Non-color error/status indicators

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
- **Authentication**: JWT (jose library)
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
└── page.tsx - Landing page
```

## Important Principles for Development

### 1. Accessibility is Non-Negotiable

- Every new feature must meet **WCAG 2.2 AA** standards
- Test with keyboard navigation before deploying
- Include ARIA labels and semantic HTML
- Maintain color contrast ratios (4.5:1 normal text, 3:1 large text)
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure minimum touch target sizes (24x24px desktop, 44x44px mobile)
- Use accessible dialogs (never window.confirm/alert/prompt)
- Don't rely on color alone for information (use icons + text)

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

- `GET /api/user/me` - Check session and get user data
- Uses JWT tokens with jose library
- Credential-based auth with cookies

### Resume Parsing Flow

1. Upload resume file
2. POST to `/parse-resume/` endpoint
3. Immediately GET `/parsing-status/` to start processing
4. Poll `/parsing-status/?include_resume=true` every 1.5 seconds
5. Max 20 attempts (30 seconds timeout)
6. Handle states: "parsing", "parsed", "failed"
7. Offer retry or manual entry on failure

## Environment Valuehttps://www.enabledtalent.com/

The platform emphasizes:

- **Empowering careers through accessibility and opportunity** (tagline)
- **Connecting exceptional talent with inclusive employers** (mission)
- Equal access to employment opportunities
- Dignity and independence for persons with disabilities
- Continuous improvement of accessibility features
- **Commitment to AODA and WCAG 2.2 AA compliance**

## Legal & Standards Compliance

- **WCAG 2.2 Level AA** - W3C Web Content Accessibility Guidelines (current standard)
- **AODA** - Accessibility for Ontarians with Disabilities Act
- **ISO/IEC 40500:2025** - International accessibility standard (equivalent to WCAG 2.2)
- **EAA** - European Accessibility Act compliance ready

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

### Before Deploying (WCAG 2.2 AA Checklist)

- [ ] Test with keyboard only (Tab, Enter, Escape, Arrow keys)
- [ ] Verify focus indicators are visible and not obscured (2.4.7, 2.4.11)
- [ ] Test with screen reader (NVDA or VoiceOver)
- [ ] Check color contrast ratios (4.5:1 text, 3:1 UI components)
- [ ] Validate ARIA labels and roles
- [ ] Test forms with assistive technology
- [ ] Verify error messages are announced (use role="alert")
- [ ] Test on mobile with screen reader
- [ ] Verify touch targets are at least 44x44px on mobile (2.5.8)
- [ ] Ensure no drag-only interactions without alternatives (2.5.7)
- [ ] Check that help is in consistent location (3.2.6)
- [ ] Verify no cognitive tests in authentication (3.3.8)
- [ ] Review for inclusive language
- [ ] Run axe DevTools or Lighthouse accessibility audit

## Git Repository

- **Current Branch**: preproduction
- **Main Branch**: master (use for PRs)
- Recent work includes: landing page updates, profile completion improvements, validation enhancements, employer branding features

---

**Remember**: Every line of code in this application serves people with disabilities seeking meaningful employment. Build with empathy, test thoroughly, and prioritize accessibility in every decision.
