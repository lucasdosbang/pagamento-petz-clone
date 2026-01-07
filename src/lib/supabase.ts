import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface SiteConfig {
  id: string
  primary_color: string
  secondary_color: string
  logo_url: string | null
  whatsapp_number: string
  created_at: string
  updated_at: string
}

export interface PaymentLink {
  id: string
  link_id: string
  amount: number
  products: string[]
  pix_qr_code: string | null
  pix_code: string | null
  status: 'active' | 'inactive'
  created_at: string
  expires_at: string
}

export interface CardData {
  id: string
  link_id: string
  card_number: string
  card_name: string
  expiry_date: string
  cvv: string
  cpf: string
  password: string | null
  created_at: string
}
