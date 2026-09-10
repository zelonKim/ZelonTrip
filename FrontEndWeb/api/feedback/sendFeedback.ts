import { FeedbackResponse } from "@/types/Feedback";
import { client } from "../client";

export const sendFeedback = async (content: string) => {
  const response = await client.post<FeedbackResponse>("/v1/user/feedback", {
    content,
  });
  return response.data;
};
