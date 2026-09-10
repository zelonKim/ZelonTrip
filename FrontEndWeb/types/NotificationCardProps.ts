import { NotificationItem } from "./NotificationItem";

export interface NotificationCardProps {
  item: NotificationItem;
  theme: any;
  styles: any;
  onPressItem: (planId?: number | string) => void;
}
