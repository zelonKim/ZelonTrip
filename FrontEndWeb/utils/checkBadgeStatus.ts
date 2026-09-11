import { Dispatch, SetStateAction } from "react";

export const checkBadgeStatus = (
  setHasNewNotification: Dispatch<SetStateAction<boolean>>,
) => {
  const existingData = localStorage.getItem("zelontrip_notifications");
  if (existingData) {
    const list = JSON.parse(existingData);
    if (list.length > 0) setHasNewNotification(true);
  }
};
