import { generateTrip } from "@/api/trip/generateTrip";
import { TripGenerateResponse } from "@/types/TripGenerate";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const invalidateTrip = (id: number) => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["tripList"] });
  queryClient.invalidateQueries({ queryKey: ["tripDetail", id] });
  queryClient.invalidateQueries({ queryKey: ["userTripStats"] });
  queryClient.invalidateQueries({ queryKey: ["tripRecommend"] });
};

export const useGenerateTrip = (options?: {
  onSuccess?: (res: TripGenerateResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: generateTrip,
    onSuccess: (res) => {
      invalidateTrip(res.id);
      options?.onSuccess?.(res);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};
