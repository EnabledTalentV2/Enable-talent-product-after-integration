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
  application_id: string;
  job_id: string;
}

export interface DecisionActionParams {
  jobId: string;
  applicationId: string;
  status: CandidateDecisionStatus;
}
