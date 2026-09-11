export interface Place {
  place_name: string;
  latitude: string | number;
  longitude: string | number;
  description?: string;
  address?: string;
  proposed_reason?: string;
}
