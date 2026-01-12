import { Check, X } from "lucide-react";
import {
  validatePasswordStrength,
  getStrengthLabel,
  getStrengthColor,
} from "@/lib/utils/passwordValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export function PasswordStrengthIndicator({
  password,
  show,
}: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const strength = validatePasswordStrength(password);
  const colors = getStrengthColor(strength.score);
  const label = getStrengthLabel(strength.score);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">
            Password Strength:
          </span>
          <span className={`text-xs font-semibold ${colors.text}`}>
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} transition-all duration-300`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          {strength.checks.length ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={
              strength.checks.length ? "text-green-700" : "text-slate-600"
            }
          >
            At least 8 characters
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.checks.uppercase ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={
              strength.checks.uppercase ? "text-green-700" : "text-slate-600"
            }
          >
            One uppercase letter (A-Z)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.checks.lowercase ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={
              strength.checks.lowercase ? "text-green-700" : "text-slate-600"
            }
          >
            One lowercase letter (a-z)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.checks.number ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={
              strength.checks.number ? "text-green-700" : "text-slate-600"
            }
          >
            One number (0-9)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {strength.checks.special ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={
              strength.checks.special ? "text-green-700" : "text-slate-600"
            }
          >
            One special character (!@#$%...)
          </span>
        </div>
      </div>
    </div>
  );
}
