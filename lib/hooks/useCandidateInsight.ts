import { useQuery } from "@tanstack/react-query";
import { candidateInsightsAPI } from "@/lib/services/candidateInsightsAPI";

export const candidateInsightKeys = {
  all: ["candidate-insight"] as const,
  detail: (candidateId: string | number) =>
    [...candidateInsightKeys.all, "detail", candidateId] as const,
};

export function useCandidateInsight(candidateId?: string | number) {
  return useQuery({
    queryKey: candidateInsightKeys.detail(candidateId ?? "unknown"),
    queryFn: () => candidateInsightsAPI.get(candidateId as string | number),
    enabled: Boolean(candidateId),
    staleTime: 5 * 60 * 1000,
  });
}
