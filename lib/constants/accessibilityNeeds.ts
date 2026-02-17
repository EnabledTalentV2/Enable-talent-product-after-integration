export const ACCESSIBILITY_CATEGORIES = [
  {
    id: "physical",
    title: "Physical Disability",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "sensory",
    title: "Sensory Disability",
    description: "Includes vision and hearing impairments",
  },
  {
    id: "neurodevelopmental",
    title: "Neurodevelopmental",
    description: "Includes ADHD, autism spectrum, and learning disabilities",
  },
  {
    id: "mental_health",
    title: "Mental Health",
    description:
      "Includes anxiety, depression, and other mental health conditions",
  },
  {
    id: "intellectual",
    title: "Intellectual Disability",
    description: "Includes developmental and cognitive disabilities",
  },
  {
    id: "acquired",
    title: "Acquired Disability",
    description:
      "Includes traumatic brain injury, stroke, and other acquired conditions",
  },
  {
    id: "chronic",
    title: "Chronic Health Condition",
    description:
      "Includes mobility impairments, chronic pain, and physical limitations",
  },
  {
    id: "other",
    title: "Other Disability",
    description: "Any disability not covered in the categories above",
  },
  {
    id: "prefer_not_to_disclose",
    title: "Prefer not to disclose",
    description: "",
  },
] as const;

export const ACCOMMODATION_OPTIONS = [
  { id: "flexible_schedule", label: "Flexible schedule" },
  { id: "remote_work", label: "Remote work options" },
  { id: "assistive_tech", label: "Assistive technology" },
  { id: "accessible_workspace", label: "Accessible workspace" },
  { id: "flexible_deadlines", label: "Flexible deadlines" },
  { id: "support_person", label: "Support person access" },
  { id: "other", label: "Other" },
  { id: "non_needed", label: "None needed" },
  { id: "prefer_discuss_later", label: "Prefer to discuss later" },
] as const;

export const ACCOMMODATION_NEED_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "discuss_later", label: "Prefer to discuss later" },
] as const;

export const DISCLOSURE_PREFERENCE_OPTIONS = [
  { id: "during_application", label: "During Application" },
  { id: "during_interview", label: "During Interview" },
  { id: "after_offer", label: "After job offer" },
  { id: "after_start", label: "After starting work" },
  { id: "not_applicable", label: "Not applicable" },
] as const;

export const PARSE_FAILURE_MESSAGE = "Something went wrong with resume parsing.";
export const PARSE_TIMEOUT_MESSAGE =
  "Resume parsing is taking longer than expected. You can retry or continue with manual entry.";
export const PARSING_POLL_DELAY_MS = 1500; // 1.5 seconds between attempts
export const PARSING_MAX_ATTEMPTS = 20; // Max 20 attempts (30 seconds total)
