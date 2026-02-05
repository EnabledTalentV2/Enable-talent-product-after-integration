export type CandidateJobInviteStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "declined"
  | "Declined";

export type CandidateJobInvite = {
  job_id: number;
  job_title: string;
  company: string;
  status: CandidateJobInviteStatus;
  sent_at: string;
  token: string;
};

// Backend expects "decline" for reject action.
export type InviteResponseAction = "accept" | "decline";

export type InviteResponsePayload = {
  token: string;
  action: InviteResponseAction;
};

export type InviteResponse = {
  detail: string;
};
