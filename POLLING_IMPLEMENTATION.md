# Asynchronous Polling Implementation

## Overview

The asynchronous polling stage has been implemented in the accessibility needs page to poll for resume parsing completion and retrieve parsed data.

**Location:** [app/(sign-up)/signup/accessability-needs/page.tsx](app/(sign-up)/signup/accessability-needs/page.tsx)

---

## Polling Configuration

### Constants (Lines 106-109)

```typescript
const PARSING_POLL_DELAY_MS = 1500; // 1.5 seconds between attempts
const PARSING_MAX_ATTEMPTS = 20; // Max 20 attempts (30 seconds total)
```

**Polling Parameters:**
- **Endpoint:** `GET /api/candidates/profiles/{slug}/parsing-status/?include_resume=true`
- **Max Attempts:** 20
- **Delay:** 1.5 seconds between attempts
- **Total Timeout:** 30 seconds (20 × 1.5s)
- **Status Checks:** `parsed`, `failed`, `error`, `parsing`

---

## Polling Function Implementation

### `pollForParsedData()` - Lines 239-323

```typescript
const pollForParsedData = async (
  slug: string
): Promise<UserDataPatch | null> => {
  // Polls the parsing-status endpoint up to 20 times
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await apiRequest(
      `/api/candidates/profiles/${slug}/parsing-status/?include_resume=true`,
      { method: "GET" }
    );

    const status = response.parsing_status;

    // Handle different statuses
    if (status === "parsed") {
      // Extract and return resume data
      return extractUserDataPatch(response);
    }

    if (status === "failed" || status === "error") {
      // Throw error to trigger fallback to manual entry
      throw new Error(response.error || "Parsing failed");
    }

    if (status === "parsing") {
      // Continue polling
      await sleep(1500);
    }
  }

  // Timeout - return null
  return null;
};
```

### Status Handling

| Status | Action | Result |
|--------|--------|--------|
| `parsed` | Extract resume data via `extractUserDataPatch()` | Returns `UserDataPatch`, forms pre-fill |
| `parsing` | Continue polling | Waits 1.5s, tries again |
| `failed` | Throw error | Falls back to manual entry |
| `error` | Throw error | Falls back to manual entry |
| Timeout (no status after 20 attempts) | Return null | Falls back to manual entry |

---

## Data Transformation Pipeline

### Stage 1: Extract Data (Lines 119-208)

**Function:** `extractUserDataPatch(response)`

Extracts resume data from various response structures:

```typescript
const extractUserDataPatch = (payload: unknown): UserDataPatch => {
  // 1. Find resume_data in response
  const resumeData =
    payload.resume_data ||
    payload.resume ||
    payload.parsed_data ||
    payload.parsedData;

  // 2. Transform backend format to frontend format
  if (resumeData) {
    const transformedData = transformBackendResumeData(resumeData);
    return transformedData;
  }

  return {};
};
```

**Supported Response Formats:**
- `response.resume_data` (preferred)
- `response.resume`
- `response.parsed_data`
- `response.parsedData`
- `response.data`
- `response.userData`

### Stage 2: Transform Data

**Function:** `transformBackendResumeData()` from [lib/transformers/resumeData.transformer.ts](lib/transformers/resumeData.transformer.ts)

Transforms backend resume data to frontend `UserData` structure:

```typescript
transformBackendResumeData(resumeData) → UserDataPatch
```

**Transformations:**

| Backend Field | Transformer Function | Frontend Field |
|---------------|---------------------|----------------|
| `personal_info`, `name`, `email` | `transformBasicInfo()` | `basicInfo` |
| `education[]` | `transformEducation()` | `education` |
| `work_experience[]` | `transformWorkExperience()` | `workExperience` |
| `skills`, `technical_skills` | `transformSkills()` | `skills` |
| `projects[]` | `transformProjects()` | `projects` |
| `certifications[]` | `transformCertifications()` | `certification` |
| `achievements[]` | `transformAchievements()` | `achievements` |
| `languages[]` | `transformLanguages()` | `otherDetails` |

**Key Transformations:**
- Name splitting: `"John Doe"` → `{ firstName: "John", lastName: "Doe" }`
- Date normalization: `"January 2023"` → `"2023-01-01"`
- Skills parsing: `"Python, Java"` → `["Python", "Java"]`
- Current position detection: `"Present"` → `true`

