// app/admin/media/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import MediaForm from "./MediaForm"

const AdminMediaPage = async () => {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  // Permission check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, role_scope")
    .eq("id", user.id)
    .single()
  
  // Hero video bisa diakses oleh:
  // - super_admin
  // - admin dengan role_scope = 'creative' (Mas Danang)
  // - admin dengan role_scope = 'all'
  const allowedScopes = ["creative", "all", "product"]
  if (
    !profile || 
    (profile.role !== "super_admin" && !allowedScopes.includes(profile.role_scope))
  ) {
    redirect("/admin")
  }
  
  // Fetch hero_setting (1 row)
  const { data: heroSetting, error } = await supabase
    .from("hero_setting")
    .select("*")
    .limit(1)
    .single()
  
  if (error || !heroSetting) {
    // Edge case: tabel kosong
    return (
      <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
        <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
          Hero Video
        </h1>
        <p className="text-xs text-red-600 italic mt-4">
          Hero setting belum tersedia di database. Hubungi super admin.
        </p>
      </main>
    )
  }
  
  return <MediaForm heroSetting={heroSetting} />
}

export default AdminMediaPage