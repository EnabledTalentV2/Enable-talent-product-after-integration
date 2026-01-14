# Backend API Requirements for Full Frontend Integration

Date: 2026-01-14
Frontend Framework: Next.js 16 with TypeScript
Backend: Django REST Framework at https://etbackend-v2-usy9.onrender.com

---

## 1. Executive Summary

The frontend was built with mock data and then connected to a minimal backend. We now need full contract alignment. This document defines the exact request/response shapes the frontend expects and what the frontend sends to the backend.

### Current Status
- Basic authentication works (login, logout, CSRF)
- Minimal job listing is connected
- Minimal candidate profile endpoints are connected
- Response formats are inconsistent across endpoints
- Required fields are missing or renamed in responses
- Choice fields sometimes return strings instead of integers
- Resume parsing response format does not match frontend needs
- Accessibility needs are collected on the frontend but not stored by the backend

---

## 2. Contract Rules (Non-negotiable)

### 2.1 List Response Envelope
All list endpoints must return a consistent wrapper format:

```json
{
  "results": [ /* array of items */ ],
  "count": 150,
  "next": "url",
  "previous": "url"
}
```

Affected endpoints:
- GET /api/channels/jobs/
- GET /api/candidates/profiles/
- GET /api/skills/

### 2.2 Field Naming Consistency
Use snake_case fields consistently. Do not return multiple names for the same field.

Job fields (single canonical names):
- job_desc
- job_type
- workplace_type
- estimated_salary
- preferred_language
- is_urgent
- created_at
- experience

### 2.3 Choice Fields Must Be Integers
Frontend expects integer values for choice fields.

Job Type (job_type):
1 = Full time
2 = Part time
3 = Contract
4 = Internship

Workplace Type (workplace_type):
1 = Remote
2 = Onsite
3 = Hybrid

Job Status (status):
1 = Active
2 = Closed
3 = Draft

### 2.4 Data Types
- Dates: ISO 8601 with timezone (YYYY-MM-DDTHH:MM:SSZ)
- Booleans: true/false (not strings, not 0/1)
- Numbers: actual numbers (no currency symbols)
- Empty arrays: return [] (not null)

---

## 3. Jobs API

### 3.1 List Jobs
Endpoint: GET /api/channels/jobs/
Auth: Required

Response (wrapper):
```json
{
  "results": [
    {
      "id": 123,
      "title": "Senior Software Engineer",
      "job_desc": "Full job description",
      "job_type": 1,
      "workplace_type": 1,
      "location": "San Francisco, CA",
      "address": "123 Market St",
      "experience": "3-5 years",
      "estimated_salary": 150000,
      "preferred_language": "English",
      "is_urgent": false,
      "status": 1,
      "visa_required": false,
      "organization": { "id": 456, "name": "Acme Corp" },
      "skills": [ { "id": 1, "name": "Python" } ],
      "user": {
        "id": 789,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "is_verified": true,
        "is_candidate": false
      },
      "ranking_status": "completed",
      "ranking_task_id": "task-uuid",
      "candidate_ranking_data": null,
      "created_at": "2026-01-14T10:30:00Z",
      "updated_at": "2026-01-14T11:00:00Z"
    }
  ],
  "count": 25
}
```

### 3.2 Get Job
Endpoint: GET /api/channels/jobs/{id}/
Auth: Required
Response: Single job object (not wrapped)

### 3.3 Create Job
Endpoint: POST /api/channels/jobs/
Auth: Required
Content-Type: application/json

Request:
```json
{
  "title": "Senior Software Engineer",
  "job_desc": "Full job description",
  "workplace_type": 1,
  "location": "San Francisco, CA",
  "job_type": 1,
  "estimated_salary": 150000,
  "visa_required": false,
  "experience": "3-5 years",
  "preferred_language": "English",
  "is_urgent": false
}
```

Response: Single job object

