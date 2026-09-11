export interface RecommendTripParams {
  hasHistory: boolean | null;
  coords?: { latitude: number; longitude: number } | null;
}
