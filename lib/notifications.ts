export type Notification = {
  id: string;
  company: string;
  message: string;
  time: string;
  type: "request" | "info";
  unread?: boolean;
};

// Temporary mock notifications until backend wiring is ready.
const mockNotifications: Notification[] = [
  {
    id: "meta-invite",
    company: "Meta",
    message:
      "Recruiter from Meta sent an invitation request for a matching job",
    time: "3 minutes ago",
    type: "request",
    unread: true,
  },
  {
    id: "amazon-invite",
    company: "Amazon",
    message:
      "Recruiter from Amazon sent an invitation request for a matching job",
    time: "5 minutes ago",
    type: "request",
    unread: true,
  },
  {
    id: "google-view",
    company: "Google",
    message: "Talent recruiter from Google viewed your profile",
    time: "10 minutes ago",
    type: "info",
  },
  {
    id: "amazon-update-1",
    company: "Amazon",
    message:
      "Recruiter from Amazon sent an invitation request for a matching job",
    time: "5 minutes ago",
    type: "info",
  },
  {
    id: "amazon-update-2",
    company: "Amazon",
    message:
      "Recruiter from Amazon sent an invitation request for a matching job",
    time: "5 minutes ago",
    type: "info",
  },
  {
    id: "amazon-update-3",
    company: "Amazon",
    message:
      "Recruiter from Amazon sent an invitation request for a matching job",
    time: "5 minutes ago",
    type: "info",
  },
];

export const requestNote =
  "You have 48 hours to accept the job request. After that, it will automatically decline.";

export const getNotifications = (
  options: { limit?: number } = {}
): Notification[] => {
  if (typeof options.limit === "number") {
    return mockNotifications.slice(0, options.limit);
  }
  return [...mockNotifications];
};
