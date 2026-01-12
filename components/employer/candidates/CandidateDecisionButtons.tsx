"use client";

import React, { useState } from "react";
import { useCandidateDecision } from "@/lib/hooks/useCandidateDecision";
import type { CandidateDecisionStatus } from "@/lib/types/candidate-decision";
import { CheckCircle, XCircle, UserCheck, Loader2 } from "lucide-react";

interface CandidateDecisionButtonsProps {
  jobId: string;
  applicationId: string | number;
  currentStatus?: CandidateDecisionStatus;
  onDecisionUpdate?: (status: CandidateDecisionStatus) => void;
  variant?: "full" | "compact";
}

export default function CandidateDecisionButtons({
  jobId,
  applicationId,
  currentStatus,
  onDecisionUpdate,
  variant = "full",
}: CandidateDecisionButtonsProps) {
  const {
    isUpdating,
    error,
    shortlistCandidate,
    rejectCandidate,
    hireCandidate,
    clearError,
  } = useCandidateDecision();

  const [localStatus, setLocalStatus] = useState<
    CandidateDecisionStatus | undefined
  >(currentStatus);
  const [showConfirmation, setShowConfirmation] = useState<
    CandidateDecisionStatus | null
  >(null);

  const handleDecision = async (status: CandidateDecisionStatus) => {
    // Show confirmation for reject and hire actions
    if (
      (status === "rejected" || status === "hired") &&
      showConfirmation !== status
    ) {
      setShowConfirmation(status);
      return;
    }

    setShowConfirmation(null);
    clearError();

    // Convert applicationId to string for API call
    const appIdString = String(applicationId);

    let result;
    if (status === "shortlisted") {
      result = await shortlistCandidate(jobId, appIdString);
    } else if (status === "rejected") {
      result = await rejectCandidate(jobId, appIdString);
    } else {
      result = await hireCandidate(jobId, appIdString);
    }

    if (result.data) {
      setLocalStatus(status);
      onDecisionUpdate?.(status);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(null);
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}

        {isUpdating ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <>
            <button
              onClick={() => handleDecision("shortlisted")}
              disabled={isUpdating || localStatus === "shortlisted"}
              className={`p-1.5 rounded-lg transition-colors ${
                localStatus === "shortlisted"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400 hover:bg-blue-50 hover:text-blue-600"
              }`}
              title="Shortlist"
            >
              <CheckCircle className="h-5 w-5" />
            </button>

            <button
              onClick={() => handleDecision("hired")}
              disabled={isUpdating || localStatus === "hired"}
              className={`p-1.5 rounded-lg transition-colors ${
                localStatus === "hired"
                  ? "bg-green-100 text-green-600"
                  : "text-gray-400 hover:bg-green-50 hover:text-green-600"
              }`}
              title="Hire"
            >
              <UserCheck className="h-5 w-5" />
            </button>

            <button
              onClick={() => handleDecision("rejected")}
              disabled={isUpdating || localStatus === "rejected"}
              className={`p-1.5 rounded-lg transition-colors ${
                localStatus === "rejected"
                  ? "bg-red-100 text-red-600"
                  : "text-gray-400 hover:bg-red-50 hover:text-red-600"
              }`}
              title="Reject"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    );
  }

  // Full variant with confirmation dialogs
  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Current Status Badge */}
      {localStatus && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          {localStatus === "shortlisted" && (
            <>
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>Shortlisted</span>
            </>
          )}
          {localStatus === "hired" && (
            <>
              <UserCheck className="h-4 w-4 text-green-600" />
              <span>Hired</span>
            </>
          )}
          {localStatus === "rejected" && (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Rejected</span>
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-900 mb-3">
            {showConfirmation === "rejected"
              ? "Are you sure you want to reject this candidate?"
              : "Are you sure you want to hire this candidate?"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDecision(showConfirmation)}
              disabled={isUpdating}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium"
            >
              {isUpdating ? "Processing..." : "Confirm"}
            </button>
            <button
              onClick={cancelConfirmation}
              disabled={isUpdating}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showConfirmation && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDecision("shortlisted")}
            disabled={isUpdating || localStatus === "shortlisted"}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              localStatus === "shortlisted"
                ? "bg-blue-100 text-blue-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            }`}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>Shortlist</span>
          </button>

          <button
            onClick={() => handleDecision("hired")}
            disabled={isUpdating || localStatus === "hired"}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              localStatus === "hired"
                ? "bg-green-100 text-green-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            }`}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserCheck className="h-5 w-5" />
            )}
            <span>Hire</span>
          </button>

          <button
            onClick={() => handleDecision("rejected")}
            disabled={isUpdating || localStatus === "rejected"}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
              localStatus === "rejected"
                ? "bg-red-100 text-red-600 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            }`}
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <span>Reject</span>
          </button>
        </div>
      )}
    </div>
  );
}
