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
    <div className="mt-2 space-y-2" aria-live="polite" aria-atomic="false">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">
            Password Strength:
          </span>
          <span className={`text-xs font-semibold ${colors.text}`}>
            {label}
          </span>
        </div>
        <div
          className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={strength.score}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Password strength: ${label}`}
        >
          <div
            className={`h-full ${colors.bar} transition-all duration-300`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <ul className="space-y-1 text-xs list-none" aria-label="Password requirements">
        <li className="flex items-center gap-1.5">
          {strength.checks.length ? (
            <Check className="h-3.5 w-3.5 text-green-900" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span
            className={
              strength.checks.length ? "text-green-900" : "text-slate-700"
            }
          >
            At least 8 characters
            <span className="sr-only">
              {strength.checks.length ? " - met" : " - not met"}
            </span>
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          {strength.checks.uppercase ? (
            <Check className="h-3.5 w-3.5 text-green-900" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span
            className={
              strength.checks.uppercase ? "text-green-900" : "text-slate-700"
            }
          >
            One uppercase letter (A-Z)
            <span className="sr-only">
              {strength.checks.uppercase ? " - met" : " - not met"}
            </span>
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          {strength.checks.lowercase ? (
            <Check className="h-3.5 w-3.5 text-green-900" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span
            className={
              strength.checks.lowercase ? "text-green-900" : "text-slate-700"
            }
          >
            One lowercase letter (a-z)
            <span className="sr-only">
              {strength.checks.lowercase ? " - met" : " - not met"}
            </span>
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          {strength.checks.number ? (
            <Check className="h-3.5 w-3.5 text-green-900" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span
            className={
              strength.checks.number ? "text-green-900" : "text-slate-700"
            }
          >
            One number (0-9)
            <span className="sr-only">
              {strength.checks.number ? " - met" : " - not met"}
            </span>
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          {strength.checks.special ? (
            <Check className="h-3.5 w-3.5 text-green-900" aria-hidden="true" />
          ) : (
            <X className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span
            className={
              strength.checks.special ? "text-green-900" : "text-slate-700"
            }
          >
            One special character (!@#$%...)
            <span className="sr-only">
              {strength.checks.special ? " - met" : " - not met"}
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}
