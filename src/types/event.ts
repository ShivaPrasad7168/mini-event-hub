export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  max_participants: number;
  current_participants: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  date: string;
  max_participants: number;
  category?: string;
}
