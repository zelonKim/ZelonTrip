import { client } from "../client";
import { NoticeDetail } from "../../types/NoticeDetail";

export const getNoticeDetail = async (
  id: string | number | string[] | undefined,
): Promise<NoticeDetail> => {
  const response = await client.get<NoticeDetail>(`/v1/notice/${id}`);
  return response.data;
};
