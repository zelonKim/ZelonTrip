import { client } from "../client";

export const deactivateUser = async () => {
  const response = await client.patch("/v1/auth/deactivate");
  return response.data;
};
