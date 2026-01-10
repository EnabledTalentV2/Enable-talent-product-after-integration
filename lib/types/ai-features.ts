/**
 * TypeScript types for AI-powered features in the employer dashboard
 */

import { CandidateProfile } from "./candidates";

// ============================================================================
// AI Candidate Ranking Types
// ============================================================================

export interface RankedCandidate {
  candidate_id: number;
  candidate_slug?: string; // Slug for navigation (if backend provides it)
  score: number; // 0.0 to 1.0 (will be displayed as percentage)
  match_reason: string;
}

export type RankingStatus = "ranking" | "completed" | "failed" | "not_started";

export interface TriggerRankingResponse {
  message: string;
  ranking_status: RankingStatus;
  task_id?: string;
}

export interface RankingDataResponse {
  ranked_candidates: RankedCandidate[];
  ranking_status?: RankingStatus;
}

// ============================================================================
// AI Agent Search Types
// ============================================================================

export interface AgentSearchQuery {
  query: string;
}

export interface AgentSearchResponse {
  results: {
    candidates: CandidateProfile[];
    reasoning: string;
  };
}

// ============================================================================
// Resume Chat AI Types
// ============================================================================

export interface ResumeChatMessage {
  input_text: string;
  resume_slug: string;
  thread_id: string | null;
}

export interface ResumeChatResponse {
  output: string;
  thread_id: string;
  resume_slug?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface AIFeatureState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
