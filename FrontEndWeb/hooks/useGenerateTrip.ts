import { generateTrip } from "@/api/trip/generateTrip";
import { TripGenerateResponse } from "@/types/TripGenerate";
import { invalidateTrip } from "@/utils/InvalidateTrip";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGenerateTrip = (options?: {
  onSuccess?: (res: TripGenerateResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateTrip,
    onSuccess: (res) => {
      invalidateTrip(queryClient, res.id);
      options?.onSuccess?.(res);
    },
    onError: (error) => {
      options?.onError?.(error);
      window.alert("일정 생성 중 문제가 발생했습니다. 다시 시도해 주세요.");
    },
  });
};
