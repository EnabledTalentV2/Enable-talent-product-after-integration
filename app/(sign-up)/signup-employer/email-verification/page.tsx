"use client";

import NavBarEmployerSignUp from "@/components/employer/NavBarEmployerSignUp";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryVerified = searchParams.get("verified") === "true";
  const [isVerified, setIsVerified] = useState(queryVerified);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">(
    "idle"
  );
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (queryVerified) {
      setIsVerified(true);
    }
  }, [queryVerified]);

  useEffect(() => {
    let active = true;

    const loadEmail = async () => {
      try {
        const response = await fetch("/api/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          if (active) {
            setPendingEmail(null);
          }
          return;
        }

        const data = await response.json().catch(() => null);
        if (active) {
          const record =
            data && typeof data === "object"
              ? (data as Record<string, unknown>)
              : null;
          const email =
            record && typeof record.email === "string" ? record.email : null;
          const verified =
            record && typeof record.is_verified === "boolean"
              ? record.is_verified
              : record && typeof record.isVerified === "boolean"
              ? record.isVerified
              : null;

          setPendingEmail(email);
          if (verified !== null) {
            setIsVerified(verified || queryVerified);
          }
        }
      } catch {
        if (active) {
          setPendingEmail(null);
        }
      }
    };

    loadEmail();

    return () => {
      active = false;
    };
  }, [queryVerified]);

  const handleResendEmail = async () => {
    if (!pendingEmail) {
      setResendStatus("error");
      return;
    }

    setIsResending(true);
    setResendStatus("idle");

    try {
      await apiRequest("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: pendingEmail }),
      });

      setResendStatus("sent");

      // Reset status after 5 seconds
      setTimeout(() => setResendStatus("idle"), 5000);
    } catch (error) {
      setResendStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-sm p-20 md:p-32 flex flex-col items-center justify-center text-center min-h-[500px]">
      {!isVerified ? (
        <>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 max-w-2xl leading-tight">
            Check your work email inbox and verify the email id!
          </h1>

          <p className="text-gray-500 mb-10 max-w-md text-lg">
            Check your inbox. If you don&apos;t see the email within a few minutes,
            check your spam folder or click &apos;Resend Email&apos;.
          </p>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendStatus === "sent"}
              className={`${
                resendStatus === "sent"
                  ? "bg-green-500"
                  : "bg-[#D98B48] hover:bg-[#C07A3D]"
              } text-white font-semibold py-3 px-10 rounded-xl transition-all shadow-md disabled:opacity-70 min-w-[240px]`}
            >
              {isResending
                ? "Sending..."
                : resendStatus === "sent"
                ? "Email Sent!"
                : "Resend verification email"}
            </button>

            <button
              onClick={() => router.push("/signup-employer")}
              className="text-[#D98B48] font-medium hover:underline text-sm"
            >
              Entered the wrong email? Edit email address
            </button>

            {/* Helper to simulate verification for testing */}
            <button
              onClick={() => router.push("?verified=true")}
              className="mt-4 text-xs text-gray-400 underline hover:text-gray-600"
            >
              Simulate verification link click
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-gray-900">Success!</h1>

          <p className="mb-10 text-lg text-gray-500">
            You have successfully verified your work email id
          </p>

          <button
            onClick={() => router.push("/signup-employer/organisation-info")}
            className="rounded-xl bg-[#D98B48] px-12 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#C07A3D]"
          >
            Get started
          </button>
        </>
      )}
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#C5D8F5]">
      <NavBarEmployerSignUp />

      <div className="flex flex-1 items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <VerificationContent />
        </Suspense>
      </div>
    </div>
  );
}
