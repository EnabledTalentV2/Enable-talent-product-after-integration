# Backend Resume Data Specification

This document defines the ideal format for `resume_data` that the backend should return after parsing a resume. This format is designed to directly map to the frontend's `UserData` structure, minimizing transformation complexity.

## Current Backend Response (What We're Getting)

```json
{
  "id": 1,
  "slug": "john-doe-profile",
  "user": { ... },
  "resume_file": "https://...",
  "resume_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["Python", "Django"],
    "linkedin": null,
    "work_experience": "unstructured text blob...",
    "rest": "massive unstructured text blob with everything else..."
  }
}
```

**Problems with Current Format:**
- ❌ `work_experience` is a string instead of structured array
- ❌ `rest` field contains unstructured data
- ❌ No education details in structured format
- ❌ No projects, certifications, or achievements
- ❌ Skills are just an array without categorization
- ❌ Name needs to be split into first/last

---

## Ideal Backend Response Format

The backend should return `resume_data` in the following structured format:

```json
{
  "id": 1,
  "slug": "john-doe-profile",
  "user": { ... },
  "resume_file": "https://...",
  "resume_data": {
    // ============ BASIC INFO ============
    "personal_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "location": "San Francisco, CA",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_url": "https://github.com/johndoe",
      "portfolio_url": "https://johndoe.com"
    },

    // ============ EDUCATION ============
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "start_date": "2015-09",
        "end_date": "2019-05",
        "grade": "3.8 GPA",
        "description": "Dean's List, Honors Program"
      }
    ],

    // ============ WORK EXPERIENCE ============
    "work_experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "start_date": "2021-06",
        "end_date": null,  // null means current position
        "is_current": true,
        "description": "Led development of microservices architecture serving 1M+ users"
      },
      {
        "company": "Startup Inc",
        "position": "Software Engineer",
        "start_date": "2019-07",
        "end_date": "2021-05",
        "is_current": false,
        "description": "Built full-stack web applications using React and Node.js"
      }
    ],

    // ============ SKILLS ============
    "skills": {
      "technical": [
        "Python",
        "JavaScript",
        "React",
        "Django",
        "PostgreSQL",
        "Docker",
        "AWS"
      ],
      "soft_skills": [
        "Leadership",
        "Communication",
        "Problem Solving"
      ],
      // Optional: categorized skills
      "categories": {
        "frontend": ["React", "TypeScript", "CSS"],
        "backend": ["Python", "Django", "Node.js"],
        "database": ["PostgreSQL", "MongoDB"],
        "devops": ["Docker", "AWS", "CI/CD"]
      }
    },

    // ============ PROJECTS ============
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built a scalable e-commerce platform with 10k+ daily users",
        "start_date": "2022-01",
        "end_date": "2022-12",
        "is_current": false,
        "technologies": ["React", "Node.js", "MongoDB"],
        "url": "https://github.com/johndoe/ecommerce"
      }
    ],

    // ============ CERTIFICATIONS ============
    "certifications": [
      {
        "name": "AWS Certified Solutions Architect",
        "issuing_organization": "Amazon Web Services",
        "issue_date": "2023-03",
        "expiry_date": "2026-03",
        "credential_id": "AWS-12345",
        "credential_url": "https://aws.amazon.com/verification/AWS-12345"
      }
    ],

    // ============ ACHIEVEMENTS/AWARDS ============
    "achievements": [
      {
        "title": "Employee of the Year",
        "issuer": "Tech Corp",
        "date": "2023-12",
        "description": "Recognized for outstanding contributions to the engineering team"
      }
    ],

    // ============ LANGUAGES ============
    "languages": [
      {
        "language": "English",
        "proficiency": "Native",
        "speaking": "Native",
        "reading": "Native",
        "writing": "Native"
      },
      {
        "language": "Spanish",
        "proficiency": "Professional Working",
        "speaking": "Advanced",
        "reading": "Advanced",
        "writing": "Intermediate"
      }
    ],

    // ============ SUMMARY/OBJECTIVE ============
    "summary": "Experienced software engineer with 5+ years building scalable web applications...",

    // ============ ADDITIONAL INFO ============
    "additional_info": {
      "willing_to_relocate": true,
      "visa_sponsorship_required": false,
      "notice_period": "2 weeks",
      "expected_salary_min": 120000,
      "expected_salary_max": 150000,
      "preferred_work_mode": ["remote", "hybrid"]
    }
  },

  // Optional: Parsing metadata
  "parsing_metadata": {
    "confidence_score": 0.95,
    "parsing_date": "2024-01-15T10:30:00Z",
    "fields_extracted": ["personal_info", "education", "work_experience", "skills"],
    "fields_failed": []
  }
}
```

