export type NavigationItem = {
  label: string;
  href: string;
};

export type ProfileMenuItem = {
  label: string;
  href: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  unread?: boolean;
};
