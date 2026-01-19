# UserData Flow - Signup & Editing

Complete documentation of how user data flows from frontend to backend during signup and profile editing.

---

## Table of Contents
1. [Signup Flow](#signup-flow)
2. [Profile Editing Flow](#profile-editing-flow)
3. [API Endpoints](#api-endpoints)
4. [Payload Builders](#payload-builders)
5. [Data Mapping](#data-mapping)

---

## Signup Flow

### Phase 1: Initial Account Creation
**File:** `app/(sign-up)/signup/page.tsx`

```typescript
// User fills form with: fullName, email, password
const [firstName, ...rest] = fullName.trim().split(/\s+/);
const lastName = rest.join(" ");

// Step 1: Create account (email + password only)
await signupCandidate({
  email: email.trim(),
  password,
  confirm_password: password
});
// Endpoint: POST /api/auth/signup/
// Payload: { email, password, confirm_password }

// Step 2: Login (if session not established)
if (!hasSession) {
  await loginCandidate({ email, password });
  // Endpoint: POST /api/auth/login/
  // Payload: { email, password }
}

// Step 3: Set user name (mandatory)
await apiRequest("/api/users/profile/", {
  method: "PATCH",
  body: JSON.stringify({
    first_name: firstName,
    last_name: lastName
  })
});
// Endpoint: PATCH /api/users/profile/
// Payload: { first_name, last_name }
// IMPORTANT: Name lives in User model, not CandidateProfile

// Step 4: Navigate to resume upload
router.push("/signup/resume-upload");
```

**Key Points:**
- ✅ Account creation only requires email + password
- ✅ Name is set immediately after via `/api/users/profile/`
- ✅ Name lives in **User model** (not CandidateProfile)
- ✅ Stored in `userDataStore` for later use

---

### Phase 2: Resume Upload (Optional)
**File:** `app/(sign-up)/signup/resume-upload/page.tsx`

```typescript
// Upload actual PDF file to backend
const formData = new FormData();
formData.append("resume_file", pdfFile);

await apiRequest(`/api/candidates/profiles/${slug}/`, {
  method: "PATCH",
  body: formData  // multipart/form-data
});
// Endpoint: PATCH /api/candidates/profiles/{slug}/
// Backend: Uploads to Supabase, stores URL, triggers parsing
```

**What Backend Does:**
1. Receives PDF file
2. Uploads to Supabase Storage
3. Saves URL in `CandidateProfile.resume_file`
4. Triggers async parsing (Celery task)
5. Populates `resume_data` field when complete

---

### Phase 3: Accessibility Preferences
**File:** `app/(sign-up)/signup/accessability-needs/page.tsx`

```typescript
// Save accessibility preferences
const profilePayload = buildCandidateProfileCorePayload(userData);

await apiRequest(`/api/candidates/profiles/${slug}/`, {
  method: "PATCH",
  body: JSON.stringify(profilePayload)
});
// Endpoint: PATCH /api/candidates/profiles/{slug}/
// Payload: {
//   disability_categories: [...],
//   accommodation_needs: "YES" | "NO" | "PREFER_TO_DISCUSS_LATER",
//   workplace_accommodations: [...]
// }
```

**Payload Built By:** `buildCandidateProfileCorePayload()`
- Only sends: preferences, accessibility data
- Does NOT send: education, skills, languages (those have separate endpoints)

---

### Phase 4: Manual Profile Entry
**File:** `app/(sign-up)/signup/manual-resume-fill/page.tsx`

This is a **10-step wizard** where user fills in all profile details:
1. Basic Info
2. Education
3. Work Experience
4. Skills
5. Projects
6. Achievements
7. Certification
8. Preference
9. Other Details
10. Review And Agree

**Data is stored in Zustand but NOT sent to backend until final step.**

---

## Profile Editing Flow

### Final Submission (Step 10: Review And Agree)
**File:** `app/(sign-up)/signup/manual-resume-fill/page.tsx:550-660`

```typescript
const handleFinish = async () => {
  // Get all data from userDataStore
  const finalizedData = { ...userData };

  // ========================================
  // STEP 1: Update User name
  // ========================================
  const firstName = finalizedData.basicInfo.firstName.trim();
  const lastName = finalizedData.basicInfo.lastName.trim();

  if (firstName || lastName) {
    await apiRequest("/api/users/profile/", {
      method: "PATCH",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName
      })
    });
  }
  // Endpoint: PATCH /api/users/profile/
  // Updates: User.first_name, User.last_name
  // Why: Names live in User model, not CandidateProfile

  // ========================================
  // STEP 2: Update Candidate Profile Core
  // ========================================
  const profilePayload = buildCandidateProfileCorePayload(finalizedData);

  if (Object.keys(profilePayload).length > 0) {
    await apiRequest(`/api/candidates/profiles/${slug}/`, {
      method: "PATCH",
      body: JSON.stringify(profilePayload)
    });
  }
  // Endpoint: PATCH /api/candidates/profiles/{slug}/
  // Updates: Preferences, work modes, salary expectations, accessibility
  // Payload example:
  // {
  //   employment_type_preferences: ["full-time", "contract"],
  //   work_mode_preferences: ["hybrid", "remote"],
  //   expected_salary_range: "90000-120000",
  //   is_available: true,
  //   disability_categories: ["visual"],
  //   accommodation_needs: "YES",
  //   workplace_accommodations: ["flexible_schedule"]
  // }

  // ========================================
  // STEP 3: Fetch existing data to avoid duplicates
  // ========================================
  const fullProfile = await fetchCandidateProfileFull(slug);
  const existingEducation = fullProfile?.verified_profile?.education || [];
  const existingSkills = fullProfile?.verified_profile?.skills || [];
  const existingLanguages = fullProfile?.verified_profile?.languages || [];
  // Endpoint: GET /api/candidates/profiles/{slug}/full/
  // Returns: Complete profile with verified_profile section

  // ========================================
  // STEP 4: Create Education entries
  // ========================================
  const educationPayloads = buildCandidateEducationPayloads(
    finalizedData,
    existingEducation  // Avoids duplicates
  );

  for (const payload of educationPayloads) {
    await apiRequest("/api/candidates/education/", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
  // Endpoint: POST /api/candidates/education/
  // Payload example:
  // {
  //   course_name: "Bachelor of Technology",
  //   major: "Computer Engineering",
  //   institution: "York University",
  //   start_year: 2021,
  //   end_year: 2025
  // }
  // Note: Creates separate Education records

  // ========================================
  // STEP 5: Create Skill entries
  // ========================================
  const skillPayloads = buildCandidateSkillPayloads(
    finalizedData,
    existingSkills  // Avoids duplicates
  );

  for (const payload of skillPayloads) {
    await apiRequest("/api/candidates/skills/", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
  // Endpoint: POST /api/candidates/skills/
  // Payload example:
  // {
  //   name: "python",
  //   level: "intermediate"
  // }
  // Note: Creates separate Skill records

  // ========================================
  // STEP 6: Create Language entries
  // ========================================
  const languagePayloads = buildCandidateLanguagePayloads(
    finalizedData,
    existingLanguages  // Avoids duplicates
  );

  for (const payload of languagePayloads) {
    await apiRequest("/api/candidates/languages/", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
  // Endpoint: POST /api/candidates/languages/
  // Payload example:
  // {
  //   language: "English",
  //   speaking: "advanced",
  //   reading: "advanced",
  //   writing: "advanced"
  // }
  // Note: Language levels are enums (basic/intermediate/advanced)

  // ========================================
  // STEP 7: Mark signup complete and redirect
  // ========================================
  markSignupComplete();
  router.push("/dashboard");
};
```

---

## API Endpoints

### User Endpoints (Name only)
```
PATCH /api/users/profile/
- Updates: User.first_name, User.last_name
- Payload: { first_name, last_name }
- When: Signup + Final submission
```

### Candidate Profile Endpoints
```
POST /api/candidates/profiles/
- Creates: CandidateProfile record
- Auto-called when needed
- Returns: { slug, ...profile }

PATCH /api/candidates/profiles/{slug}/
- Updates: Core profile data (preferences, accessibility, resume_file)
- Payload: buildCandidateProfileCorePayload()
- When: Resume upload, accessibility, final submission

GET /api/candidates/profiles/{slug}/
- Returns: Basic profile data
- Used for: Polling resume_data

GET /api/candidates/profiles/{slug}/full/
- Returns: Complete profile with verified_profile
- Includes: user, education, skills, languages, preferences
```

### Separate Entity Endpoints
```
POST /api/candidates/education/
- Creates: Education record
- Payload: { course_name, major, institution, start_year, end_year }

POST /api/candidates/skills/
- Creates: Skill record
- Payload: { name, level }

POST /api/candidates/languages/
- Creates: Language record
- Payload: { language, speaking, reading, writing }

POST /api/candidates/notes/
- Creates: Note record (internal/recruiter use)
- Payload: { identifier, note, section }
```

---

## Payload Builders

### 1. `buildCandidateProfileCorePayload(userData)`
**File:** `lib/candidateProfileUtils.ts:651-653`

**Returns:**
```typescript
{
  employment_type_preferences: string[],  // ["full-time", "contract"]
  work_mode_preferences: string[],        // ["hybrid", "remote"]
  expected_salary_range: string,          // "90000-120000"
  is_available: boolean,                  // true if availability set
  disability_categories: string[],        // ["visual", "hearing"]
  accommodation_needs: string,            // "YES" | "NO" | "PREFER_TO_DISCUSS_LATER"
  workplace_accommodations: string[]      // ["flexible_schedule"]
}
```

**Maps from UserData:**
- `preference.jobType` → `employment_type_preferences`
- `preference.jobSearch` → `work_mode_preferences`
- `otherDetails.desiredSalary` → `expected_salary_range`
- `otherDetails.availability` → `is_available`
- `accessibilityNeeds.*` → `disability_categories`, `accommodation_needs`, `workplace_accommodations`

**What it DOES NOT include:**
- ❌ Education (separate endpoint)
- ❌ Skills (separate endpoint)
- ❌ Languages (separate endpoint)
- ❌ Work experience (not sent to backend yet)
- ❌ Projects (not sent to backend yet)
- ❌ Certifications (not sent to backend yet)
- ❌ Achievements (not sent to backend yet)

---

### 2. `buildCandidateEducationPayloads(userData, existing)`
**File:** `lib/candidateProfileUtils.ts:676-716`

**Returns:**
```typescript
[{
  course_name: string,
  major: string,
  institution: string,
  start_year: number,
  end_year: number
}]
```

**Logic:**
- Only sends **ONE education entry** (the first one)
- Checks for duplicates by comparing course + institution
- Returns empty array if already exists

---

### 3. `buildCandidateSkillPayloads(userData, existing)`
**File:** `lib/candidateProfileUtils.ts:718-739`

**Returns:**
```typescript
[{
  name: string,
  level: "intermediate"  // Default level
}]
```

**Logic:**
- Parses skills from `userData.skills.skills` (comma-separated)
- Merges with `userData.skills.primaryList`
- Filters out existing skills to avoid duplicates
- Default level: "intermediate"

---

### 4. `buildCandidateLanguagePayloads(userData, existing)`
**File:** `lib/candidateProfileUtils.ts:741-769`

**Returns:**
```typescript
[{
  language: string,
  speaking: "basic" | "intermediate" | "advanced",
  reading: "basic" | "intermediate" | "advanced",
  writing: "basic" | "intermediate" | "advanced"
}]
```

**Logic:**
- Normalizes language levels from frontend format to backend enums
- Frontend: "Basic", "Intermediate", "Fluent" → Backend: "basic", "intermediate", "advanced"
- Filters out existing languages to avoid duplicates
- All three fields (speaking, reading, writing) are required

---

## Data Mapping

### Frontend UserData → Backend Models

| Frontend (UserData) | Backend Model | Endpoint | When Sent |
|---------------------|---------------|----------|-----------|
| `basicInfo.firstName` | `User.first_name` | `PATCH /api/users/profile/` | Signup + Final |
| `basicInfo.lastName` | `User.last_name` | `PATCH /api/users/profile/` | Signup + Final |
| `basicInfo.email` | `User.email` | `POST /api/auth/signup/` | Signup only |
| `education.*` | `Education` model | `POST /api/candidates/education/` | Final step |
| `skills.*` | `CandidateSkill` model | `POST /api/candidates/skills/` | Final step |
| `otherDetails.languages` | `Language` model | `POST /api/candidates/languages/` | Final step |
| `preference.jobType` | `CandidateProfile.employment_type_preferences` | `PATCH /api/candidates/profiles/{slug}/` | Accessibility + Final |
| `preference.jobSearch` | `CandidateProfile.work_mode_preferences` | `PATCH /api/candidates/profiles/{slug}/` | Accessibility + Final |
| `otherDetails.desiredSalary` | `CandidateProfile.expected_salary_range` | `PATCH /api/candidates/profiles/{slug}/` | Accessibility + Final |
| `accessibilityNeeds.categories` | `CandidateProfile.disability_categories` | `PATCH /api/candidates/profiles/{slug}/` | Accessibility + Final |
| `accessibilityNeeds.accommodationNeed` | `CandidateProfile.accommodation_needs` | `PATCH /api/candidates/profiles/{slug}/` | Accessibility + Final |
| `accessibilityNeeds.accommodations` | `CandidateProfile.workplace_accommodations` | `PATCH /api/candidates/profiles/{slug}/` | Accessibility + Final |

### NOT Sent to Backend Yet
These are stored in frontend but not saved to backend during signup:

- ❌ `workExperience.entries` - Not implemented in backend API yet
- ❌ `projects.entries` - Not implemented in backend API yet
- ❌ `achievements.entries` - Not implemented in backend API yet
- ❌ `certification.entries` - Not implemented in backend API yet
- ❌ `basicInfo.phone` - Not sent (could be added to User model)
- ❌ `basicInfo.location` - Not sent (could be added to verified_profile)
- ❌ `basicInfo.linkedinUrl` - Not sent (could be added to verified_profile)
- ❌ `basicInfo.githubUrl` - Not sent (could be added to verified_profile)

---

## Key Design Patterns

### 1. Separation of Concerns
```
User model (Django Auth)
  ├─ first_name, last_name, email
  └─ Endpoint: PATCH /api/users/profile/

CandidateProfile model
  ├─ Preferences, accessibility, resume_file
  └─ Endpoint: PATCH /api/candidates/profiles/{slug}/

Separate entity models
  ├─ Education, Skills, Languages
  └─ Endpoints: POST /api/candidates/{education|skills|languages}/
```

### 2. Duplicate Prevention
All payload builders check existing data:
```typescript
buildCandidateEducationPayloads(userData, existingEducation)
buildCandidateSkillPayloads(userData, existingSkills)
buildCandidateLanguagePayloads(userData, existingLanguages)
```

### 3. Incremental Saves
- Resume upload: PATCH profile (resume_file only)
- Accessibility: PATCH profile (accessibility data only)
- Final submission: PATCH profile + POST education/skills/languages

### 4. Data Normalization
Frontend formats → Backend formats:
- "Full Name" → { first_name, last_name }
- "Fluent" → "advanced"
- "Full time" → "full-time"
- "Yes" → "YES"
- Comma-separated skills → Array of skill objects

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SIGNUP PAGE                                              │
│    POST /api/auth/signup/ (email, password)                 │
│    POST /api/auth/login/ (if needed)                        │
│    PATCH /api/users/profile/ (first_name, last_name)        │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. RESUME UPLOAD (Optional)                                 │
│    PATCH /api/candidates/profiles/{slug}/ (resume_file)     │
│    Backend: Upload to Supabase, trigger parsing             │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ACCESSIBILITY PREFERENCES                                │
│    PATCH /api/candidates/profiles/{slug}/ (accessibility)   │
│    Poll GET /api/candidates/profiles/{slug}/ (resume_data)  │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MANUAL PROFILE ENTRY (10 steps)                          │
│    Data stored in Zustand, NOT sent to backend yet          │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. FINAL SUBMISSION (Review & Agree)                        │
│    1. PATCH /api/users/profile/ (name)                      │
│    2. PATCH /api/candidates/profiles/{slug}/ (preferences)  │
│    3. GET /api/candidates/profiles/{slug}/full/ (existing)  │
│    4. POST /api/candidates/education/ (for each)            │
│    5. POST /api/candidates/skills/ (for each)               │
│    6. POST /api/candidates/languages/ (for each)            │
│    7. markSignupComplete() → Navigate to /dashboard         │
└─────────────────────────────────────────────────────────────┘
```

---

## Important Notes

### 1. Names Live in User Model
```
✅ CORRECT: PATCH /api/users/profile/ { first_name, last_name }
❌ WRONG: Include name in CandidateProfile payload
```

### 2. Resume Parsing is Asynchronous
```
1. Upload file → Backend receives
2. Backend uploads to Supabase
3. Backend triggers parsing (Celery)
4. Frontend polls for resume_data
5. Backend populates resume_data when done
```

### 3. Separate Entities
Education, Skills, Languages are **separate records**, not nested in profile:
```
CandidateProfile (one)
  ├─ Education records (many)
  ├─ Skill records (many)
  └─ Language records (many)
```

### 4. Data Only Sent Once During Signup
- During 10-step wizard: Data stored in Zustand only
- Final submission: All data sent in sequence
- No intermediate saves during form filling

---

**Last Updated:** 2026-01-18
**Status:** ✅ Documented - Complete signup and editing flow
