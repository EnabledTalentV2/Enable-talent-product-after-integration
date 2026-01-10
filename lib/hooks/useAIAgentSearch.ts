"use client";

import { useCallback, useState } from "react";
import {
  apiRequest,
  getApiErrorMessage,
  type ApiResult,
} from "@/lib/api-client";
import type {
  AgentSearchQuery,
  AgentSearchResponse,
} from "@/lib/types/ai-features";

export function useAIAgentSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] =
    useState<AgentSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  /**
   * Search for candidates using AI agent with natural language query
   */
  const searchCandidates = useCallback(
    async (query: string): Promise<ApiResult<AgentSearchResponse>> => {
      if (!query.trim()) {
        setError("Please enter a search query");
        return { data: null, error: "Please enter a search query" };
      }

      setIsSearching(true);
      setError(null);

      try {
        const payload: AgentSearchQuery = { query: query.trim() };

        const response = await apiRequest<AgentSearchResponse>(
          "/api/agent/search",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        console.log("[useAIAgentSearch] Search results:", response);

        setSearchResults(response);

        // Add to search history (max 10 items)
        setSearchHistory((prev) => {
          const updated = [query.trim(), ...prev.filter((q) => q !== query.trim())];
          return updated.slice(0, 10);
        });

        return { data: response, error: null };
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to search candidates. Please try again."
        );
        setError(errorMessage);
        setSearchResults(null);
        return { data: null, error: errorMessage };
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setSearchResults(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => setSearchHistory([]), []);

  return {
    isSearching,
    searchResults,
    searchHistory,
    error,
    searchCandidates,
    clearResults,
    clearError,
    clearHistory,
  };
}
