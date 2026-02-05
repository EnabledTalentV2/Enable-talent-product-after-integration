import { apiRequest } from "@/lib/api-client";
import type {
  CandidateJobInvite,
  InviteResponse,
  InviteResponsePayload,
} from "@/lib/types/candidate-invites";

export const candidateInvitesAPI = {
  list: async (): Promise<CandidateJobInvite[]> => {
    const response = await apiRequest<CandidateJobInvite[]>(
      "/api/candidates/job-invites",
      { method: "GET" }
    );
    return Array.isArray(response) ? response : [];
  },
  respond: async (payload: InviteResponsePayload): Promise<InviteResponse> => {
    return apiRequest<InviteResponse>("/api/candidates/job-invites/respond", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
