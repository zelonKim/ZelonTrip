import { Place } from "./Place";

export interface ItineraryItem {
  day: number | string;
  places: Place[];
}
