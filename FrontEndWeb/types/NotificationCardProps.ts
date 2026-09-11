import { NotificationItem } from "./NotificationItem";

export interface NotificationCardProps {
  item: NotificationItem;
  theme?: string;
  styles?: Record<string, string>;
  onPressItem: (planId?: number | string) => void;
}
