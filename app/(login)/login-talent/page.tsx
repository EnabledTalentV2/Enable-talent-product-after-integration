"use client";

import { Suspense } from "react";
import { useTalentLogin } from "@/lib/hooks/useTalentLogin";
import LoginPageLayout from "@/components/login/LoginPageLayout";
import TalentLoginForm from "@/components/login/talent/TalentLoginForm";
import TalentVerificationForm from "@/components/login/talent/TalentVerificationForm";

function LoginPageContent() {
  const login = useTalentLogin();

  return (
    <LoginPageLayout>
      {login.pendingVerification ? (
        <TalentVerificationForm
          email={login.email}
          error={login.error}
          verificationCode={login.verificationCode}
          isVerifying={login.isVerifying}
          onCodeChange={login.setVerificationCode}
          onVerify={login.handleVerification}
          onCancel={login.cancelVerification}
        />
      ) : (
        <TalentLoginForm
          continuePath={login.continuePath}
          email={login.email}
          password={login.password}
          showPassword={login.showPassword}
          isLoaded={login.isLoaded}
          isLoading={login.isLoading}
          isCheckingSession={login.isCheckingSession}
          isSyncing={login.isSyncing}
          hasExistingSession={login.hasExistingSession}
          needsSync={login.needsSync}
          hasError={login.hasError}
          error={login.error}
          roleWarning={login.roleWarning}
          syncRetryCount={login.syncRetryCount}
          warningSummaryRef={login.warningSummaryRef}
          errorSummaryRef={login.errorSummaryRef}
          handleOAuthGoogle={login.handleOAuthGoogle}
          handleSubmit={login.handleSubmit}
          setEmail={login.setEmail}
          setPassword={login.setPassword}
          togglePassword={login.togglePassword}
          handleSignOut={login.handleSignOut}
          handleSyncAccount={login.handleSyncAccount}
          isSessionExpired={login.isSessionExpired}
        />
      )}
    </LoginPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