### Stage 3: Merge Data (Lines 210-237)

**Function:** `mergeUserData(prev, patch)`

Merges parsed data into existing user state:

```typescript
const mergeUserData = (prev: UserData, patch: UserDataPatch): UserData => ({
  ...prev,
  basicInfo: patch.basicInfo ? { ...prev.basicInfo, ...patch.basicInfo } : prev.basicInfo,
  education: patch.education ? { ...prev.education, ...patch.education } : prev.education,
  workExperience: patch.workExperience ? { ...prev.workExperience, ...patch.workExperience } : prev.workExperience,
  // ... etc
});
```

**Merge Strategy:**
- Patch data **overrides** existing data
- Missing fields in patch **preserve** existing data
- Deep merge for nested objects

---

## Usage in Component (Lines 488-518)

```typescript
// After saving accessibility preferences
if (resumeUploaded) {
  setIsParsingResume(true);

  // Poll the parsing-status endpoint
  const parsedPatch = await pollForParsedData(slug);

  if (parsedPatch && Object.keys(parsedPatch).length > 0) {
    // Merge parsed data into state
    setUserData((prev) => mergeUserData(prev, parsedPatch));

    // Navigate to manual entry with pre-filled forms
    router.push("/signup/manual-resume-fill");
  } else {
    // Timeout - proceed to manual entry (empty forms)
    router.push("/signup/manual-resume-fill");
  }
} catch (err) {
  // Error - proceed to manual entry (empty forms)
  router.push("/signup/manual-resume-fill");
}
```

---

## Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ User completes accessibility form               │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ Save accessibility preferences to backend       │
│ PATCH /api/candidates/profiles/{slug}/          │
└────────────┬────────────────────────────────────┘
             │
             ▼
        ┌────────┐
        │ Resume │
        │uploaded?│
        └────┬───┘
             │
        NO ──┼── YES
             │         │
             │         ▼
             │   ┌─────────────────────────────────┐
             │   │ Start polling parsing-status    │
             │   │ GET .../parsing-status/         │
             │   │ ?include_resume=true            │
             │   └────────┬────────────────────────┘
             │            │
             │            ▼
             │      ┌─────────────┐
             │      │ Check status │
             │      └──────┬───────┘
             │             │
             │        ┌────┼────┬────────┐
             │        │    │    │        │
             │     parsed  │  error  timeout
             │        │    │    │        │
             │        ▼    ▼    ▼        ▼
             │      ┌──────────────────────┐
             │      │ Extract & Transform  │
             │      │ transformBackendData │
             │      └──────────┬───────────┘
             │                 │
             │                 ▼
             │      ┌──────────────────────┐
             │      │ Merge into UserData  │
             │      │ mergeUserData()      │
             │      └──────────┬───────────┘
             │                 │
             └─────────────────┼──────────┐
                               │          │
                               ▼          ▼
                    ┌─────────────────────────────┐
                    │ Navigate to manual entry    │
                    │ - Pre-filled if data exists │
                    │ - Empty if timeout/error    │
                    └─────────────────────────────┘
```

---

## Testing the Implementation

### Option 1: Use Mock Endpoint

The mock endpoint at [app/api/candidates/profiles/[slug]/parsing-status/route.ts](app/api/candidates/profiles/[slug]/parsing-status/route.ts) is already set up and will work immediately.

**Test Flow:**
1. Start dev server: `npm run dev`
2. Sign up as a new candidate
3. Upload a resume
4. Complete accessibility form
5. Watch console logs:
   - Attempts 1-3: `"Still parsing..."`
   - Attempt 4: `"Resume parsing completed!"`
6. Forms should pre-fill after ~6 seconds (4 polls × 1.5s)

**Expected Console Output:**
```
[Accessibility Needs] Resume was uploaded, polling parsing-status endpoint
[Accessibility Needs] Starting to poll parsing-status endpoint (max 20 attempts, 30s timeout)
[Accessibility Needs] Parsing status (attempt 1/20): { parsing_status: "parsing", ... }
[Accessibility Needs] Still parsing... (attempt 1/20)
[Accessibility Needs] Parsing status (attempt 2/20): { parsing_status: "parsing", ... }
[Accessibility Needs] Still parsing... (attempt 2/20)
[Accessibility Needs] Parsing status (attempt 3/20): { parsing_status: "parsing", ... }
[Accessibility Needs] Still parsing... (attempt 3/20)
[Accessibility Needs] Parsing status (attempt 4/20): { parsing_status: "parsed", resume_data: {...} }
[Accessibility Needs] Resume parsing completed!
[Accessibility Needs] Extracted resume data: { basicInfo: {...}, education: {...}, ... }
[Accessibility Needs] Resume data found, merging into user data
```

### Option 2: Test with Real Backend

When the backend implements the `/parsing-status/` endpoint, the frontend will work immediately without any changes.

**Backend Response Format Expected:**

```json
{
  "slug": "john-doe-12345",
  "parsing_status": "parsed",
  "resume_data": {
    "personal_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      ...
    },
    "education": [...],
    "work_experience": [...],
    "skills": {...},
    ...
  },
  "has_resume_data": true,
  "resume_file_exists": true
}
```

### Option 3: Direct Testing via Browser Console

```javascript
// Get your candidate slug from localStorage or URL
const slug = "your-slug-here";

