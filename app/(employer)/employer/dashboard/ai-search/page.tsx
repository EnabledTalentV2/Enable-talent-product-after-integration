"use client";

import React from "react";
import AIAgentSearchPanel from "@/components/employer/ai/AIAgentSearchPanel";

export default function AISearchPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900"><abbr title="Artificial Intelligence">AI</abbr> Candidate Search</h1>
        <p className="text-gray-600 mt-2">
          Use natural language to search for candidates. Describe what you&apos;re
          looking for and let our <abbr title="Artificial Intelligence">AI</abbr> find the best matches.
        </p>
      </div>

      <AIAgentSearchPanel />
    </div>
  );
}
