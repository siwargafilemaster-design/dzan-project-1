// lib/settings.ts

import { supabase } from "@/lib/supabase"

interface Setting {
  key: string
  value: string | null
  category: string
  label: string
}

/**
 * Get single setting by key
 * 
 * Usage:
 *   const waNumber = await getSetting('whatsapp_sales')
 */
export async function getSetting(key: string): Promise<string> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single()
  
  if (error || !data) {
    console.warn(`Setting '${key}' not found`)
    return ""
  }
  
  return data.value || ""
}

/**
 * Get multiple settings by category
 * 
 * Usage:
 *   const contactSettings = await getSettingsByCategory('contact')
 */
export async function getSettingsByCategory(category: string): Promise<Setting[]> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, category, label")
    .eq("category", category)
    .order("sort_order", { ascending: true })
  
  if (error) {
    console.error(`Error fetching settings for category '${category}':`, error)
    return []
  }
  
  return data || []
}

/**
 * Get all settings (untuk admin page)
 * 
 * Usage:
 *   const allSettings = await getAllSettings()
 */
export async function getAllSettings(): Promise<Setting[]> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
  
  if (error) {
    console.error("Error fetching all settings:", error)
    return []
  }
  
  return data || []
}

/**
 * Get multiple settings by keys (batch fetch)
 * Returns object dengan key sebagai property
 * 
 * Usage:
 *   const s = await getSettingsByKeys(['whatsapp_sales', 'email_contact'])
 *   console.log(s.whatsapp_sales) // "+6282226585576"
 */
export async function getSettingsByKeys(keys: string[]): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys)
  
  if (error) {
    console.error("Error fetching settings by keys:", error)
    return {}
  }
  
  // Convert array → object { key: value }
  const result: Record<string, string> = {}
  data?.forEach((row) => {
    result[row.key] = row.value || ""
  })
  
  return result
}

/**
 * Format WhatsApp number untuk wa.me link
 * Strip semua karakter non-digit
 * 
 * Usage:
 *   const cleanNumber = formatWhatsApp('+6282226585576')
 *   // returns: '6282226585576'
 */
export function formatWhatsApp(number: string): string {
  return number.replace(/\D/g, "")
}

/**
 * Build wa.me URL dengan template message
 * 
 * Usage:
 *   const url = buildWhatsAppUrl('+6282226585576', 'Halo DZAN, saya tertarik dengan Batik Lawu')
 */
export function buildWhatsAppUrl(number: string, message: string): string {
  const cleanNumber = formatWhatsApp(number)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}