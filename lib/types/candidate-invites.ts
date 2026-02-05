export type CandidateJobInviteStatus = "pending" | "accepted" | "rejected";

export type CandidateJobInvite = {
  job_id: number;
  job_title: string;
  company: string;
  status: CandidateJobInviteStatus;
  sent_at: string;
  token: string;
};

export type InviteResponseAction = "accept" | "reject";

export type InviteResponsePayload = {
  token: string;
  action: InviteResponseAction;
};

export type InviteResponse = {
  detail: string;
};
