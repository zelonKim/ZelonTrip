export interface TripRecommendResponse {
  id: number;
  title: string;
  category: string;
  tag: string;
  rating: number;
  distance?: string;
  imageUrl: string;
}