### 3.4 Update Job
Endpoint: PATCH /api/channels/jobs/{id}/
Auth: Required
Content-Type: application/json
Request: Same as Create Job (partial allowed)
Response: Updated job object

### 3.5 Delete Job
Endpoint: DELETE /api/channels/jobs/{id}/
Auth: Required
Response: 204 No Content

### 3.6 Job Stats (Missing)
Endpoint: GET /api/channels/jobs/{id}/stats/
Auth: Required
Required response:
```json
{
  "accepted": 5,
  "declined": 2,
  "requestsSent": 10,
  "matchingCandidates": 25
}
```

### 3.7 Skills Endpoint (Missing)
Endpoint: GET /api/skills/
Auth: Required
Response:
```json
{
  "results": [
    { "id": 1, "name": "Python", "category": "Programming Language" },
    { "id": 2, "name": "Django", "category": "Framework" }
  ],
  "count": 2,
  "next": null,
  "previous": null
}
```

---

## 4. Candidate Signup Flow (Frontend -> Backend)

### 4.1 Signup
Endpoint: POST /api/auth/signup/
Content-Type: application/json

Request:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!"
}
```

Response (example):
```json
{
  "user": {
    "id": 123,
    "email": "john@example.com",
    "is_verified": false,
    "is_candidate": true
  },
  "message": "Account created successfully"
}
```

### 4.2 Session Check (Frontend Uses)
Endpoint: GET /api/user/me
Note: /api/user/me is a frontend proxy to backend GET /api/auth/users/me/.
Auth: Required
Response must include at least:
```json
{
  "email": "john@example.com",
  "is_candidate": true
}
```

### 4.3 Ensure Candidate Profile
Frontend flow:
- GET /api/candidates/profiles/
- If none exists, POST /api/candidates/profiles/ with minimal form-data

POST /api/candidates/profiles/ (form-data):
```
accommodation_needs: PREFER_TO_DISCUSS_LATER
```

### 4.4 Resume Upload + Parsing Sequence
Frontend uploads the file to Supabase and then calls backend:

Step 1: PATCH /api/candidates/profiles/{slug}/ (multipart/form-data)
```
resume_file: https://<supabase-public-url>/<path>
accommodation_needs: PREFER_TO_DISCUSS_LATER
accessibility_data: {"categories":["Visual"],"disclosurePreference":"during_application","accommodations":["Flexible schedule"]}
resume_data: null
parsing_status: not_parsed
```
Notes:
- accessibility_data is a JSON string and optional
- resume_data is cleared to force a re-parse

Step 2: POST /api/candidates/profiles/{slug}/parse-resume/ (empty body)
Response:
```json
{
  "message": "Resume parsing started",
  "parsing_status": "parsing",
  "task_id": "task-uuid"
}
```

Step 3: Poll GET /api/candidates/profiles/{slug}/parsing-status/

### 4.5 Accessibility Needs
Frontend collects:
```json
{
  "accessibility_needs": {
    "categories": ["Visual"],
    "accommodation_need": "yes",
    "disclosure_preference": "during_application",
    "accommodations": ["Flexible schedule"]
  }
}
```

Backend requirements:
- Accept accessibility_data (stringified JSON) on PATCH /api/candidates/profiles/{slug}/
- Also accept accessibility_needs in verify-profile payload (see 4.7)
- Canonical storage field on the candidate profile should be accessibility_needs (JSON field)
- Provide a dedicated endpoint if preferred, but keep the PATCH option working

### 4.6 Manual Profile Completion
Frontend collects a 10-step profile:
- Basic info (name, phone, location, citizenship, gender, ethnicity, URLs)
- Education
- Work experience
- Skills
- Projects
- Achievements
- Certifications
- Preferences
- Other details (languages, availability, salary)
- Review and agree

### 4.7 Verify Profile (What Frontend Sends)
Endpoint: POST /api/candidates/profiles/{slug}/verify-profile/

Current payload (minimal, actual frontend implementation):
```json
{
  "skills": ["Python", "Django"],
  "work_experience": [
    {
      "company": "Google",
      "role": "Software Engineer",
      "start_date": "2019-06",
      "end_date": "2023-12"
    }
  ],
  "linkedin": "https://linkedin.com/in/johndoe"
}
```

Recommended full payload (backend should accept for full integration):
```json
{
  "basic_info": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "citizenship_status": "US Citizen",
    "gender": "Male",
    "ethnicity": "Asian",
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "portfolio_url": "https://johndoe.dev",
    "current_status": "Looking for full-time opportunities",
    "profile_photo": "https://cdn.example.com/photos/john.jpg"
  },
  "education": {
    "course_name": "Bachelor of Science",
    "major": "Computer Science",
    "institution": "Stanford University",
    "graduation_date": "2019-05",
    "grade": "3.8 GPA",
    "start_date": "2015-09",
    "end_date": "2019-05"
  },
  "work_experience": [
    {
      "company": "Google",
      "role": "Software Engineer",
      "start_date": "2019-06",
      "end_date": "2023-12",
      "current": false,
      "description": "Developed scalable backend systems..."
    }
  ],
  "skills": ["Python", "Django", "React"],
  "projects": [
    {
      "project_name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce application",
      "start_date": "2022-01",
      "end_date": "2022-06",
      "current": false
    }
  ],
  "achievements": [
    {
      "title": "Hackathon Winner",
      "issue_date": "2018-05",
      "description": "Won first place at Stanford Hackathon"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issue_date": "2021-08",
      "organization": "Amazon Web Services",
      "credential_id_url": "https://aws.amazon.com/verification/abc123"
    }
  ],
  "preferences": {
    "company_size": ["Startup", "Mid-size"],
    "job_type": ["Full time", "Contract"],
    "job_search_status": ["Actively looking"]
  },
  "languages": [
    {
      "language": "English",
      "speaking": "Native",
      "reading": "Native",
      "writing": "Native"
    }
  ],
  "other_details": {
    "career_stage": "Mid-level (3-7 years)",
    "availability": "Immediate",
    "desired_salary": "$120,000 - $180,000"
  },
  "accessibility_needs": {
    "categories": ["Visual"],
    "accommodation_need": "yes",
    "disclosure_preference": "during_application",
    "accommodations": ["Flexible schedule"]
  },
  "how_discovered": "LinkedIn",
  "comments": "Excited to join!"
}
```

---

## 5. Candidate Profiles API

### 5.1 List Candidate Profiles
Endpoint: GET /api/candidates/profiles/
Auth: Required
Response (wrapper):
```json
{
  "results": [
    {
      "id": 1,
      "slug": "john-doe-profile",
      "user": { "id": 2, "email": "candidate@example.com" },
      "resume_file": "https://supabase-url.com/resume.pdf",
      "resume_data": { "skills": ["Python", "Django"] },
      "parsing_status": "parsed",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 5.2 Get Candidate Profile
Endpoint: GET /api/candidates/profiles/{slug}/
Auth: Required
Response: Single profile object (not wrapped)

Include notes array in detail response:
```json
{
  "notes": [
    {
      "id": "note-123",
      "identifier": "experience-section",
      "note": "Great experience at Google",
      "section": "experience",
      "selected_text": "Software Engineer at Google",
      "context": "2018-2023",
      "note_file": "https://cdn.example.com/notes/note-123.txt",
      "created_at": "2026-01-14T10:30:00Z",
      "updated_at": "2026-01-14T10:30:00Z"
    }
  ]
}
```

### 5.3 Update Candidate Profile
Endpoint: PATCH /api/candidates/profiles/{slug}/
Auth: Required
Content-Type: multipart/form-data

Primary use: resume upload sequence (see 4.4). Backend must accept:
- resume_file (public URL)
- parsing_status
- resume_data (null to reset)
- accommodation_needs
- accessibility_data (stringified JSON)

### 5.4 Parse Resume
Endpoint: POST /api/candidates/profiles/{slug}/parse-resume/
Auth: Required
Content-Type: application/json (empty body)

Response:
```json
{
  "message": "Resume parsing started",
  "parsing_status": "parsing",
  "task_id": "task-uuid"
}
```

### 5.5 Get Resume Parsing Status
Endpoint: GET /api/candidates/profiles/{slug}/parsing-status/
Auth: Required

Response:
```json
{
  "parsing_status": "parsed",  // not_parsed | parsing | parsed | failed
  "task_id": "task-uuid",
  "resume_data": { /* see 5.6 */ },
  "error": null
}
```

### 5.6 Resume Data Structure (Frontend Compatible)
Return resume_data as a flat object (not nested under basic_info or skills). Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "location": "San Francisco, CA",
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "portfolio": "https://johndoe.dev",
  "skills": ["Python", "Django", "React"],
  "work_experience": [
    {
      "company": "Google",
      "role": "Software Engineer",
      "start_date": "2019-06",
      "end_date": "2023-12",
      "current": false,
      "description": "Developed scalable backend systems..."
    }
  ],
  "education": [
    {
      "institution": "Stanford University",
      "course_name": "Bachelor of Science",
      "major": "Computer Science",
      "start_date": "2015-09",
      "end_date": "2019-05",
      "grade": "3.8 GPA"
    }
  ],
  "projects": [
    {
      "project_name": "E-commerce Platform",
      "project_description": "Built a full-stack e-commerce application",
      "start_date": "2022-01",
      "end_date": "2022-06",
      "current": false
    }
  ],
  "achievements": [
    {
      "title": "Hackathon Winner",
      "issue_date": "2018-05",
      "description": "Won first place at Stanford Hackathon"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "organization": "Amazon Web Services",
      "issue_date": "2021-08",
      "credential_url": "https://aws.amazon.com/verification/abc123"
    }
  ],
  "languages": [
    {
      "language": "English",
      "speaking": "Native",
      "reading": "Native",
      "writing": "Native"
    }
  ]
}
```

Notes:
- skills may be a comma-separated string or an array of strings
- avoid nesting under basic_info or skills (frontend does not read those)

Supported variants (preferred -> alternatives):
Canonical keys are required; aliases are temporary for migration and should be deprecated once backend aligns.
- name -> full_name, fullName
- phone -> phone_number, phoneNumber
- linkedin -> linkedin_url, linkedinUrl
- github -> github_url, githubUrl
- portfolio -> portfolio_url, portfolioUrl, website
- work_experience -> workExperience, experience
- company -> company_name, companyName
- role -> position, title
- course_name -> courseName, degree, course
- project_name -> projectName, name, title
- project_description -> projectDescription, description
- issue_date -> issueDate, date
- credential_url -> credentialUrl, url, credential_id
- start_date -> startDate, from
- end_date -> endDate, to

---

## 6. AI Features API

### 6.1 Rank Candidates for Job
Endpoint: POST /api/channels/jobs/{id}/rank-candidates/
Auth: Required
Response:
```json
{
  "message": "Candidate ranking started",
  "ranking_status": "ranking",
  "task_id": "ranking-task-uuid"
}
```

### 6.2 Get Ranking Results
Endpoint: GET /api/channels/jobs/{id}/ranking-data/
Auth: Required
Response:
```json
{
  "ranking_status": "completed",
  "ranked_candidates": [
    {
      "candidate_id": 123,
      "candidate_slug": "john-doe-abc123",
      "application_id": 456,
      "score": 0.92,
      "match_reason": "Strong Python and Django experience."
    }
  ]
}
```

### 6.3 AI Agent Search
Endpoint: POST /api/channels/agent/
Auth: Required
Request:
```json
{ "query": "Find senior Python developers" }
```
Response:
```json
{ "results": { "candidates": [ /* full candidate objects */ ], "reasoning": "..." } }
```

### 6.4 Resume Chat AI
Endpoint: POST /api/candidates/prompt/
Auth: Required
Request:
```json
{ "input_text": "What are this candidate's strongest skills?", "resume_slug": "john-doe-abc123", "thread_id": null }
```

---

## 7. Application Management API

### 7.1 Make Decision on Application
Endpoint: POST /api/channels/jobs/{jobId}/applications/{applicationId}/decision/
Note: frontend proxy route is POST /api/jobs/{jobId}/applications/{applicationId}/decision/ -> backend /api/channels/jobs/{jobId}/applications/{applicationId}/decision/
Auth: Required
Request:
```json
{ "status": "shortlisted" }
```
Response:
```json
{ "id": 456, "status": "shortlisted" }
```

---

## 8. Authentication and Session Management

### 8.1 Login/Logout/CSRF
- POST /api/auth/token/
- POST /api/auth/logout/
- GET /api/auth/csrf/

### 8.2 Session Expiry Detection
Backend must return 401 for expired/missing auth with a helpful error message:
```json
{ "detail": "Authentication credentials were not provided or have expired." }
```

---

## 9. Error Handling

Error format:
```json
{
  "detail": "Human-readable error",
  "code": "error_code",
  "field_errors": { "field": ["error"] }
}
```

Use correct HTTP codes (200, 201, 204, 400, 401, 403, 404, 409, 500).

---

## 10. Priority Action Items

Critical (blocks full integration):
1) Standardize list response format
2) Enforce consistent field names
3) Return integer choice fields
4) Add GET /api/skills/
5) Use resume_data flat schema and parsing_status values
6) Accept resume_file URL on PATCH /api/candidates/profiles/{slug}/

High priority:
7) Implement job stats endpoint
8) Accept full verify-profile payload
9) Store accessibility needs

Medium priority:
10) Improve validation error detail
11) Add pagination (count, next, previous)

---

## 11. Testing Checklist

Signup and profile:
- Signup and session check
- Upload resume -> parsing starts -> status parsed
- Accessibility needs stored
- Verify profile saves full payload

Jobs:
- Create, list, update, delete
- Choice fields remain integers
- Job stats endpoint returns metrics

Candidates:
- List and detail responses use resume_data
- Parsing status uses parsing_status values

AI:
- Ranking returns candidate_slug and score
- Agent search returns candidates

---

## Appendix A: cURL Examples

Create Job:
```bash
curl -X POST https://etbackend-v2-usy9.onrender.com/api/channels/jobs/ \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: <csrf-token>" \
  --cookie "sessionid=<session-id>" \
  -d '{
    "title": "Senior Python Developer",
    "job_desc": "Looking for experienced Python developer",
    "workplace_type": 1,
    "location": "San Francisco, CA",
    "job_type": 1,
    "estimated_salary": 150000,
    "is_urgent": false
  }'
```

Patch resume URL and trigger parsing:
```bash
curl -X PATCH https://etbackend-v2-usy9.onrender.com/api/candidates/profiles/<slug>/ \
  -H "X-CSRFToken: <csrf-token>" \
  --cookie "sessionid=<session-id>" \
  -F "resume_file=https://<supabase-public-url>/<path>" \
  -F "accommodation_needs=PREFER_TO_DISCUSS_LATER" \
  -F "accessibility_data={\"categories\":[\"Visual\"],\"disclosurePreference\":\"during_application\",\"accommodations\":[\"Flexible schedule\"]}" \
  -F "resume_data=null" \
  -F "parsing_status=not_parsed"

curl -X POST https://etbackend-v2-usy9.onrender.com/api/candidates/profiles/<slug>/parse-resume/ \
  -H "X-CSRFToken: <csrf-token>" \
  --cookie "sessionid=<session-id>"
```

---

END OF SPECIFICATION
