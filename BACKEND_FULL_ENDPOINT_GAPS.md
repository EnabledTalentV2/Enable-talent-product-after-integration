# Backend `/full/` Endpoint Gaps

Analysis of missing fields in `GET /api/candidates/profiles/{slug}/full/` response compared to what the frontend needs.

---

## Current Backend Response

```json
{
  "user": {
    "id": 110,
    "first_name": "Vipin",
    "last_name": "Kaniyanthara",
    "email": "test1347@gmail.com",
    "is_candidate": true
  },
  "slug": "test1347-33318aa5",
  "resume_file": "https://...",
  "resume_data": {...},
  "verified_profile": {
    "basic_info": {
      "first_name": "Vipin",
      "last_name": "Kaniyanthara",
      "email": "test1347@gmail.com"
    },
    "education": [
      {
        "course_name": "Bachelor of Technology",
        "major": "Computer Engineering",
        "institution": "York University"
      }
    ],
    "skills": [
      { "name": "python" }
    ],
    "languages": [
      {
        "language": "English",
        "speaking": "advanced",
        "reading": "advanced",
        "writing": "advanced"
      }
    ],
    "preferences": {
      "employment_type_preferences": ["full-time", "contract"],
      "work_mode_preferences": ["hybrid"]
    },
    "accessibility_needs": {
      "accommodation_needs": "NO",
      "workplace_accommodations": ["ergonomic_keyboard"]
    }
  }
}
```

---

## Missing Fields

### 1. ❌ `verified_profile.basic_info` - Incomplete

**Missing fields:**
```json
{
  "basic_info": {
    // ✅ Has: first_name, last_name, email
    // ❌ Missing:
    "phone": "string",
    "location": "string",
    "citizenship_status": "string",
    "gender": "string",
    "ethnicity": "string",
    "linkedin_url": "string",
    "github_url": "string",
    "portfolio_url": "string",
    "current_status": "string",
    "profile_photo": "string"
  }
}
```

**Frontend expects:** `UserData.basicInfo` has 14 fields, backend only returns 3.

---

### 2. ❌ `verified_profile.education` - Missing Fields

**Current:**
```json
{
  "course_name": "Bachelor of Technology",
  "major": "Computer Engineering",
  "institution": "York University"
}
```

**Missing:**
```json
{
  // ❌ Missing:
  "start_date": "2021-09",      // or start_year: 2021
  "end_date": "2025-05",        // or end_year: 2025
  "graduation_date": "2025-05", // or graduation_year: 2025
  "grade": "3.8 GPA",
  "description": "string"
}
```

**Frontend expects:** `UserData.education` has `from`, `to`, `graduationDate`, `grade`.

---

### 3. ❌ `verified_profile.skills` - Missing Level

**Current:**
```json
{ "name": "python" }
```

**Should have:**
```json
{
  "name": "python",
  "level": "intermediate"  // ← Missing!
}
```

**Frontend note:** Skills are sent with a level during signup, but not returned.

---

### 4. ❌ `verified_profile.accessibility_needs` - Incomplete

**Current:**
```json
{
  "accommodation_needs": "NO",
  "workplace_accommodations": ["ergonomic_keyboard"]
}
```

**Missing:**
```json
{
  // ✅ Has: accommodation_needs, workplace_accommodations
  // ❌ Missing:
  "disability_categories": ["visual", "hearing"],  // ← CRITICAL MISSING!
  "disclosure_preference": "during_application"    // ← CRITICAL MISSING!
}
```

**Frontend mapping:**
- `disability_categories` → `UserData.accessibilityNeeds.categories`
- `accommodation_needs` → `UserData.accessibilityNeeds.accommodationNeed`
- `disclosure_preference` → `UserData.accessibilityNeeds.disclosurePreference`
- `workplace_accommodations` → `UserData.accessibilityNeeds.accommodations`

**Impact:** Without `disability_categories` and `disclosure_preference`, the frontend cannot display what the user selected during signup.

