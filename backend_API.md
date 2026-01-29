# Enabled Talent API Documentation

## Overview

The Enabled Talent API is a RESTful backend service that provides comprehensive endpoints for managing talent acquisition, candidate profiles, job postings, and organizational workflows.

**Base URL:** `https://etbackend-v2-usy9.onrender.com/api`

**API Version:** v1

**Contact:** support@enabledtalent.com

**License:** MIT

## Authentication

The API uses Bearer token authentication. Include the authorization header in your requests:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

All authentication endpoints are under `/auth/` and `/users/` prefixes.

## Table of Contents

- [Authentication & User Management](#authentication--user-management)
- [Candidate Management](#candidate-management)
- [Job Posts & Applications](#job-posts--applications)
- [Organization Management](#organization-management)
- [Data Models](#data-models)

---

## Authentication & User Management

### User Registration & Login

#### Sign Up
```
POST /auth/signup/
POST /users/signup/
```
Create a new user account.

#### Login (Token Authentication)
```
POST /auth/token/
POST /users/token/
```
Authenticates user and issues access + refresh tokens stored in HttpOnly cookies.

#### Session Login
```
POST /auth/session/login/
POST /users/session/login/
```

#### Token Refresh
```
POST /auth/token/refresh/
POST /users/token/refresh/
```
Reads refresh token from HttpOnly cookie, rotates refresh token correctly, and blacklists old refresh token if enabled.

**Request Body:**
```json
{
  "refresh": "string"
}
```

**Response:**
```json
{
  "access": "string"
}
```

#### Logout
```
POST /auth/logout/
POST /users/logout/
```
Clears authentication cookies.

### Email Verification

#### Verify Email
```
POST /auth/verify-email/
POST /users/verify-email/
```

#### Resend Verification
```
POST /auth/resend-verification/
POST /users/resend-verification/
```

### Password Management

#### Change Password
```
POST /auth/change-password/
POST /users/change-password/
```

#### Request Password Reset
```
POST /auth/password_reset/
```
Sends a password reset token to the provided email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Confirm Password Reset
```
POST /auth/password_reset/confirm/
```

**Request Body:**
```json
{
  "password": "new_password",
  "token": "reset_token"
}
```

#### Validate Reset Token
```
POST /auth/password_reset/validate_token/
```

**Request Body:**
```json
{
  "token": "reset_token"
}
```

### User Profile

#### Get Current User
```
GET /auth/users/me/
GET /users/users/me/
```
Returns the currently authenticated user's data.

#### Update Profile
```
PATCH /auth/profile/
PATCH /users/profile/
```

#### List Users
```
GET /auth/users/
GET /users/users/
```

#### Get User by ID
```
GET /auth/users/{id}/
GET /users/users/{id}/
```

#### Update User
```
PUT /auth/users/{id}/
PATCH /auth/users/{id}/
PUT /users/users/{id}/
PATCH /users/users/{id}/
```

#### Delete User
```
DELETE /auth/users/{id}/
DELETE /users/users/{id}/
```

### Feedback

#### Submit Feedback
```
POST /auth/add-feedback/
POST /users/add-feedback/
```

### CSRF Protection

#### Get CSRF Token
```
GET /auth/csrf/
GET /users/csrf/
```
CSRF bootstrap endpoint. Call once on frontend app load.

---

## Candidate Management

### Candidate Profiles

#### List Candidate Profiles
```
GET /candidates/profiles/
```

#### Create Candidate Profile
```
POST /candidates/profiles/
```

**Request Body:**
```json
{
  "user": {},
  "organization": {},
  "willing_to_relocate": false,
  "employment_type_preferences": {},
  "work_mode_preferences": {},
  "has_workvisa": false,
  "expected_salary_range": "string",
  "is_available": true,
  "disability_categories": {},
  "accommodation_needs": "YES|NO|PREFER_TO_DISCUSS_LATER",
  "workplace_accommodations": {},
  "get_all_notes": []
}
```

#### Get Candidate Profile
```
GET /candidates/profiles/{slug}/
```

#### Update Candidate Profile
```
PUT /candidates/profiles/{slug}/
PATCH /candidates/profiles/{slug}/
```

#### Delete Candidate Profile
```
DELETE /candidates/profiles/{slug}/
```

#### Get Full Profile (Read-Only)
```
GET /candidates/profiles/{slug}/full/
```
Returns aggregated candidate profile. Frontend MUST NOT PATCH this endpoint.

### Resume Management

#### Parse Resume
```
POST /candidates/profiles/{slug}/parse-resume/
```
Upload and parse a candidate's resume.

#### Get Parsing Status
```
GET /candidates/profiles/{slug}/parsing-status/
```
Lightweight polling endpoint for frontend to check resume parsing progress.

### Profile Verification

#### Verify Profile
```
POST /candidates/profiles/{slug}/verify-profile/
```

### Education

#### List Education Records
```
GET /candidates/education/
```

#### Create Education Record
```
POST /candidates/education/
```

**Request Body:**
```json
{
  "course_name": "string",
  "major": "string",
  "institution": "string",
  "start_year": 2020,
  "end_year": 2024
}
```

#### Get Education Record
```
GET /candidates/education/{id}/
```

#### Update Education Record
```
PUT /candidates/education/{id}/
PATCH /candidates/education/{id}/
```

#### Delete Education Record
```
DELETE /candidates/education/{id}/
```

### Skills

#### List Skills
```
GET /candidates/skills/
```

#### Create Skill
```
POST /candidates/skills/
```

**Request Body:**
```json
{
  "name": "string"
}
```

#### Get Skill
```
GET /candidates/skills/{id}/
```

#### Update Skill
```
PUT /candidates/skills/{id}/
PATCH /candidates/skills/{id}/
```

#### Delete Skill
```
DELETE /candidates/skills/{id}/
```

### Languages

#### List Languages
```
GET /candidates/languages/
```

#### Create Language
```
POST /candidates/languages/
```

**Request Body:**
```json
{
  "language": "string",
  "speaking": "basic|intermediate|advanced|native",
  "reading": "basic|intermediate|advanced|native",
  "writing": "basic|intermediate|advanced|native"
}
```

#### Get Language
```
GET /candidates/languages/{id}/
```

#### Update Language
```
PUT /candidates/languages/{id}/
PATCH /candidates/languages/{id}/
```

#### Delete Language
```
DELETE /candidates/languages/{id}/
```

### Notes

#### List Notes
```
GET /candidates/notes/
```

#### Create Note
```
POST /candidates/notes/
```

**Request Body:**
```json
{
  "identifier": "string",
  "note": "string",
  "section": "string",
  "selected_text": "string",
  "context": {}
}
```

#### Get Note
```
GET /candidates/notes/{id}/
```

#### Update Note
```
PUT /candidates/notes/{id}/
PATCH /candidates/notes/{id}/
```

#### Delete Note
```
DELETE /candidates/notes/{id}/
```

#### Create Note for Profile
```
POST /candidates/profiles/{slug}/create-notes/
```

### AI Features

#### Career Coach
```
POST /candidates/career-coach/
```
AI-powered career coaching endpoint.

#### AI Prompt
```
POST /candidates/prompt/
```

---

## Job Posts & Applications

### Job Management

#### List Jobs
```
GET /channels/jobs/
```

#### Create Job Post
```
POST /channels/jobs/
```

**Request Body:**
```json
{
  "title": "string",
  "job_desc": "string",
  "workplace_type": 1,
  "location": "string",
  "job_type": 1,
  "skills": ["skill1", "skill2"],
  "estimated_salary": "string",
  "visa_required": false
}
```

**Workplace Types:**
- `1` - On-site
- `2` - Remote
- `3` - Hybrid

**Job Types:**
- `1` - Full-time
- `2` - Part-time
- `3` - Contract
- `4` - Temporary
- `5` - Internship
- `6` - Volunteer
- `7` - Other

#### Get Job Post
```
GET /channels/jobs/{id}/
```

#### Update Job Post
```
PUT /channels/jobs/{id}/
PATCH /channels/jobs/{id}/
```

#### Delete Job Post
```
DELETE /channels/jobs/{id}/
```

#### Browse Jobs (Public)
```
GET /channels/jobs/browse/
```
Public endpoint for candidates to browse all available jobs. Does NOT require authentication.

### Applications

#### Apply to Job
```
POST /channels/jobs/{id}/apply/
```

#### List Applications for Job
```
GET /channels/jobs/{id}/applications/
```

#### Make Application Decision
```
POST /channels/jobs/{id}/applications/{application_id}/decision/
```

#### List Candidate Applications
```
GET /channels/candidate/applications/
```

### Candidate Ranking

#### Rank Candidates
```
POST /channels/jobs/{id}/rank-candidates/
```
Triggers AI-powered candidate ranking for the job post.

#### Get Ranking Data
```
GET /channels/jobs/{id}/ranking-data/
```
Retrieves the candidate ranking results.

**Ranking Status Values:**
- `not_ranked` - Ranking has not been performed
- `ranking` - Ranking is in progress
- `ranked` - Ranking completed successfully
- `failed` - Ranking failed

### Agent Communication

#### Agent Endpoint
```
POST /channels/agent/
```

---

## Organization Management

### Organizations

#### List Organizations
```
GET /organization/organizations/
```

#### Create Organization
```
POST /organization/organizations/
```

**Request Body:**
```json
{
  "name": "string",
  "industry": 1,
  "linkedin_url": "https://linkedin.com/company/example",
  "headquarter_location": "string",
  "about": "string",
  "employee_size": 1,
  "url": "https://example.com"
}
```

**Industry Types:**
- `1` through `12` (specific industry mappings in application)

**Employee Size:**
- `1` - 1-10
- `2` - 11-50
- `3` - 51-200
- `4` - 201-1000
- `5` - 1000+

#### Get Organization
```
GET /organization/organizations/{id}/
```

#### Update Organization
```
PUT /organization/organizations/{id}/
PATCH /organization/organizations/{id}/
```

#### Delete Organization
```
DELETE /organization/organizations/{id}/
```

#### Create Invite
```
POST /organization/organizations/{id}/create-invite/
```
Create an invitation for a user to join the organization.

---

## Data Models

### User

```json
{
  "id": 0,
  "first_name": "string",
  "email": "user@example.com",
  "last_name": "string",
  "is_active": true,
  "profile": {
    "id": 0,
    "user": 0,
    "avatar": "string",
    "referral_code": "string",
    "total_referrals": 0
  },
  "is_verified": true,
  "is_candidate": "string"
}
```

### CandidateProfile

```json
{
  "id": 0,
  "slug": "string",
  "user": {},
  "organization": {},
  "resume_file": "https://example.com/resume.pdf",
  "resume_data": "string",
  "willing_to_relocate": false,
  "employment_type_preferences": {},
  "work_mode_preferences": {},
  "has_workvisa": false,
  "expected_salary_range": "string",
  "video_pitch": "https://example.com/video.mp4",
  "is_available": true,
  "disability_categories": {},
  "accommodation_needs": "YES",
  "workplace_accommodations": {},
  "get_all_notes": [],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### JobPost

```json
{
  "id": 0,
  "user": {},
  "organization": {},
  "title": "string",
  "job_desc": "string",
  "workplace_type": 1,
  "workplace_type_display": "string",
  "location": "string",
  "job_type": 1,
  "job_type_display": "string",
  "skills": [],
  "estimated_salary": "string",
  "visa_required": false,
  "candidate_ranking_data": {},
  "ranking_status": "not_ranked",
  "ranking_task_id": "string",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Education

```json
{
  "id": 0,
  "course_name": "string",
  "major": "string",
  "institution": "string",
  "start_year": 2020,
  "end_year": 2024,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Language

```json
{
  "id": 0,
  "language": "string",
  "speaking": "basic",
  "reading": "intermediate",
  "writing": "advanced"
}
```

### Organization

```json
{
  "id": 0,
  "root_user": {},
  "name": "string",
  "url": "https://example.com",
  "industry": 1,
  "linkedin_url": "https://linkedin.com/company/example",
  "headquarter_location": "string",
  "about": "string",
  "employee_size": 1,
  "users": [],
  "avatar_url": "https://example.com/avatar.png",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error occurred |

---

## Rate Limiting

Please contact support@enabledtalent.com for information about rate limits.

---

## Support

For API support, please contact: support@enabledtalent.com

---

## Changelog

### v1 (Current)
- Initial API release
- User authentication and management
- Candidate profile management
- Job posting and application system
- Organization management
- AI-powered candidate ranking
- Resume parsing functionality

---

## Best Practices

1. **Authentication**: Always include the Bearer token in the Authorization header for protected endpoints.

2. **Error Handling**: Implement proper error handling for all API responses.

3. **Pagination**: For list endpoints, implement pagination to handle large datasets.

4. **CSRF Protection**: Call the `/auth/csrf/` endpoint on frontend app load.

5. **Token Refresh**: Implement automatic token refresh logic using the `/auth/token/refresh/` endpoint.

6. **File Uploads**: When uploading resumes or avatars, use multipart/form-data encoding.

7. **Polling**: For long-running operations like resume parsing, use the polling endpoints to check status rather than blocking.

---

## Examples

### Complete Authentication Flow

```javascript
// 1. Sign up
const signupResponse = await fetch('https://etbackend-v2-usy9.onrender.com/api/auth/signup/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure_password',
    first_name: 'John',
    last_name: 'Doe'
  })
});

// 2. Login
const loginResponse = await fetch('https://etbackend-v2-usy9.onrender.com/api/auth/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure_password'
  }),
  credentials: 'include' // Important for cookies
});

// 3. Make authenticated request
const profileResponse = await fetch('https://etbackend-v2-usy9.onrender.com/api/auth/users/me/', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Creating a Job Post

```javascript
const jobResponse = await fetch('https://etbackend-v2-usy9.onrender.com/api/channels/jobs/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Senior Software Engineer',
    job_desc: 'We are looking for an experienced software engineer...',
    workplace_type: 2, // Remote
    location: 'Remote',
    job_type: 1, // Full-time
    skills: ['Python', 'Django', 'React'],
    estimated_salary: '$120,000 - $150,000',
    visa_required: false
  })
});
```

### Applying to a Job

```javascript
const applyResponse = await fetch(`https://etbackend-v2-usy9.onrender.com/api/channels/jobs/${jobId}/apply/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

**Last Updated:** January 2026