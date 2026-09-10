import { COMPANION, MBTI, TRANSPORT } from "@/constants/options";

export interface TripGenerateRequest {
  location: string;
  days: number;
  mbti: MBTI;
  tripStyle: string;
  tendency: string;
  companion: COMPANION;
  transportation: TRANSPORT;
  pace: number;
  asking?: string;
}

/////////////////////////////////////////

export interface DestinationDetail {
  place_name: string;
  description: string;
  proposed_reason: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface DailyItinerary {
  day: number;
  places: DestinationDetail[];
}

export interface TripGenerateResponse {
  id: number | string;
  title: string;
  overview: string;
  custom_tips: string[];
  itinerary: DailyItinerary[];
}