---

### 5. ❌ `verified_profile.preferences` - Incomplete

**Current:**
```json
{
  "employment_type_preferences": ["full-time", "contract"],
  "work_mode_preferences": ["hybrid"]
}
```

**Missing:**
```json
{
  // ✅ Has: employment_type_preferences, work_mode_preferences
  // ❌ Missing:
  "company_size": ["startup", "mid-size"],       // Not implemented
  "job_search_status": ["actively_looking"]      // If implemented
}
```

**Frontend has:** `UserData.preference` includes `companySize`, `jobType`, `jobSearch`.

---

### 6. ❌ `verified_profile` - Missing Entire Sections

These sections are collected in frontend but NOT in backend response:

#### A. Work Experience
```json
"work_experience": [
  {
    "company": "Tech Corp",
    "role": "Senior Software Engineer",
    "start_date": "2021-06",
    "end_date": null,
    "is_current": true,
    "description": "Led development..."
  }
]
```

**Frontend has:** `UserData.workExperience.entries[]`

#### B. Projects
```json
"projects": [
  {
    "project_name": "E-commerce Platform",
    "description": "Built a scalable...",
    "start_date": "2022-01",
    "end_date": "2022-12",
    "is_current": false,
    "technologies": ["React", "Node.js"]
  }
]
```

**Frontend has:** `UserData.projects.entries[]`

#### C. Certifications
```json
"certifications": [
  {
    "name": "AWS Certified Solutions Architect",
    "organization": "Amazon Web Services",
    "issue_date": "2023-03",
    "expiry_date": "2026-03",
    "credential_id_url": "https://..."
  }
]
```

**Frontend has:** `UserData.certification.entries[]`

#### D. Achievements
```json
"achievements": [
  {
    "title": "Employee of the Year",
    "issuer": "Tech Corp",
    "date": "2023-12",
    "description": "Recognized for..."
  }
]
```

**Frontend has:** `UserData.achievements.entries[]`

#### E. Other Details
```json
"other_details": {
  "career_stage": "mid-level",
  "availability": "Immediately",
  "desired_salary": "90000-120000"
}
```

**Frontend has:** `UserData.otherDetails.careerStage`, `availability`, `desiredSalary`

#### F. How Discovered / Comments
```json
"how_discovered": "LinkedIn",
"comments": "Looking forward to..."
```

**Frontend has:** `UserData.reviewAgree.discover`, `comments`

---

## Complete Expected Response

