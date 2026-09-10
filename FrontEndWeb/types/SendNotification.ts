export interface SendNotificationPayload {
  pushToken: string;
  deviceId: string;
  planId?: number;
  location: string;
}
