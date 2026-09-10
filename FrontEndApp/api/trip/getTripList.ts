import { client } from "../client";

export const getTripList = async () => {
  const response = await client.get("/v1/trip/list");
  return response.data;
};
