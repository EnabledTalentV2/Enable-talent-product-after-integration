import { apiRequest } from "@/lib/api-client";

export type InviteResponse = {
  detail: string;
};

const toCandidateId = (candidateId: string | number) => {
  if (typeof candidateId === "number") return candidateId;
  const parsed = Number(candidateId);
  return Number.isFinite(parsed) ? parsed : candidateId;
};

export const invitesAPI = {
  sendJobInvite: async (
    jobId: string | number,
    candidateId: string | number
  ): Promise<InviteResponse> => {
    return apiRequest<InviteResponse>(
      `/api/organization/jobs/${jobId}/invite`,
      {
        method: "POST",
        body: JSON.stringify({ candidate_id: toCandidateId(candidateId) }),
      }
    );
  },
};
