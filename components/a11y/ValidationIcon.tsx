"use client";

import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ValidationIconProps = {
  type: "error" | "success" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  /**
   * Label for screen readers. Required for accessibility.
   * WCAG 1.4.1: Don't use color alone to convey information
   */
  label?: string;
};

/**
 * Accessible validation icon that provides visual AND text indicators
 * WCAG 2.2 compliant:
 * - 1.4.1 Use of Color: Icon shape provides non-color indicator
 * - 1.3.1 Info and Relationships: aria-label provides text alternative
 * - 1.4.11 Non-text Contrast: Icons meet 3:1 contrast ratio
 */
export default function ValidationIcon({
  type,
  size = "md",
  className = "",
  label,
}: ValidationIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const icons = {
    error: {
      Icon: AlertCircle,
      color: "text-red-800",
      defaultLabel: "Error",
    },
    success: {
      Icon: CheckCircle,
      color: "text-emerald-900",
      defaultLabel: "Success",
    },
    warning: {
      Icon: AlertTriangle,
      color: "text-amber-900",
      defaultLabel: "Warning",
    },
    info: {
      Icon: Info,
      color: "text-blue-600",
      defaultLabel: "Information",
    },
  };

  const { Icon, color, defaultLabel } = icons[type];
  const ariaLabel = label || defaultLabel;

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={`inline-flex items-center ${color} ${className}`}
    >
      <Icon className={sizeClasses[size]} aria-hidden="true" />
    </span>
  );
}
