import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateInvitesAPI } from "@/lib/services/candidateInvitesAPI";
import type {
  CandidateJobInvite,
  InviteResponse,
  InviteResponsePayload,
} from "@/lib/types/candidate-invites";
import { candidateJobsKeys } from "@/lib/hooks/useCandidateJobs";

export const candidateInvitesKeys = {
  all: ["candidate-invites"] as const,
};

export function useCandidateInvites() {
  return useQuery<CandidateJobInvite[]>({
    queryKey: candidateInvitesKeys.all,
    queryFn: candidateInvitesAPI.list,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useRespondToInvite() {
  const queryClient = useQueryClient();

  return useMutation<InviteResponse, unknown, InviteResponsePayload>({
    mutationFn: (payload) => candidateInvitesAPI.respond(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateInvitesKeys.all });
      queryClient.invalidateQueries({ queryKey: candidateJobsKeys.applications() });
      queryClient.invalidateQueries({ queryKey: candidateJobsKeys.browse() });
    },
  });
}
