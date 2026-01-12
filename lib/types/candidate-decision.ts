/**
 * Types for employer candidate selection/decision making
 */

export type CandidateDecisionStatus = "shortlisted" | "rejected" | "hired";

export interface CandidateDecisionRequest {
  status: CandidateDecisionStatus;
}

export interface CandidateDecisionResponse {
  message?: string;
  status: CandidateDecisionStatus;
  application_id: string | number;
  job_id: string | number;
}

export interface DecisionActionParams {
  jobId: string;
  applicationId: string;
  status: CandidateDecisionStatus;
}
