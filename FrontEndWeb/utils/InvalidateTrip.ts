import { QueryClient } from "@tanstack/react-query";

export const invalidateTrip = (
  queryClient: QueryClient,
  id?: number | string,
) => {
  queryClient.invalidateQueries({ queryKey: ["tripList"] });
  if (id) {
    queryClient.invalidateQueries({ queryKey: ["tripDetail", id] });
  }
  queryClient.invalidateQueries({ queryKey: ["userTripStats"] });
};
