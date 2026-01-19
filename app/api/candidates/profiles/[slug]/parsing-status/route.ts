import { NextRequest, NextResponse } from "next/server";

// In-memory storage for tracking parsing simulation
// Key: candidate slug, Value: { callCount: number, timestamp: number }
const parsingSimulation = new Map<string, { callCount: number; timestamp: number }>();

// Mock resume data to return after "parsing completes"
const MOCK_RESUME_DATA = {
  personal_info: {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    location: "Toronto, ON",
    linkedin_url: "https://linkedin.com/in/johndoe",
    github_url: "https://github.com/johndoe",
    portfolio_url: "https://johndoe.dev",
  },
  education: [
    {
      institution: "University of Toronto",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science",
      start_date: "2018-09",
      end_date: "2022-05",
      grade: "3.8 GPA",
      description: "Dean's List, Computer Science Honors",
    },
  ],
  work_experience: [
    {
      company: "Tech Solutions Inc",
      position: "Software Engineer",
      start_date: "2022-06",
      end_date: null,
      is_current: true,
      description:
        "Developed full-stack web applications using React and Node.js. Led migration to microservices architecture.",
    },
    {
      company: "StartupXYZ",
      position: "Junior Developer",
      start_date: "2021-01",
      end_date: "2022-05",
      is_current: false,
      description:
        "Built RESTful APIs and implemented authentication systems. Worked on frontend features using React.",
    },
  ],
  skills: {
    technical: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Django",
      "PostgreSQL",
      "MongoDB",
      "Docker",
      "AWS",
      "Git",
    ],
    soft_skills: ["Communication", "Leadership", "Problem Solving", "Team Collaboration"],
  },
  projects: [
    {
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform with payment integration",
      start_date: "2023-01",
      end_date: "2023-06",
      is_current: false,
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      url: "https://github.com/johndoe/ecommerce",
    },
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuing_organization: "Amazon Web Services",
      issue_date: "2023-03",
      expiry_date: "2026-03",
      credential_id: "AWS-12345",
      credential_url: "https://aws.amazon.com/verification/AWS-12345",
    },
  ],
  languages: [
    {
      language: "English",
      proficiency: "Native",
      speaking: "Native",
      reading: "Native",
      writing: "Native",
    },
    {
      language: "French",
      proficiency: "Intermediate",
      speaking: "Intermediate",
      reading: "Advanced",
      writing: "Intermediate",
    },
  ],
  summary:
    "Experienced software engineer with 2+ years building scalable web applications. Passionate about clean code and user experience.",
};

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * GET /api/candidates/profiles/[slug]/parsing-status/
 *
 * Mock endpoint for testing resume parsing flow.
 * Simulates async parsing by returning "parsing" status for first 3 calls,
 * then returns "parsed" status with mock resume data.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json(
      { error: "Candidate slug is required" },
      { status: 400 }
    );
  }

  // Get or initialize tracking data for this slug
  let tracking = parsingSimulation.get(slug);

  if (!tracking) {
    tracking = { callCount: 0, timestamp: Date.now() };
  }

  // Increment call count
  tracking.callCount += 1;
  tracking.timestamp = Date.now();
  parsingSimulation.set(slug, tracking);

  console.log(
    `[Mock Parsing Status] Slug: ${slug}, Call: ${tracking.callCount}`
  );

  // First 3 calls: return "parsing" status
  if (tracking.callCount <= 3) {
    return NextResponse.json({
      slug,
      parsing_status: "parsing",
      resume_data: null,
      has_resume_data: false,
      resume_file_exists: true,
      has_verified_data: false,
      message: `Parsing in progress... (Call ${tracking.callCount}/3)`,
      _mock: true,
      _call_count: tracking.callCount,
    });
  }

  // After 3 calls: return "parsed" status with mock data
  return NextResponse.json({
    slug,
    parsing_status: "parsed",
    resume_data: MOCK_RESUME_DATA,
    has_resume_data: true,
    resume_file_exists: true,
    has_verified_data: true,
    message: "Resume parsing completed successfully",
    _mock: true,
    _call_count: tracking.callCount,
  });
}

/**
 * DELETE /api/candidates/profiles/[slug]/parsing-status/
 *
 * Reset the parsing simulation counter for a specific slug.
 * Useful for testing multiple resume uploads.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json(
      { error: "Candidate slug is required" },
      { status: 400 }
    );
  }

  const existed = parsingSimulation.has(slug);
  parsingSimulation.delete(slug);

  console.log(`[Mock Parsing Status] Reset counter for slug: ${slug}`);

  return NextResponse.json({
    message: existed
      ? `Parsing simulation reset for ${slug}`
      : `No simulation data found for ${slug}`,
    slug,
    _mock: true,
  });
}

/**
 * POST /api/candidates/profiles/[slug]/parsing-status/
 *
 * Reset all parsing simulation counters.
 * Useful for resetting test state.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const body = await request.json().catch(() => ({}));

  if (body.action === "reset_all") {
    const count = parsingSimulation.size;
    parsingSimulation.clear();

    console.log(`[Mock Parsing Status] Reset all simulation data (${count} entries)`);

    return NextResponse.json({
      message: `All parsing simulations reset (${count} entries cleared)`,
      _mock: true,
    });
  }

  return NextResponse.json(
    { error: "Invalid action. Use { action: 'reset_all' }" },
    { status: 400 }
  );
}