```json
{
  "user": {
    "id": 110,
    "first_name": "Vipin",
    "last_name": "Kaniyanthara",
    "email": "test1347@gmail.com",
    "is_candidate": true,
    "profile": {
      "avatar": "https://..."  // Optional profile photo
    }
  },
  "slug": "test1347-33318aa5",
  "resume_file": "https://supabase.../resume.pdf",
  "resume_data": {
    "name": "Vipin Kaniyanthara",
    "email": "test1347@gmail.com",
    "phone": "+1-555-123-4567",
    "skills": ["Python", "React", "Django"],
    "work_experience": [...]
  },
  "verified_profile": {
    "basic_info": {
      "first_name": "Vipin",
      "last_name": "Kaniyanthara",
      "email": "test1347@gmail.com",
      "phone": "+1-555-123-4567",
      "location": "Toronto, ON",
      "citizenship_status": "Canadian Citizen",
      "gender": "Male",
      "ethnicity": "Asian",
      "linkedin_url": "https://linkedin.com/in/vipin",
      "github_url": "https://github.com/vipin",
      "portfolio_url": "https://vipin.dev",
      "current_status": "Employed",
      "profile_photo": "https://..."
    },
    "education": [
      {
        "course_name": "Bachelor of Technology",
        "major": "Computer Engineering",
        "institution": "York University",
        "start_year": 2021,
        "end_year": 2025,
        "graduation_year": 2025,
        "grade": "3.8 GPA",
        "description": "Dean's List"
      }
    ],
    "work_experience": [
      {
        "company": "Tech Corp",
        "role": "Senior Software Engineer",
        "start_date": "2021-06",
        "end_date": null,
        "is_current": true,
        "description": "Led development of microservices"
      }
    ],
    "skills": [
      {
        "name": "python",
        "level": "advanced"
      },
      {
        "name": "react",
        "level": "intermediate"
      }
    ],
    "languages": [
      {
        "language": "English",
        "speaking": "advanced",
        "reading": "advanced",
        "writing": "advanced"
      }
    ],
    "projects": [
      {
        "project_name": "E-commerce Platform",
        "description": "Built a scalable e-commerce platform",
        "start_date": "2022-01",
        "end_date": "2022-12",
        "is_current": false,
        "technologies": ["React", "Node.js", "MongoDB"]
      }
    ],
    "certifications": [
      {
        "name": "AWS Certified Solutions Architect",
        "organization": "Amazon Web Services",
        "issue_date": "2023-03",
        "expiry_date": "2026-03",
        "credential_id_url": "https://aws.amazon.com/verify/..."
      }
    ],
    "achievements": [
      {
        "title": "Employee of the Year",
        "issuer": "Tech Corp",
        "date": "2023-12",
        "description": "Recognized for outstanding contributions"
      }
    ],
    "preferences": {
      "employment_type_preferences": ["full-time", "contract"],
      "work_mode_preferences": ["hybrid", "remote"],
      "company_size": ["startup", "mid-size"]
    },
    "accessibility_needs": {
      "disability_categories": ["visual", "hearing"],
      "accommodation_needs": "YES",
      "disclosure_preference": "during_application",
      "workplace_accommodations": ["flexible_schedule", "ergonomic_keyboard"]
    },
    "other_details": {
      "career_stage": "mid-level",
      "availability": "Immediately",
      "desired_salary": "90000-120000"
    },
    "how_discovered": "LinkedIn",
    "comments": "Looking forward to working with you!"
  },
  "expected_salary_range": "90000-120000",
  "is_available": true,
  "has_workvisa": true,
  "willing_to_relocate": false
}
```

---

## Priority Fixes

### 🔴 Critical (Blocking Frontend)

1. **Add `disability_categories` to `accessibility_needs`**
   ```python
   # In CandidateProfile model
   disability_categories = models.JSONField(default=list, blank=True)
   ```

2. **Add `disclosure_preference` to `accessibility_needs`**
   ```python
   # In CandidateProfile model
   disclosure_preference = models.CharField(max_length=50, blank=True)
   # Choices: "during_application", "after_offer", "prefer_not_to_disclose"
   ```

3. **Add date fields to Education**
   - `start_year`, `end_year`, `graduation_year`
   - Or `start_date`, `end_date`, `graduation_date`

4. **Add `level` to Skills response**
   - Already stored in backend, just include in response

### 🟡 Important (Improves UX)

5. **Add basic_info fields**
   - phone, location, citizenship_status, gender, ethnicity
   - linkedin_url, github_url, portfolio_url
   - current_status, profile_photo

6. **Add work_experience to verified_profile**
   - Frontend collects this data but can't send it yet
   - Need endpoint: `POST /api/candidates/work-experience/`

7. **Add projects to verified_profile**
   - Frontend collects this data but can't send it yet
   - Need endpoint: `POST /api/candidates/projects/`

### 🟢 Nice to Have

8. **Add certifications to verified_profile**
   - Frontend collects this data but can't send it yet
   - Need endpoint: `POST /api/candidates/certifications/`

9. **Add achievements to verified_profile**
   - Frontend collects this data but can't send it yet
   - Need endpoint: `POST /api/candidates/achievements/`

10. **Add other_details to verified_profile**
    - career_stage, availability, desired_salary

11. **Add how_discovered and comments**
    - From ReviewAgree step

---

## Impact on Frontend

