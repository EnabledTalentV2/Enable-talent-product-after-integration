"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAIAgentSearch } from "@/lib/hooks/useAIAgentSearch";

const EXAMPLE_QUERIES = [
  "Find candidates with 5+ years of Python and Django experience",
  "Looking for React developers who know TypeScript",
  "Need senior software engineers with cloud experience (AWS or Azure)",
  "Find UX designers with Figma and user research skills",
  "Looking for data scientists experienced in machine learning",
];

export default function AIAgentSearchPanel() {
  const router = useRouter();
  const {
    isSearching,
    searchResults,
    searchHistory,
    error,
    searchCandidates,
    clearResults,
    clearError,
  } = useAIAgentSearch();

  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    await searchCandidates(query.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  const handleCandidateClick = (candidateSlug: string) => {
    router.push(`/employer/dashboard/candidates/profile/${candidateSlug}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>🤖</span>
          <span><abbr title="Artificial Intelligence">AI</abbr> Candidate Search</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Search for candidates using natural language. Describe what you&apos;re
          looking for and let <abbr title="Artificial Intelligence">AI</abbr> find the best matches.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="E.g., Find candidates with 5+ years of Python and Django experience..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isSearching}
          />
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSearching || !query.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Example Queries */}
      {!searchResults && !isSearching && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Try these examples:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !searchResults && !isSearching && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Recent searches:
          </p>
          <div className="space-y-2">
            {searchHistory.slice(0, 5).map((historyQuery, index) => (
              <button
                key={index}
                onClick={() => setQuery(historyQuery)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🕒 {historyQuery}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-2">
            <span className="text-red-800 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-800 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-pulse space-y-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <p className="mt-6 text-gray-600">
            AI is searching for candidates...
          </p>
        </div>
      )}

      {/* Search Results */}
      {searchResults && !isSearching && (
        <div className="space-y-6">
          {/* AI Reasoning */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  AI Reasoning
                </p>
                <p className="text-sm text-blue-800">
                  {searchResults.results.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {searchResults.results.candidates.length} candidate
              {searchResults.results.candidates.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={clearResults}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              New Search
            </button>
          </div>

          {/* Candidates List */}
          {searchResults.results.candidates.length > 0 ? (
            <div className="space-y-3">
              {searchResults.results.candidates.map((candidate) => (
                <button
                  type="button"
                  key={candidate.id}
                  className="w-full border border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
                  onClick={() => handleCandidateClick(candidate.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {candidate.avatarUrl && (
                          <img
                            src={candidate.avatarUrl}
                            alt={candidate.name}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {candidate.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>📍 {candidate.location}</span>
                        <span>💼 {candidate.experience}</span>
                      </div>
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {candidate.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                              +{candidate.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {candidate.matchPercentage && (
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-green-900">
                          {candidate.matchPercentage}%
                        </div>
                        <div className="text-xs text-slate-700">match</div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Candidates Found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or try a different query.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
