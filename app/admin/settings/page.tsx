// app/admin/settings/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import SettingsManager from "./SettingsManager"

interface SettingRow {
  id: number
  key: string
  value: string | null
  category: string
  label: string
  description: string | null
  field_type: string
  sort_order: number
  is_required: boolean
}

const SettingsPage = async () => {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  // Permission: SUPER ADMIN ONLY (settings sensitive)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  
  if (!profile || profile.role !== "super_admin") {
    redirect("/admin")
  }
  
  // Fetch all settings
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
  
  if (error) {
    console.error("Error loading settings:", error)
    return (
      <main className="bg-dzan-cream min-h-screen pt-28 px-6">
        <p className="text-sm text-red-600">Gagal memuat settings.</p>
      </main>
    )
  }
  
  return <SettingsManager initialSettings={settings as SettingRow[] || []} />
}

export default SettingsPage