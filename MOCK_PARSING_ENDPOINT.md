# Mock Parsing Status Endpoint - Testing Guide

## Overview

A mock endpoint has been created at `app/api/candidates/profiles/[slug]/parsing-status/route.ts` to simulate the resume parsing flow for testing purposes.

Since the backend `/parsing-status/` endpoint doesn't exist, this mock allows you to test the frontend polling logic without waiting for backend implementation.

---

## How It Works

### Simulation Logic

The mock endpoint simulates async resume parsing by tracking call counts per candidate slug:

1. **First 3 calls**: Returns `parsing_status: "parsing"` with `resume_data: null`
2. **4th call onwards**: Returns `parsing_status: "parsed"` with mock resume data

### In-Memory State

- Uses a `Map<slug, { callCount, timestamp }>` to track parsing simulation
- State persists until server restart or manual reset
- Each candidate slug has independent tracking

---

## API Endpoints

### GET `/api/candidates/profiles/[slug]/parsing-status/`

Simulates checking the parsing status.

**Example Response (First 3 calls):**
```json
{
  "slug": "john-doe-12345",
  "parsing_status": "parsing",
  "resume_data": null,
  "has_resume_data": false,
  "resume_file_exists": true,
  "has_verified_data": false,
  "message": "Parsing in progress... (Call 1/3)",
  "_mock": true,
  "_call_count": 1
}
```

**Example Response (4th call+):**
```json
{
  "slug": "john-doe-12345",
  "parsing_status": "parsed",
  "resume_data": {
    "personal_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "location": "Toronto, ON",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "portfolio_url": "https://johndoe.dev"
    },
    "education": [...],
    "work_experience": [...],
    "skills": {...},
    "projects": [...],
    "certifications": [...],
    "languages": [...]
  },
  "has_resume_data": true,
  "resume_file_exists": true,
  "has_verified_data": true,
  "message": "Resume parsing completed successfully",
  "_mock": true,
  "_call_count": 4
}
```

### DELETE `/api/candidates/profiles/[slug]/parsing-status/`

Reset the simulation counter for a specific candidate slug.

**Usage:**
```bash
curl -X DELETE http://localhost:3000/api/candidates/profiles/john-doe-12345/parsing-status/
```

**Response:**
```json
{
  "message": "Parsing simulation reset for john-doe-12345",
  "slug": "john-doe-12345",
  "_mock": true
}
```

### POST `/api/candidates/profiles/[slug]/parsing-status/`

Reset all simulation counters (for all slugs).

**Usage:**
```bash
curl -X POST http://localhost:3000/api/candidates/profiles/any-slug/parsing-status/ \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_all"}'
```

**Response:**
```json
{
  "message": "All parsing simulations reset (3 entries cleared)",
  "_mock": true
}
```

---

## Testing the Parsing Flow

### Option 1: Test with Frontend Polling

Update `app/(sign-up)/signup/accessability-needs/page.tsx` to use the mock endpoint:

```typescript
// TEMPORARY - For testing only!
const pollForParsedData = async (slug: string) => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      // Use the mock parsing-status endpoint instead of main profile
      const response = await apiRequest(
        `/api/candidates/profiles/${slug}/parsing-status/`,
        { method: "GET" }
      );

      console.log(`[Poll ${attempt + 1}/40]`, response);

      if (response.parsing_status === "parsed" && response.resume_data) {
        // Transform the resume_data to UserData format
        const patch = transformBackendResumeData(response.resume_data);
        return patch;
      }

      await sleep(1500); // Wait 1.5s between polls
    } catch (error) {
      console.error(`[Poll ${attempt + 1}] Error:`, error);
    }
  }
  return null; // Timeout after 60s
};
```

**Testing Steps:**
1. Start dev server: `npm run dev`
2. Go through signup flow and upload a resume
3. On accessibility page, it will poll the mock endpoint
4. Watch console logs - you'll see:
   - Calls 1-3: `"Parsing in progress..."`
   - Call 4: `"Resume parsing completed successfully"`
5. Forms should pre-fill with mock data after ~6 seconds (4 polls × 1.5s)

### Option 2: Test Directly via Browser/cURL

**Browser DevTools:**
```javascript
// Open console on any page after logging in
const slug = "your-candidate-slug"; // Replace with actual slug

// Call 1-3: Returns "parsing"
fetch(`/api/candidates/profiles/${slug}/parsing-status/`)
  .then(r => r.json())
  .then(console.log);

// Call 4+: Returns "parsed" with data
fetch(`/api/candidates/profiles/${slug}/parsing-status/`)
  .then(r => r.json())
  .then(console.log);

// Reset counter to test again
fetch(`/api/candidates/profiles/${slug}/parsing-status/`, {
  method: 'DELETE'
}).then(r => r.json()).then(console.log);
```

