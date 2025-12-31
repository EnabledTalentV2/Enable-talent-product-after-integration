# Option B: Temporary Signup Token System - Backend Implementation Guide

## Overview

This document describes the temporary signup token system (Option B) that enables authenticated resume parsing during the signup flow, before a user fully completes registration.

## Problem Statement

The resume parsing endpoint `/api/candidates/profiles/{slug}/parse-resume/` requires authentication and a profile slug. However, during signup:

1. The user hasn't completed registration yet (no session/cookie)
2. No candidate profile exists yet (no slug)

## Solution: Temporary Signup Token

Create a two-phase signup process:

1. **Phase 1 (Signup Init)**: User provides email/password → Backend creates temporary/pending user → Returns short-lived token
2. **Phase 2 (Resume Parse)**: Frontend uses temporary token to authenticate resume parsing
3. **Phase 3 (Complete Signup)**: User fills remaining details → Full registration completes

---

## Backend Endpoints Required

### 1. POST `/api/auth/signup-init/`

**Purpose**: Initialize signup process and return a temporary token for authenticated operations.

**Request**:

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (Success - 200)**:

```json
{
  "temporary_token": "eyJ...",
  "expires_in": 3600,
  "user_id": "temp-uuid-or-pending-user-id"
}
```

**Response (Email Already Exists - 400)**:

```json
{
  "detail": "A user with this email already exists."
}
```

**Implementation Notes**:

- Create a "pending" user record or use a separate pending_signups table
- Generate a short-lived JWT (15-60 minutes expiry)
- Token should encode: email, user_id (if created), type: "signup_init"
- Do NOT send verification email yet (that happens after full signup)
- Password should be hashed and stored for later use

### 2. POST `/api/candidates/parse-resume/` (Modified)

**Purpose**: Parse resume file. Should accept both session auth AND temporary signup tokens.

**Headers**:

- `Authorization: Bearer <temporary_token>` - For signup flow
- OR standard session cookie - For logged-in users

**Request**:

- Content-Type: `multipart/form-data`
- Body: `file` (PDF, DOC, DOCX, or image)

**Response (Success - 200)**:

```json
{
  "basicInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "country": "USA",
    "linkedIn": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe"
  },
  "education": {
    "qualification": "Bachelor's Degree",
    "fieldOfStudy": "Computer Science",
    "university": "State University",
    "graduationYear": "2020"
  },
  "workExperience": {
    "jobTitle": "Software Engineer",
    "companyName": "Tech Corp",
    "experienceType": "Full-time",
    "startDate": "2020-01",
    "endDate": "present",
    "jobDescription": "Developed web applications..."
  },
  "skills": {
    "skillsList": ["Python", "JavaScript", "React", "Django"]
  }
}
```

**Implementation Notes**:

- Check for `Authorization: Bearer` header first
- If present, validate temporary token and allow operation
- If not present, fall back to session cookie authentication
- For temporary tokens, don't require a profile slug - create parsing as a stateless operation

---

## Frontend Implementation (Already Done)

### Files Modified:

1. **`lib/api-config.ts`**

   - Added `signupInit` endpoint URL
   - Added `candidateProfiles.parseResume(slug)` function

2. **`app/api/auth/signup-init/route.ts`** (NEW)

   - Proxies signup-init request to Django
   - Returns temporary token to frontend

3. **`app/api/resume/parse/route.ts`** (MODIFIED)

   - Accepts `X-Signup-Token` header
   - Forwards as `Authorization: Bearer` to Django

4. **`app/(sign-up)/signup/page.tsx`** (MODIFIED)

   - Calls `/api/auth/signup-init` on form submit
   - Stores temporary token in sessionStorage

5. **`app/(sign-up)/signup/resume-upload/page.tsx`** (MODIFIED)
   - Reads temporary token from sessionStorage
   - Sends token with resume parse request

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        SIGNUP FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User enters email/password on /signup                        │
│           │                                                      │
│           ▼                                                      │
│  2. Frontend calls POST /api/auth/signup-init                    │
│           │                                                      │
│           ▼                                                      │
│  3. Backend creates pending user, returns temporary_token        │
│           │                                                      │
│           ▼                                                      │
│  4. Frontend stores token in sessionStorage                      │
│           │                                                      │
│           ▼                                                      │
│  5. User navigates to /signup/resume-upload                      │
│           │                                                      │
│           ▼                                                      │
│  6. User uploads resume file                                     │
│           │                                                      │
│           ▼                                                      │
│  7. Frontend calls POST /api/resume/parse                        │
│     with X-Signup-Token header                                   │
│           │                                                      │
│           ▼                                                      │
│  8. Backend validates token, parses resume                       │
│           │                                                      │
│           ▼                                                      │
│  9. Frontend receives parsed data, populates form                │
│           │                                                      │
│           ▼                                                      │
│  10. User completes form on /signup/manual-resume-fill           │
│           │                                                      │
│           ▼                                                      │
│  11. Frontend calls POST /api/auth/signup                        │
│      (same as before, but backend can link pending user)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

1. **Token Expiry**: Temporary tokens should expire quickly (15-60 minutes)
2. **Single Use**: Consider making tokens single-use for resume parsing
3. **Rate Limiting**: Apply rate limiting to `/api/auth/signup-init/`
4. **Cleanup**: Automatically clean up pending users that never complete signup
5. **No Sensitive Data**: Don't store sensitive profile data in pending state

---

## Alternative: Unauthenticated Resume Parsing

If the above is too complex, a simpler alternative:

1. Make `/api/candidates/parse-resume/` accept unauthenticated requests
2. Return only parsed text (no persistence)
3. All data is client-side until actual signup completes

This is less secure but much simpler to implement.

---

## Testing

Frontend is prepared to handle both success and failure cases:

- If `signup-init` fails → Signup continues without token (graceful degradation)
- If resume parsing fails → Warning shown, user fills form manually
- If resume parsing succeeds → Form is pre-populated with parsed data

---

## Questions for Backend Team

1. Should we use a separate `pending_signups` table or mark users as "pending" in the main users table?
2. What should be the token expiry time?
3. Should tokens be single-use or allow multiple resume uploads?
4. How should we handle the case where a user starts signup but never completes it?
