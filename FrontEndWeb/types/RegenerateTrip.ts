import { ItineraryItem } from "./ItineraryItem";

export interface RegenerateTripResponse {
  id: number;
  location: string;
  title: string;
  overview: string;
  custom_tips: string[];
  itinerary: ItineraryItem;
  message: string;
}