### Currently Broken:
- ❌ Accessibility form cannot pre-fill `disability_categories`
- ❌ Accessibility form cannot pre-fill `disclosure_preference`
- ❌ Education dates not displayed
- ❌ Skill levels not displayed

### Workarounds in Use:
- Frontend stores data in Zustand/localStorage
- Data sent to backend but not retrieved
- Forms start empty on reload

### When Fixed:
- ✅ Forms will pre-fill from backend data
- ✅ Users can edit their profile
- ✅ Data persists across sessions
- ✅ Dashboard can display complete profile

---

## Recommended Backend Changes

### Phase 1: Fix Critical Gaps (High Priority)

```python
# models.py - Add to CandidateProfile
class CandidateProfile(models.Model):
    # ... existing fields ...

    # Critical missing fields
    disability_categories = models.JSONField(default=list, blank=True)
    disclosure_preference = models.CharField(
        max_length=50,
        choices=[
            ('during_application', 'During Application'),
            ('after_offer', 'After Offer'),
            ('prefer_not_to_disclose', 'Prefer Not to Disclose'),
        ],
        blank=True
    )

# serializers.py - Include in response
class CandidateProfileFullSerializer(serializers.ModelSerializer):
    verified_profile = serializers.SerializerMethodField()

    def get_verified_profile(self, obj):
        return {
            'basic_info': self.get_basic_info(obj),
            'education': self.get_education(obj),
            'skills': self.get_skills(obj),  # Include 'level' field
            'languages': self.get_languages(obj),
            'preferences': self.get_preferences(obj),
            'accessibility_needs': {
                'disability_categories': obj.disability_categories,  # ← Add
                'accommodation_needs': obj.accommodation_needs,
                'disclosure_preference': obj.disclosure_preference,  # ← Add
                'workplace_accommodations': obj.workplace_accommodations,
            }
        }
```

### Phase 2: Add Missing Sections (Medium Priority)

```python
# Add new models
class WorkExperience(models.Model):
    candidate = models.ForeignKey(CandidateProfile, related_name='work_experiences')
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

class Project(models.Model):
    candidate = models.ForeignKey(CandidateProfile, related_name='projects')
    project_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    technologies = models.JSONField(default=list)

# Add endpoints
POST /api/candidates/work-experience/
POST /api/candidates/projects/
POST /api/candidates/certifications/
POST /api/candidates/achievements/
```

---

## Frontend Mapping Reference

| Frontend Field | Backend Field (verified_profile) | Status |
|----------------|----------------------------------|--------|
| `accessibilityNeeds.categories` | `accessibility_needs.disability_categories` | ❌ Missing |
| `accessibilityNeeds.accommodationNeed` | `accessibility_needs.accommodation_needs` | ✅ Exists |
| `accessibilityNeeds.disclosurePreference` | `accessibility_needs.disclosure_preference` | ❌ Missing |
| `accessibilityNeeds.accommodations` | `accessibility_needs.workplace_accommodations` | ✅ Exists |
| `education.from` | `education[0].start_date` or `start_year` | ❌ Missing |
| `education.to` | `education[0].end_date` or `end_year` | ❌ Missing |
| `education.graduationDate` | `education[0].graduation_date` or `graduation_year` | ❌ Missing |
| `education.grade` | `education[0].grade` | ❌ Missing |
| `skills.primaryList[].level` | `skills[].level` | ❌ Missing from response |
| `basicInfo.phone` | `basic_info.phone` | ❌ Missing |
| `basicInfo.location` | `basic_info.location` | ❌ Missing |
| `basicInfo.linkedinUrl` | `basic_info.linkedin_url` | ❌ Missing |
| `workExperience.entries` | `work_experience[]` | ❌ Not implemented |
| `projects.entries` | `projects[]` | ❌ Not implemented |
| `certification.entries` | `certifications[]` | ❌ Not implemented |
| `achievements.entries` | `achievements[]` | ❌ Not implemented |

---

**Last Updated:** 2026-01-18
**Status:** 🔴 Critical gaps identified - Backend needs updates
