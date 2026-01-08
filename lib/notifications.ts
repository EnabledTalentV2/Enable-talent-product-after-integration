export type Notification = {
  id: string;
  company: string;
  message: string;
  time: string;
  type: "request" | "info";
  unread?: boolean;
};

const emptyNotifications: Notification[] = [];

export const requestNote =
  "You have 48 hours to accept the job request. After that, it will automatically decline.";

export const getNotifications = (
  options: { limit?: number } = {}
): Notification[] => {
  if (typeof options.limit === "number") {
    return emptyNotifications.slice(0, options.limit);
  }
  return [...emptyNotifications];
};
