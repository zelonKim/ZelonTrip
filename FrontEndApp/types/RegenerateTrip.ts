export interface RegenerateTripResponse {
  id: number;
  location: string;
  title: string;
  overview: string;
  custom_tips: string[];
  itinerary: Record<string, any>[];
  message: string;
}