**cURL:**
```bash
# Get parsing status (repeat 4 times to see full cycle)
curl http://localhost:3000/api/candidates/profiles/test-slug-123/parsing-status/

# Reset counter
curl -X DELETE http://localhost:3000/api/candidates/profiles/test-slug-123/parsing-status/

# Reset all
curl -X POST http://localhost:3000/api/candidates/profiles/any-slug/parsing-status/ \
  -H "Content-Type: application/json" \
  -d '{"action": "reset_all"}'
```

---

## Mock Resume Data

The endpoint returns structured data matching the `BACKEND_RESUME_DATA_SPEC.md` format:

```json
{
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "location": "Toronto, ON",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "portfolio_url": "https://johndoe.dev"
  },
  "education": [
    {
      "institution": "University of Toronto",
      "degree": "Bachelor of Science",
      "field_of_study": "Computer Science",
      "start_date": "2018-09",
      "end_date": "2022-05",
      "grade": "3.8 GPA",
      "description": "Dean's List, Computer Science Honors"
    }
  ],
  "work_experience": [
    {
      "company": "Tech Solutions Inc",
      "position": "Software Engineer",
      "start_date": "2022-06",
      "end_date": null,
      "is_current": true,
      "description": "Developed full-stack web applications..."
    },
    {
      "company": "StartupXYZ",
      "position": "Junior Developer",
      "start_date": "2021-01",
      "end_date": "2022-05",
      "is_current": false,
      "description": "Built RESTful APIs..."
    }
  ],
  "skills": {
    "technical": ["JavaScript", "TypeScript", "React", "Node.js", "Python", ...],
    "soft_skills": ["Communication", "Leadership", "Problem Solving", ...]
  },
  "projects": [...],
  "certifications": [...],
  "languages": [...]
}
```

This data will be transformed by `resumeData.transformer.ts` to match the frontend's `UserData` structure.

---

## Verification

### Check Console Logs

When testing, you should see:

```
[Mock Parsing Status] Slug: john-doe-12345, Call: 1
[Mock Parsing Status] Slug: john-doe-12345, Call: 2
[Mock Parsing Status] Slug: john-doe-12345, Call: 3
[Mock Parsing Status] Slug: john-doe-12345, Call: 4
```

### Verify Data Transformation

After the 4th call, the frontend should:
1. Receive the mock `resume_data`
2. Transform it via `transformBackendResumeData()`
3. Update Zustand state with parsed data
4. Pre-fill forms in manual-resume-fill wizard

---

## Important Notes

### For Testing Only

This is a **mock endpoint for frontend testing**. It does NOT:
- Actually parse PDF files
- Store data in the database
- Call any backend services
- Persist across server restarts

### Production Behavior

In production, the frontend should:
1. Upload file to backend (multipart/form-data)
2. Backend handles Supabase upload and parsing
3. Frontend polls `GET /api/candidates/profiles/{slug}/` (main endpoint, NOT `/parsing-status/`)
4. Check for `resume_data` field in response

### State Management

- Counter resets on server restart (dev mode)
- Each slug has independent counter
- Use DELETE endpoint to reset between tests
- Use POST with `reset_all` to clear all counters

---

## Switching Back to Production

When backend implements real parsing, revert the frontend to poll the main endpoint:

```typescript
// PRODUCTION - Poll main profile endpoint
const pollForParsedData = async (slug: string) => {
  for (let attempt = 0; attempt < 40; attempt++) {
    const profileData = await apiRequest(
      `/api/candidates/profiles/${slug}/`,  // Main endpoint
      { method: "GET" }
    );

    const patch = extractUserDataPatch(profileData);
    if (Object.keys(patch).length > 0) {
      return patch;
    }

    await sleep(1500);
  }
  return null;
};
```

---

## Troubleshooting

### Mock endpoint not responding
- Check server is running: `npm run dev`
- Verify URL: `http://localhost:3000/api/candidates/profiles/[slug]/parsing-status/`
- Check console for errors

### Counter not resetting between tests
- Use DELETE endpoint to reset specific slug
- Use POST with `reset_all` to clear all counters
- Restart dev server (will clear all in-memory state)

### Forms not pre-filling
- Check console logs - is `resume_data` being received?
- Verify transformer is running: `transformBackendResumeData()`
- Check Zustand state is being updated
- Ensure manual-resume-fill page is reading from state

---

**Last Updated:** January 2026
**Status:** ✅ Mock endpoint ready for testing
**Related Files:**
- [app/api/candidates/profiles/[slug]/parsing-status/route.ts](app/api/candidates/profiles/[slug]/parsing-status/route.ts)
- [RESUME_UPLOAD_FIX.md](RESUME_UPLOAD_FIX.md)
- [BACKEND_RESUME_DATA_SPEC.md](BACKEND_RESUME_DATA_SPEC.md)
