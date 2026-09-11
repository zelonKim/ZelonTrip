import { ItineraryItem } from "./ItineraryItem";

export interface TripListElement {
  id: number;
  location: string;
  title: string;
  overview: string;
  itinerary: ItineraryItem[];
}

export interface TripListResponse {
  trips: TripListElement[];
}
