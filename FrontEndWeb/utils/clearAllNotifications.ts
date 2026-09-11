import { NotificationItem } from "@/types/NotificationItem";
import { Dispatch, SetStateAction } from "react";

export const clearAllNotifications = (
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>,
) => {
  if (window.confirm("모든 알림을 삭제하시겠습니까?")) {
    setNotifications([]);
    localStorage.removeItem("zelontrip_notifications");
  }
};
