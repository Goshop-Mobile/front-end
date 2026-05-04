// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  user_id: string;
  role: 'admin' | 'moderator';
  full_name: string;
  email?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  active_orders: number;
  drivers_online: number;
  total_users: number;
  total_drivers: number;
  verified_drivers: number;
  orders_today: number;
  revenue_today: number;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'client' | 'driver' | 'admin' | 'moderator';
  phone_verified: boolean;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
}

// ─── Drivers ─────────────────────────────────────────────────────────────────
export type DriverStatus = 'unverified' | 'pending_review' | 'verified' | 'suspended';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type DocumentType =
  | 'id_card_front'
  | 'selfie_with_id'
  | 'profile_photo'
  | 'vehicle_photo'
  | 'license_plate';

export interface DriverDocument {
  id: string;
  doc_type: DocumentType;
  status: DocumentStatus;
  cloudinary_url: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  status: DriverStatus;
  credits: number;
  referral_code: string;
  vehicle_description: string | null;
  is_online: boolean;
  total_deliveries: number;
  average_rating: number;
  rating_count: number;
  created_at: string;
  documents?: DriverDocument[];
  user?: User;
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export type OrderType = 'delivery' | 'courses';
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'pickup'
  | 'collected'
  | 'in_progress'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  order_type: OrderType;
  status: OrderStatus;
  client_id: string;
  driver_id: string | null;
  vehicle_type_id: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string | null;
  dropoff_latitude: number;
  dropoff_longitude: number;
  dropoff_address: string | null;
  distance_km: number | null;
  total_price: number | null;
  created_at: string;
  client?: User;
}

// ─── Vehicles ────────────────────────────────────────────────────────────────
export interface VehicleType {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  price_per_km: number;
  is_active: boolean;
}

// ─── Ads ─────────────────────────────────────────────────────────────────────
export type AdStatus = 'active' | 'scheduled' | 'expired' | 'paused';

export interface Ad {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  status: AdStatus;
  display_duration_seconds: number;
  send_push: boolean;
  push_sent: boolean;
  view_count: number;
  click_count: number;
  scheduled_at: string | null;
  expires_at: string | null;
  created_at: string;
}

// ─── Referrals ────────────────────────────────────────────────────────────────
export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  credits_awarded: number;
  created_at: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────
export interface AppConfig {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ─── Chart data ───────────────────────────────────────────────────────────────
export interface ChartPoint {
  label: string;
  value: number;
  value2?: number;
}
