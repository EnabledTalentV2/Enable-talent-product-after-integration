import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // In a real backend, this would trigger an email service (SendGrid, AWS SES, etc.)
    console.log(`[Mock API] Resending verification email to: ${email}`);

    return NextResponse.json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to resend email." },
      { status: 500 }
    );
  }
}
