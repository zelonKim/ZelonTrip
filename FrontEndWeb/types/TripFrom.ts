import { MBTI } from "@/constants/options";

export interface TripFormData {
  location: string;
  days: number;
  mbti: MBTI;
  tripStyle: string;
  tendency: string;
  asking: string;
  companion: string;
  transportation: string;
  pace: number;
  selectedTags: string[];
}
