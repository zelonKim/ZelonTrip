import { NotificationItem } from "@/types/NotificationItem";
import { Dispatch, SetStateAction } from "react";

export const deleteNotification = (
  e: React.MouseEvent,
  id: string | number,
  notifications: NotificationItem[],
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>,
) => {
  e.stopPropagation();
  const updatedList = notifications.filter((item) => item.id !== id);
  setNotifications(updatedList);
  localStorage.setItem("zelontrip_notifications", JSON.stringify(updatedList));
};
