export interface UserProfileResponse {
  id: number;
  username: string;
  nickname: string | null;
  is_active: boolean;
  created_at: string; 
}