"use client";

import { useCallback, useState } from "react";
import {
  apiRequest,
  getApiErrorMessage,
  type ApiResult,
} from "@/lib/api-client";
import type {
  ResumeChatMessage,
  ResumeChatResponse,
  ChatMessage,
} from "@/lib/types/ai-features";

export function useResumeChat(resumeSlug: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /**
   * Send a message to the AI about the candidate's resume
   */
  const sendMessage = useCallback(
    async (inputText: string): Promise<ApiResult<ResumeChatResponse>> => {
      if (!inputText.trim()) {
        setError("Please enter a message");
        return { data: null, error: "Please enter a message" };
      }

      setIsLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: inputText.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const payload: ResumeChatMessage = {
          input_text: inputText.trim(),
          resume_slug: resumeSlug,
          thread_id: threadId,
        };

        const response = await apiRequest<ResumeChatResponse>(
          "/api/candidates/prompt/",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        console.log("[useResumeChat] AI response:", response);

        // Update thread ID if new
        if (response.thread_id && response.thread_id !== threadId) {
          setThreadId(response.thread_id);
        }

        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: response.output,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        return { data: response, error: null };
      } catch (err) {
        const errorMessage = getApiErrorMessage(
          err,
          "Failed to get AI response. Please try again."
        );
        setError(errorMessage);

        // Add error message to chat
        const errorChatMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);

        return { data: null, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [resumeSlug, threadId]
  );

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setThreadId(null);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Load chat history from storage (if needed)
   */
  const loadChatHistory = useCallback((savedMessages: ChatMessage[], savedThreadId: string | null) => {
    setMessages(savedMessages);
    setThreadId(savedThreadId);
  }, []);

  return {
    isLoading,
    error,
    messages,
    threadId,
    sendMessage,
    clearChat,
    clearError,
    loadChatHistory,
  };
}
