"use client";

import { Suspense } from "react";
import { useEmployerLogin } from "@/lib/hooks/useEmployerLogin";
import EmployerLoginPageLayout from "@/components/login/EmployerLoginPageLayout";
import EmployerLoginForm from "@/components/login/employer/EmployerLoginForm";
import EmployerVerificationForm from "@/components/login/employer/EmployerVerificationForm";

function EmployerLoginPageContent() {
  const login = useEmployerLogin();

  return (
    <EmployerLoginPageLayout>
      {login.pendingVerification ? (
        <EmployerVerificationForm
          email={login.email}
          error={login.error}
          verificationCode={login.verificationCode}
          isVerifying={login.isVerifying}
          onCodeChange={login.setVerificationCode}
          onVerify={login.handleVerification}
          onCancel={login.cancelVerification}
        />
      ) : (
        <EmployerLoginForm
          continuePath={login.continuePath}
          email={login.email}
          password={login.password}
          showPassword={login.showPassword}
          isLoaded={login.isLoaded}
          isSubmitting={login.isSubmitting}
          isCheckingSession={login.isCheckingSession}
          isSyncing={login.isSyncing}
          hasExistingSession={login.hasExistingSession}
          needsSync={login.needsSync}
          needsPasswordReset={login.needsPasswordReset}
          hasError={login.hasError}
          error={login.error}
          roleWarning={login.roleWarning}
          syncRetryCount={login.syncRetryCount}
          warningSummaryRef={login.warningSummaryRef}
          errorSummaryRef={login.errorSummaryRef}
          handleSubmit={login.handleSubmit}
          setEmail={login.setEmail}
          setPassword={login.setPassword}
          togglePassword={login.togglePassword}
          handleSignOut={login.handleSignOut}
          handleSyncAccount={login.handleSyncAccount}
        />
      )}
    </EmployerLoginPageLayout>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense fallback={null}>
      <EmployerLoginPageContent />
    </Suspense>
  );
}
