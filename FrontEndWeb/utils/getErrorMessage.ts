import { ApiErrorResponse } from "@/types/ApiError";
import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallbackMessage = "오류가 발생했습니다."): string => {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ApiErrorResponse | undefined;
    return errorData?.detail || fallbackMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};