---

## Field Specifications

### Date Format
**All dates should use ISO 8601 format: `YYYY-MM` or `YYYY-MM-DD`**

Examples:
- `"2023-06"` (month precision)
- `"2023-06-15"` (day precision)
- `null` (for current/ongoing)

### Required vs Optional Fields

#### Personal Info (All Optional)
- `first_name` - String
- `last_name` - String
- `email` - String (validated email format)
- `phone` - String
- `location` - String
- `linkedin_url` - String (full URL)
- `github_url` - String (full URL)
- `portfolio_url` - String (full URL)

#### Education (Array, Optional)
Each entry should have:
- `institution` - String (required)
- `degree` - String (required)
- `field_of_study` - String (optional)
- `start_date` - String in YYYY-MM format (optional)
- `end_date` - String in YYYY-MM format or null (optional)
- `grade` - String (optional)
- `description` - String (optional)

#### Work Experience (Array, Optional)
Each entry should have:
- `company` - String (required)
- `position` - String (required)
- `start_date` - String in YYYY-MM format (optional)
- `end_date` - String in YYYY-MM format or null (optional)
- `is_current` - Boolean (optional, default: false)
- `description` - String (optional)

#### Skills (Object, Optional)
- `technical` - Array of strings (optional)
- `soft_skills` - Array of strings (optional)
- `categories` - Object with categorized skills (optional)

**Note:** If categorization is not possible, just return a flat array in `technical`

#### Projects (Array, Optional)
Each entry should have:
- `name` - String (required)
- `description` - String (optional)
- `start_date` - String in YYYY-MM format (optional)
- `end_date` - String in YYYY-MM format or null (optional)
- `is_current` - Boolean (optional)
- `technologies` - Array of strings (optional)
- `url` - String (optional)

#### Certifications (Array, Optional)
Each entry should have:
- `name` - String (required)
- `issuing_organization` - String (required)
- `issue_date` - String in YYYY-MM format (optional)
- `expiry_date` - String in YYYY-MM format or null (optional)
- `credential_id` - String (optional)
- `credential_url` - String (optional)

#### Achievements (Array, Optional)
Each entry should have:
- `title` - String (required)
- `issuer` - String (optional)
- `date` - String in YYYY-MM format (optional)
- `description` - String (optional)

#### Languages (Array, Optional)
Each entry should have:
- `language` - String (required)
- `proficiency` - String (optional: "Native", "Fluent", "Professional", "Intermediate", "Basic")
- `speaking` - String (optional)
- `reading` - String (optional)
- `writing` - String (optional)

---

## Benefits of This Format

### 1. **Direct Mapping to Frontend**
The structure matches the frontend's `UserData` type, requiring minimal transformation:

```typescript
// Frontend can directly use the data
const basicInfo = resumeData.personal_info;
const education = resumeData.education[0];
const workExperience = resumeData.work_experience;
const skills = resumeData.skills.technical;
```

### 2. **Type Safety**
Clear field types make validation and error handling easier:
- Dates are consistent (YYYY-MM format)
- Arrays are always arrays (not strings)
- Booleans are always booleans (not strings like "true")

### 3. **Extensibility**
New fields can be added without breaking existing code:
```json
{
  "personal_info": {
    "first_name": "John",
    "twitter_url": "https://twitter.com/johndoe"  // New field
  }
}
```

### 4. **Partial Data Support**
If parsing fails for a section, return an empty array/object instead of omitting it:
```json
{
  "work_experience": [],  // Parsing failed, but structure is preserved
  "education": [{ ... }],  // Parsing succeeded
  "skills": { "technical": [] }  // Parsing failed
}
```

