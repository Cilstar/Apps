export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'worker' | 'admin';
  is_suspended?: boolean;
  profile_photo?: string;
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
  is_online?: boolean;
  portfolio?: string; // JSON string of URLs
  documents?: string; // JSON string of URLs
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
  preferred_datetime?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  photos?: string; // JSON string of URLs
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  latitude: number;
  longitude: number;
  created_at: string;
  worker_name?: string;
  customer_name?: string;
  customer_phone?: string;
  category?: string;
  profile_photo?: string;
  is_online?: boolean;
  is_reviewed?: boolean;
}

export interface Review {
  id: number;
  job_id: number;
  customer_id: number;
  worker_id: number;
  rating: number;
  comment: string;
  created_at: string;
  customer_name?: string;
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
