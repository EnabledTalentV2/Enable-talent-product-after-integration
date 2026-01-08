# ETBackendV2 API Documentation

Complete list of all API endpoints with sample requests and payloads.

## Base URL
All endpoints are relative to your server base URL (e.g., `http://localhost:8000` or your production domain).

---

## Table of Contents
1. [Authentication & Users](#authentication--users)
2. [Organization](#organization)
3. [Job Posts (Channels)](#job-posts-channels)
4. [Candidates](#candidates)
5. [JWT Token Endpoints](#jwt-token-endpoints)
6. [Password Reset](#password-reset)

---

## Authentication & Users

### 1. Signup
**POST** `/api/auth/signup/`

**Description:** Create a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "confirm_password": "securepassword123",
  "invite_code": "ABC123XYZ",  // Optional
  "newsletter": true  // Optional
}
```

**Sample Response:**
```json
{
  "detail": "Registration successful! Please verify your email."
}
```

---

### 2. Verify Email
**POST** `/api/auth/verify-email/`

**Description:** Verify user email with verification code.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Sample Response:**
```json
{
  "detail": "Email verified"
}
```
**Note:** Returns JWT tokens in HttpOnly cookies.

---

### 3. Resend Verification Email
**POST** `/api/auth/resend-verification/`

**Description:** Resend email verification code.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Sample Response:**
```json
{
  "detail": "Verification email sent"
}
```

---

### 4. Login (Session - Legacy)
**POST** `/api/auth/session/login/`

**Description:** Legacy session-based login.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Sample Response:**
```json
{
  "detail": "Login successful"
}
```
**Note:** Returns JWT tokens in HttpOnly cookies.

---

### 5. Logout (Session - Legacy)
**POST** `/api/auth/session/logout/`

**Description:** Legacy session-based logout.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "detail": "Logged out"
}
```

---

### 6. Login (JWT Cookie - Canonical)
**POST** `/api/auth/token/`

**Description:** Login with JWT tokens stored in HttpOnly cookies.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Sample Response:**
```json
{
  "detail": "Login success"
}
```
**Note:** Access and refresh tokens are set in HttpOnly cookies.

---

### 7. Refresh Token (JWT Cookie)
**POST** `/api/auth/token/refresh/`

**Description:** Refresh JWT access token using refresh token from cookie.

**Authentication:** Not required (uses refresh token from cookie)

**Request Body:** None

**Sample Response:**
```json
{
  "detail": "Token refreshed"
}
```

---

### 8. Logout (JWT Cookie)
**POST** `/api/auth/logout/`

**Description:** Logout and clear JWT cookies.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "detail": "Logged out"
}
```

---

### 9. Get CSRF Token
**GET** `/api/auth/csrf/`

**Description:** Get CSRF token for authenticated requests.

**Authentication:** Not required

**Request Body:** None

**Sample Response:**
```json
{
  "csrftoken": "csrf_token_value_here"
}
```

---

### 10. Change Password
**POST** `/api/auth/change-password/`

**Description:** Change user password.

**Authentication:** Required

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456",
  "confirm_new_password": "newpassword456"
}
```

**Sample Response:**
```json
{
  "message": "Password changed successfully."
}
```

---

### 11. Get Current User
**GET** `/api/auth/users/me/`

**Description:** Get current authenticated user's data.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "is_verified": true,
  "is_candidate": false,
  "profile": {
    "id": 1,
    "user": 1,
    "avatar": "https://supabase-url.com/avatars/avatar.jpg",
    "referral_code": "REF123",
    "total_referrals": 0
  }
}
```

---

### 12. Get User by ID
**GET** `/api/auth/users/{id}/`

**Description:** Get user details by ID.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "is_verified": true,
  "is_candidate": false,
  "profile": {
    "id": 1,
    "user": 1,
    "avatar": "https://supabase-url.com/avatars/avatar.jpg",
    "referral_code": "REF123",
    "total_referrals": 0
  }
}
```

---

### 13. Update User
**PUT/PATCH** `/api/auth/users/{id}/`

**Description:** Update user information.

**Authentication:** Required

**Request Body (multipart/form-data):**
```
first_name: John
last_name: Doe
avatar: [file] (optional image file)
```

**OR (JSON):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "avatar": null
}
```

**Sample Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe Updated",
  "is_active": true,
  "is_verified": true,
  "is_candidate": false,
  "profile": {
    "id": 1,
    "user": 1,
    "avatar": "https://supabase-url.com/avatars/new-avatar.jpg",
    "referral_code": "REF123",
    "total_referrals": 0
  }
}
```

---

### 14. Delete User
**DELETE** `/api/auth/users/{id}/`

**Description:** Delete user account.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```
Status: 200 OK
```

---

### 15. Add Feedback
**POST** `/api/auth/add-feedback/`

**Description:** Submit user feedback.

**Authentication:** Required

**Request Body (multipart/form-data):**
```
urgency: high
subject: Bug Report
message: Found an issue with login
emoji: 🐛
attachment: [file] (optional image file)
```

**OR (JSON):**
```json
{
  "urgency": "high",
  "subject": "Bug Report",
  "message": "Found an issue with login",
  "emoji": "🐛",
  "attachment": null
}
```

**Sample Response:**
```json
{
  "id": 1,
  "urgency": "high",
  "subject": "Bug Report",
  "message": "Found an issue with login",
  "emoji": "🐛",
  "attachment_url": "https://supabase-url.com/feedbacks/attachment.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

## Organization

### 16. List Organizations
**GET** `/api/organization/organizations/`

**Description:** Get all organizations for authenticated user.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
[
  {
    "id": 1,
    "name": "Tech Corp",
    "industry": "Technology",
    "linkedin_url": "https://linkedin.com/company/techcorp",
    "headquarter_location": "San Francisco, CA",
    "about": "Leading tech company",
    "employee_size": "100-500",
    "url": "https://techcorp.com",
    "avatar_url": "https://supabase-url.com/organization-avatars/logo.jpg",
    "root_user": {
      "id": 1,
      "email": "admin@techcorp.com",
      "first_name": "Admin",
      "last_name": "User"
    },
    "users": [
      {
        "id": 1,
        "email": "admin@techcorp.com",
        "first_name": "Admin",
        "last_name": "User"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 17. Get Organization
**GET** `/api/organization/organizations/{id}/`

**Description:** Get organization details by ID.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "id": 1,
  "name": "Tech Corp",
  "industry": "Technology",
  "linkedin_url": "https://linkedin.com/company/techcorp",
  "headquarter_location": "San Francisco, CA",
  "about": "Leading tech company",
  "employee_size": "100-500",
  "url": "https://techcorp.com",
  "avatar_url": "https://supabase-url.com/organization-avatars/logo.jpg",
  "root_user": {
    "id": 1,
    "email": "admin@techcorp.com",
    "first_name": "Admin",
    "last_name": "User"
  },
  "users": [],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 18. Create Organization
**POST** `/api/organization/organizations/`

**Description:** Create a new organization.

**Authentication:** Required

**Request Body (multipart/form-data):**
```
name: Tech Corp
industry: Technology
linkedin_url: https://linkedin.com/company/techcorp
headquarter_location: San Francisco, CA
about: Leading tech company
employee_size: 100-500
url: https://techcorp.com
avatar: [file] (optional image file)
```

**OR (JSON):**
```json
{
  "name": "Tech Corp",
  "industry": "Technology",
  "linkedin_url": "https://linkedin.com/company/techcorp",
  "headquarter_location": "San Francisco, CA",
  "about": "Leading tech company",
  "employee_size": "100-500",
  "url": "https://techcorp.com",
  "avatar": null
}
```

**Sample Response:**
```json
{
  "id": 1,
  "name": "Tech Corp",
  "industry": "Technology",
  "linkedin_url": "https://linkedin.com/company/techcorp",
  "headquarter_location": "San Francisco, CA",
  "about": "Leading tech company",
  "employee_size": "100-500",
  "url": "https://techcorp.com",
  "avatar_url": "https://supabase-url.com/organization-avatars/logo.jpg",
  "root_user": {
    "id": 1,
    "email": "admin@techcorp.com",
    "first_name": "Admin",
    "last_name": "User"
  },
  "users": [],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 19. Update Organization
**PUT/PATCH** `/api/organization/organizations/{id}/`

**Description:** Update organization details.

**Authentication:** Required

**Request Body (multipart/form-data):**
```
name: Tech Corp Updated
industry: Technology
avatar: [file] (optional image file)
```

**OR (JSON):**
```json
{
  "name": "Tech Corp Updated",
  "industry": "Technology"
}
```

**Sample Response:**
```json
{
  "id": 1,
  "name": "Tech Corp Updated",
  "industry": "Technology",
  ...
}
```

---

### 20. Delete Organization
**DELETE** `/api/organization/organizations/{id}/`

**Description:** Delete an organization.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```
Status: 204 No Content
```

---

### 21. Create Organization Invite
**POST** `/api/organization/organizations/{id}/create-invite/`

**Description:** Create and send an organization invite.

**Authentication:** Required

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Sample Response:**
```json
{
  "email": "newuser@example.com",
  "invite_code": "ABC123XYZ",
  "organization": 1
}
```

---

## Job Posts (Channels)

### 22. List Job Posts
**GET** `/api/channels/jobs/`

**Description:** Get all job posts for authenticated user's organization.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
[
  {
    "id": 1,
    "title": "Senior Software Engineer",
    "job_desc": "We are looking for an experienced software engineer...",
    "workplace_type": "remote",
    "location": "San Francisco, CA",
    "job_type": "full-time",
    "estimated_salary": "$120,000 - $150,000",
    "visa_required": false,
    "ranking_status": "ranked",
    "ranking_task_id": "task-uuid",
    "candidate_ranking_data": {...},
    "skills": [
      {"id": 1, "name": "Python"},
      {"id": 2, "name": "Django"}
    ],
    "user": {
      "id": 1,
      "email": "hr@techcorp.com",
      "first_name": "HR",
      "last_name": "Manager"
    },
    "organization": {
      "id": 1,
      "name": "Tech Corp"
    },
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 23. Get Job Post
**GET** `/api/channels/jobs/{id}/`

**Description:** Get job post details by ID.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "job_desc": "We are looking for an experienced software engineer...",
  "workplace_type": "remote",
  "location": "San Francisco, CA",
  "job_type": "full-time",
  "estimated_salary": "$120,000 - $150,000",
  "visa_required": false,
  "ranking_status": "ranked",
  "ranking_task_id": "task-uuid",
  "candidate_ranking_data": {...},
  "skills": [
    {"id": 1, "name": "Python"},
    {"id": 2, "name": "Django"}
  ],
  "user": {...},
  "organization": {...},
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

### 24. Create Job Post
**POST** `/api/channels/jobs/`

**Description:** Create a new job post.

**Authentication:** Required (must be part of an organization)

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "job_desc": "We are looking for an experienced software engineer with expertise in Python and Django.",
  "workplace_type": "remote",
  "location": "San Francisco, CA",
  "job_type": "full-time",
  "estimated_salary": "$120,000 - $150,000",
  "visa_required": false,
  "skills": ["Python", "Django", "PostgreSQL"]
}
```

**Sample Response:**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "job_desc": "We are looking for an experienced software engineer...",
  "workplace_type": "remote",
  "location": "San Francisco, CA",
  "job_type": "full-time",
  "estimated_salary": "$120,000 - $150,000",
  "visa_required": false,
  "ranking_status": "pending",
  "ranking_task_id": null,
  "candidate_ranking_data": null,
  "skills": [
    {"id": 1, "name": "Python"},
    {"id": 2, "name": "Django"},
    {"id": 3, "name": "PostgreSQL"}
  ],
  "user": {...},
  "organization": {...},
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

### 25. Update Job Post
**PUT/PATCH** `/api/channels/jobs/{id}/`

**Description:** Update job post details.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Senior Software Engineer - Updated",
  "estimated_salary": "$130,000 - $160,000",
  "skills": ["Python", "Django", "React"]
}
```

**Sample Response:**
```json
{
  "id": 1,
  "title": "Senior Software Engineer - Updated",
  ...
}
```

---

### 26. Delete Job Post
**DELETE** `/api/channels/jobs/{id}/`

**Description:** Delete a job post.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```
Status: 200 OK
```

---

### 27. Rank Candidates for Job Post
**POST** `/api/channels/jobs/{id}/rank-candidates/`

**Description:** Trigger candidate ranking for a job post.

**Authentication:** Required

**Request Body:** None

**Sample Response (Accepted):**
```json
{
  "message": "Candidate ranking started",
  "ranking_status": "ranking",
  "task_id": "celery-task-uuid"
}
```

**Sample Response (Already Ranked):**
```json
{
  "message": "Candidates already ranked",
  "ranking_status": "ranked",
  "data": {...}
}
```

---

### 28. Get Ranking Data
**GET** `/api/channels/jobs/{id}/ranking-data/`

**Description:** Get candidate ranking results for a job post.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "ranked_candidates": [
    {
      "candidate_id": 1,
      "score": 0.95,
      "match_reason": "Strong Python and Django experience"
    }
  ]
}
```

---

### 29. Agent API - Search Candidates
**POST** `/api/channels/agent/`

**Description:** Search candidates using AI/LLM-based query.

**Authentication:** Not required

**Request Body:**
```json
{
  "query": "Find candidates with 5+ years of Python experience and Django expertise"
}
```

**Sample Response:**
```json
{
  "results": {
    "candidates": [...],
    "reasoning": "Found 10 candidates matching criteria..."
  }
}
```

---

## Candidates

### 30. List Candidate Profiles
**GET** `/api/candidates/profiles/`

**Description:** Get all candidate profiles.
- **Employers:** See all candidates
- **Candidates:** See only their own profile

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
[
  {
    "id": 1,
    "slug": "john-doe-profile",
    "user": {
      "id": 2,
      "email": "candidate@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "organization": null,
    "resume_file": "https://supabase-url.com/candidate-resumes/resume.pdf",
    "resume_data": {
      "name": "John Doe",
      "email": "candidate@example.com",
      "skills": ["Python", "Django"],
      "experience": [...]
    },
    "verified_data": {
      "name": "John Doe",
      "skills": ["Python", "Django"]
    },
    "willing_to_relocate": true,
    "employment_type_preferences": ["full-time"],
    "work_mode_preferences": ["remote"],
    "has_workvisa": true,
    "expected_salary_range": "$100,000 - $120,000",
    "video_pitch": "https://supabase-url.com/candidate-video-pitches/video.mp4",
    "is_available": true,
    "disability_categories": [],
    "accommodation_needs": null,
    "workplace_accommodations": null,
    "get_all_notes": [],
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 31. Get Candidate Profile
**GET** `/api/candidates/profiles/{slug}/`

**Description:** Get candidate profile by slug.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "id": 1,
  "slug": "john-doe-profile",
  "user": {...},
  "organization": null,
  "resume_file": "https://supabase-url.com/candidate-resumes/resume.pdf",
  "resume_data": {...},
  "verified_data": {...},
  "willing_to_relocate": true,
  "employment_type_preferences": ["full-time"],
  "work_mode_preferences": ["remote"],
  "has_workvisa": true,
  "expected_salary_range": "$100,000 - $120,000",
  "video_pitch": "https://supabase-url.com/candidate-video-pitches/video.mp4",
  "is_available": true,
  "disability_categories": [],
  "accommodation_needs": null,
  "workplace_accommodations": null,
  "get_all_notes": [],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

### 32. Create Candidate Profile
**POST** `/api/candidates/profiles/`

**Description:** Create a new candidate profile.

**Authentication:** Required

**Request Body (multipart/form-data):**
```
resume_file: [file] (PDF/DOC file)
willing_to_relocate: true
employment_type_preferences: ["full-time", "part-time"]
work_mode_preferences: ["remote", "hybrid"]
has_workvisa: true
expected_salary_range: $100,000 - $120,000
video_pitch: [file] (optional video file)
is_available: true
disability_categories: []
accommodation_needs: null
workplace_accommodations: null
```

**OR (JSON):**
```json
{
  "willing_to_relocate": true,
  "employment_type_preferences": ["full-time"],
  "work_mode_preferences": ["remote"],
  "has_workvisa": true,
  "expected_salary_range": "$100,000 - $120,000",
  "is_available": true,
  "disability_categories": [],
  "accommodation_needs": null,
  "workplace_accommodations": null
}
```

**Sample Response:**
```json
{
  "id": 1,
  "slug": "john-doe-profile",
  "user": {...},
  "resume_file": "https://supabase-url.com/candidate-resumes/resume.pdf",
  ...
}
```

---

### 33. Update Candidate Profile
**PUT/PATCH** `/api/candidates/profiles/{slug}/`

**Description:** Update candidate profile.

**Authentication:** Required (owner only)

**Request Body (multipart/form-data):**
```
expected_salary_range: $110,000 - $130,000
is_available: false
resume_file: [file] (optional - replaces existing)
video_pitch: [file] (optional - replaces existing)
```

**OR (JSON):**
```json
{
  "expected_salary_range": "$110,000 - $130,000",
  "is_available": false
}
```

**Sample Response:**
```json
{
  "id": 1,
  "slug": "john-doe-profile",
  ...
  "expected_salary_range": "$110,000 - $130,000",
  "is_available": false
}
```

---

### 34. Delete Candidate Profile
**DELETE** `/api/candidates/profiles/{slug}/`

**Description:** Delete candidate profile.

**Authentication:** Required (owner only)

**Request Body:** None

**Sample Response:**
```
Status: 200 OK
```

---

### 35. Parse Resume
**POST** `/api/candidates/profiles/{slug}/parse-resume/`

**Description:** Trigger AI parsing of resume file.

**Authentication:** Required

**Request Body:** None

**Sample Response (Accepted):**
```json
{
  "message": "Resume parsing started",
  "parsing_status": "parsing",
  "task_id": "celery-task-uuid"
}
```

**Sample Response (Already Parsed):**
```json
{
  "message": "Resume already parsed",
  "parsing_status": "parsed",
  "resume_data": {
    "name": "John Doe",
    "email": "candidate@example.com",
    "skills": ["Python", "Django"],
    "experience": [...]
  }
}
```

---

### 36. Get Parsing Status
**GET** `/api/candidates/profiles/{slug}/parsing-status/`

**Description:** Check resume parsing status.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "parsing_status": "parsed",
  "has_resume_data": true,
  "resume_file_exists": true,
  "has_verified_data": true
}
```

---

### 37. Verify Profile
**POST** `/api/candidates/profiles/{slug}/verify-profile/`

**Description:** Submit verified profile data (user-confirmed information).

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "candidate@example.com",
  "linkedin": "https://linkedin.com/in/johndoe",
  "skills": ["Python", "Django", "PostgreSQL"],
  "work_experience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "duration": "2 years"
    }
  ]
}
```

**Sample Response:**
```json
{
  "message": "Profile verified successfully",
  "verified_data": {
    "name": "John Doe",
    "email": "candidate@example.com",
    "linkedin": "https://linkedin.com/in/johndoe",
    "skills": ["Python", "Django", "PostgreSQL"],
    "work_experience": [...]
  }
}
```

---

### 38. Create Note on Candidate Profile
**POST** `/api/candidates/profiles/{slug}/create-notes/`

**Description:** Create a note on a candidate profile.

**Authentication:** Required

**Request Body (multipart/form-data):**
```
identifier: note-001
note: Strong Python skills, 5 years experience
section: skills
selected_text: Python, Django, PostgreSQL
context: Resume section 2
note_file: [file] (optional file attachment)
```

**OR (JSON):**
```json
{
  "identifier": "note-001",
  "note": "Strong Python skills, 5 years experience",
  "section": "skills",
  "selected_text": "Python, Django, PostgreSQL",
  "context": "Resume section 2",
  "note_file": null
}
```

**Sample Response:**
```json
{
  "id": 1,
  "identifier": "note-001",
  "note": "Strong Python skills, 5 years experience",
  "section": "skills",
  "selected_text": "Python, Django, PostgreSQL",
  "context": "Resume section 2",
  "note_file": "https://supabase-url.com/candidate-notes/file.pdf",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 39. List Notes
**GET** `/api/candidates/notes/`

**Description:** Get all notes for current user's candidate profiles.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
[
  {
    "id": 1,
    "identifier": "note-001",
    "note": "Strong Python skills",
    "section": "skills",
    "selected_text": "Python, Django",
    "context": "Resume section 2",
    "note_file": "https://supabase-url.com/candidate-notes/file.pdf",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 40. Get Note
**GET** `/api/candidates/notes/{id}/`

**Description:** Get note details by ID.

**Authentication:** Required

**Request Body:** None

**Sample Response:**
```json
{
  "id": 1,
  "identifier": "note-001",
  "note": "Strong Python skills",
  "section": "skills",
  "selected_text": "Python, Django",
  "context": "Resume section 2",
  "note_file": "https://supabase-url.com/candidate-notes/file.pdf",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 41. Update Note
**PUT/PATCH** `/api/candidates/notes/{id}/`

**Description:** Update a note.

**Authentication:** Required (owner only)

**Request Body (multipart/form-data):**
```
note: Updated note text
section: experience
note_file: [file] (optional - replaces existing)
```

**OR (JSON):**
```json
{
  "note": "Updated note text",
  "section": "experience"
}
```

**Sample Response:**
```json
{
  "id": 1,
  "identifier": "note-001",
  "note": "Updated note text",
  "section": "experience",
  ...
}
```

---

### 42. Delete Note
**DELETE** `/api/candidates/notes/{id}/`

**Description:** Delete a note.

**Authentication:** Required (owner only)

**Request Body:** None

**Sample Response:**
```json
{
  "detail": "Note deleted"
}
```

---

### 43. Prompt API - Resume Chat
**POST** `/api/candidates/prompt/`

**Description:** Chat with AI about candidate resume.

**Authentication:** Not required

**Request Body:**
```json
{
  "input_text": "What are this candidate's key skills?",
  "resume_slug": "john-doe-profile",
  "thread_id": "thread-uuid-123"  // Optional - for continuing conversation
}
```

**Sample Response:**
```json
{
  "output": "The candidate's key skills include Python, Django, PostgreSQL, and React...",
  "thread_id": "thread-uuid-123"
}
```

---

### 44. Career Coach API
**POST** `/api/candidates/career-coach/`

**Description:** Get AI career coaching advice based on resume.

**Authentication:** Not required

**Request Body:**
```json
{
  "input_text": "What career path would you recommend for me?",
  "resume_slug": "john-doe-profile",
  "thread_id": "thread-uuid-456"  // Optional - for continuing conversation
}
```

**Sample Response:**
```json
{
  "output": "Based on your experience with Python and Django, I recommend focusing on...",
  "thread_id": "thread-uuid-456"
}
```

---

## JWT Token Endpoints

### 45. Get JWT Token (Email-based)
**POST** `/api/token/`

**Description:** Get JWT access and refresh tokens using email/password.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Sample Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 46. Refresh JWT Token
**POST** `/api/token/refresh/`

**Description:** Refresh JWT access token using refresh token.

**Authentication:** Not required

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Sample Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Password Reset

### 47. Request Password Reset
**POST** `/api/auth/password_reset/`

**Description:** Request password reset email.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Sample Response:**
```json
{
  "status": "OK"
}
```

---

### 48. Confirm Password Reset
**POST** `/api/auth/password_reset/confirm/`

**Description:** Confirm password reset with token.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

**Sample Response:**
```json
{
  "status": "OK"
}
```

---

## Authentication Notes

- **HttpOnly Cookie Authentication:** The canonical login method (`/api/auth/token/`) stores JWT tokens in HttpOnly cookies. These are automatically sent with requests.
- **Bearer Token Authentication:** Alternative endpoints (`/api/token/`) return tokens in response body for use with `Authorization: Bearer <token>` header.
- **CSRF Protection:** For cookie-based auth, include CSRF token in `X-CSRFToken` header for POST/PUT/DELETE requests. Get token from `/api/auth/csrf/`.

## Error Responses

All endpoints may return standard HTTP error codes:

- **400 Bad Request:** Invalid request data
- **401 Unauthorized:** Authentication required or invalid credentials
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

Example error response:
```json
{
  "detail": "Error message here"
}
```

---

## File Upload Notes

Many endpoints support file uploads via `multipart/form-data`:
- User avatars
- Organization avatars
- Resume files
- Video pitches
- Note attachments
- Feedback attachments

Files are automatically uploaded to Supabase storage and URLs are returned in responses.

---

**Last Updated:** January 2024