### 5. **Validation Support**
The frontend can easily validate completeness:
```typescript
const hasBasicInfo = resumeData.personal_info?.first_name && resumeData.personal_info?.email;
const hasWorkExperience = resumeData.work_experience.length > 0;
```

---

## Fallback Strategy

If the backend **cannot** fully structure the data, it should:

1. **Return what it can structure** in the proper format
2. **Include a `raw_text` field** for unstructured data:

```json
{
  "resume_data": {
    "personal_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "skills": {
      "technical": ["Python", "Django"]
    },
    "work_experience": [],  // Could not parse
    "education": [],  // Could not parse
    "raw_text": {
      "work_experience": "Large unstructured text blob...",
      "education": "Large unstructured text blob..."
    }
  }
}
```

This allows the frontend to:
- Display structured data immediately
- Show raw text to users for manual entry
- Potentially use AI to re-parse the raw text

---

## Frontend Transformer

With this format, the frontend transformer becomes much simpler:

```typescript
function transformBackendResumeData(resumeData) {
  return {
    basicInfo: {
      firstName: resumeData.personal_info?.first_name,
      lastName: resumeData.personal_info?.last_name,
      email: resumeData.personal_info?.email,
      phone: resumeData.personal_info?.phone,
      location: resumeData.personal_info?.location,
      linkedinUrl: resumeData.personal_info?.linkedin_url,
      githubUrl: resumeData.personal_info?.github_url,
      portfolioUrl: resumeData.personal_info?.portfolio_url,
    },
    education: resumeData.education?.[0] ? {
      institution: resumeData.education[0].institution,
      courseName: resumeData.education[0].degree,
      major: resumeData.education[0].field_of_study,
      from: resumeData.education[0].start_date,
      to: resumeData.education[0].end_date,
      grade: resumeData.education[0].grade,
    } : undefined,
    workExperience: {
      experienceType: resumeData.work_experience?.length > 0 ? "experienced" : "fresher",
      entries: resumeData.work_experience?.map(exp => ({
        company: exp.company,
        role: exp.position,
        from: exp.start_date,
        to: exp.end_date,
        current: exp.is_current,
        description: exp.description,
      })) || []
    },
    skills: {
      skills: resumeData.skills?.technical?.join(", ") || "",
      primaryList: resumeData.skills?.technical || []
    },
    // ... and so on
  };
}
```

---

## Implementation Priority

If the backend team needs to implement this gradually:

### Phase 1 (High Priority)
- ✅ `personal_info` with first_name, last_name, email
- ✅ `skills.technical` as an array
- ✅ `work_experience` as structured array

### Phase 2 (Medium Priority)
- ✅ `education` as structured array
- ✅ `projects` as structured array
- ✅ Better date formatting (YYYY-MM)

### Phase 3 (Low Priority)
- ✅ `certifications` as structured array
- ✅ `achievements` as structured array
- ✅ `languages` as structured array
- ✅ Skill categorization

---

## Example API Response

Here's what a complete API response should look like:

```json
{
  "id": 1,
  "slug": "john-doe-profile",
  "user": {
    "id": 2,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": true
  },
  "resume_file": "https://storage.example.com/resumes/john-doe.pdf",
  "parsing_status": "parsed",
  "resume_data": {
    "personal_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567",
      "location": "San Francisco, CA",
      "linkedin_url": "https://linkedin.com/in/johndoe"
    },
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "start_date": "2015-09",
        "end_date": "2019-05",
        "grade": "3.8 GPA"
      }
    ],
    "work_experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Software Engineer",
        "start_date": "2021-06",
        "end_date": null,
        "is_current": true,
        "description": "Led development of microservices"
      }
    ],
    "skills": {
      "technical": ["Python", "JavaScript", "React", "Django"]
    },
    "projects": [],
    "certifications": [],
    "achievements": [],
    "languages": []
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## Testing

To test the integration, the backend should provide:

1. **Sample parsed resumes** in the new format
2. **Edge cases** like:
   - Resume with no work experience (student)
   - Resume with only work experience (no education)
   - Resume with special characters in names
   - Resume with multiple concurrent positions
   - Resume with expired certifications

3. **Validation endpoint** that checks if resume_data structure is correct

---

## Questions for Backend Team

1. **Can you implement this structure for `resume_data`?**
2. **

---

**Last Updated:** January 2026
