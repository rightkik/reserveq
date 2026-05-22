export type Plan = 'trial' | 'free' | 'pro'

export type ReservationStatus = 'pending' | 'confirmed' | 'arrived' | 'cancelled' | 'no_show'

export interface Profile {
  id: string
  full_name: string | null
  shop_name: string
  phone: string | null
  plan: Plan
  trial_ends_at: string
  shop_open_time: string
  shop_close_time: string
  logo_url: string | null
  last_login: string | null
  created_at: string
}

export interface Reservation {
  id: string
  owner_id: string
  customer_name: string
  customer_phone: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  duration_minutes: number
  status: ReservationStatus
  note: string | null
  source: string
  created_at: string
  updated_at: string
}

export type ReservationInsert = Omit<Reservation, 'id' | 'owner_id' | 'created_at' | 'updated_at'>

export type ReservationUpdate = Partial<ReservationInsert>
