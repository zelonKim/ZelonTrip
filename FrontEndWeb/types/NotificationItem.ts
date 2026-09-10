export interface NotificationItem {
  id: number | string;
  title: string;
  body: string;
  date: string;
  planId?: number | string | null;
}
