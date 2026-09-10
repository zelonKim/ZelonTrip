import { client } from "../client";
import { Notice } from "../../types/Notice";

export const getNotices = async (): Promise<Notice[]> => {
  const response = await client.get("/v1/notice");
  return response.data;
};
