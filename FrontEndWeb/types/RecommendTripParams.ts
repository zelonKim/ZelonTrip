export interface RecommendTripParams {
  hasHistory: boolean;
  coords?: { latitude: number; longitude: number } | null;
}
