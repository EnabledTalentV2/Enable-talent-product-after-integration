"use client";

const inputClasses =
  "w-full h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-500";

type EmployerVerificationFormProps = {
  email: string;
  error: string | null;
  verificationCode: string;
  isVerifying: boolean;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
  onCancel: () => void;
};

export default function EmployerVerificationForm({
  email,
  error,
  verificationCode,
  isVerifying,
  onCodeChange,
  onVerify,
  onCancel,
}: EmployerVerificationFormProps) {
  return (
    <>
      <div className="text-center mb-7">
        <h2 className="text-[26px] font-semibold text-gray-900 mb-2">
          Verify your email
        </h2>
        <p className="text-sm text-gray-500">
          We sent a verification code to <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1">
          <label
            className="block text-[16px] font-semibold text-gray-900"
            htmlFor="employer-verificationCode"
          >
            Verification code
          </label>
          <input
            className={inputClasses}
            id="employer-verificationCode"
            name="verificationCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => onCodeChange(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={onVerify}
          disabled={isVerifying || !verificationCode.trim()}
          className="w-full rounded-lg bg-gradient-to-r from-[#C04622] to-[#E88F53] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isVerifying ? "Verifying..." : "Verify email"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to login
        </button>
      </div>
    </>
  );
}
