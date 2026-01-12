export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const feedback: string[] = [];
  if (!checks.length) feedback.push("At least 8 characters");
  if (!checks.uppercase) feedback.push("One uppercase letter");
  if (!checks.lowercase) feedback.push("One lowercase letter");
  if (!checks.number) feedback.push("One number");
  if (!checks.special) feedback.push("One special character");

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = passedChecks;
  const isStrong = score >= 4;

  return {
    score,
    feedback,
    isStrong,
    checks,
  };
}

export function getStrengthLabel(score: number): string {
  if (score === 0) return "Very Weak";
  if (score === 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong";
}

export function getStrengthColor(score: number): {
  bg: string;
  text: string;
  bar: string;
} {
  if (score === 0)
    return { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" };
  if (score === 1)
    return { bg: "bg-orange-50", text: "text-orange-700", bar: "bg-orange-500" };
  if (score === 2)
    return { bg: "bg-yellow-50", text: "text-yellow-700", bar: "bg-yellow-500" };
  if (score === 3)
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      bar: "bg-blue-500",
    };
  return { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-500" };
}