// Call the endpoint directly
fetch(`/api/candidates/profiles/${slug}/parsing-status/?include_resume=true`)
  .then(r => r.json())
  .then(data => {
    console.log("Status:", data.parsing_status);
    console.log("Resume Data:", data.resume_data);
  });
```

---

## Error Handling

### Parsing Failures

If parsing fails (`status: "failed"` or `status: "error"`), the error is caught and user proceeds to manual entry:

```typescript
if (status === "failed" || status === "error") {
  throw new Error(response.error || "Parsing failed");
}

// In component:
catch (err) {
  console.error("Error polling:", err);
  router.push("/signup/manual-resume-fill"); // Fallback to manual entry
}
```

### Timeout

If 20 attempts complete without getting `status: "parsed"`, returns `null` and user proceeds to manual entry:

```typescript
if (parsedPatch === null) {
  console.log("Polling timed out");
  router.push("/signup/manual-resume-fill");
}
```

### Network Errors

Network errors during polling are caught and logged, but polling continues:

```typescript
catch (err) {
  console.warn("Poll error:", err);
  // Continue to next attempt
}
```

---

## Key Features

### 1. Graceful Degradation
- If parsing fails → manual entry
- If timeout → manual entry
- If network error → manual entry
- User never gets stuck

### 2. Progress Indication
- `isParsingResume` state shows loading UI
- Console logs show attempt numbers
- User knows something is happening

### 3. Flexible Data Format
- Handles multiple backend response formats
- Supports various naming conventions (snake_case, camelCase)
- Transforms data to consistent frontend format

### 4. Comprehensive Transformation
- Splits names: `"John Doe"` → separate fields
- Normalizes dates: `"January 2023"` → ISO format
- Parses skills: String or array → normalized array
- Detects current positions: "Present" → boolean flag

---

## Performance

**Best Case:** 4 polls × 1.5s = **6 seconds** (using mock, parsing completes on 4th attempt)

**Worst Case:** 20 polls × 1.5s = **30 seconds** (timeout)

**Average Case (Expected):** Backend parses in 5-10 seconds, so **~10 polls ≈ 15 seconds**

---

## Related Files

- **Polling Logic:** [app/(sign-up)/signup/accessability-needs/page.tsx:239-323](app/(sign-up)/signup/accessability-needs/page.tsx#L239-L323)
- **Data Extraction:** [app/(sign-up)/signup/accessability-needs/page.tsx:119-208](app/(sign-up)/signup/accessability-needs/page.tsx#L119-L208)
- **Data Transformation:** [lib/transformers/resumeData.transformer.ts](lib/transformers/resumeData.transformer.ts)
- **Mock Endpoint:** [app/api/candidates/profiles/[slug]/parsing-status/route.ts](app/api/candidates/profiles/[slug]/parsing-status/route.ts)
- **Mock Documentation:** [MOCK_PARSING_ENDPOINT.md](MOCK_PARSING_ENDPOINT.md)
- **Backend Spec:** [BACKEND_RESUME_DATA_SPEC.md](BACKEND_RESUME_DATA_SPEC.md)

---

**Last Updated:** January 2026
**Status:** ✅ **Fully Implemented** - Ready for testing with mock endpoint or real backend
