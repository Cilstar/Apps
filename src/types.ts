export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'worker' | 'admin';
  workerProfile?: WorkerProfile;
}

export interface WorkerProfile {
  id: number;
  user_id: number;
  category: string;
  experience_years: number;
  bio: string;
  profile_photo: string;
  hourly_rate: number;
  latitude: number;
  longitude: number;
  is_verified: boolean;
  is_available: boolean;
  avg_rating?: number;
  name?: string; // From join
  phone?: string; // From join
}

export interface JobRequest {
  id: number;
  customer_id: number;
  worker_id: number;
  service_type: string;
  description: string;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  latitude: number;
  longitude: number;
  created_at: string;
  worker_name?: string;
  customer_name?: string;
  customer_phone?: string;
  category?: string;
}

export type ServiceCategory = 'Plumbing' | 'Electrical' | 'Carpentry' | 'Cleaning' | 'Painting' | 'Technician';

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Cleaning',
  'Painting',
  'Technician'
];
