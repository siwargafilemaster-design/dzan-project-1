// app/admin/bts/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { getSetting } from "@/lib/settings"
import BTSRedirectClient from "./BTSRedirectClient"

export default async function BTSPage() {
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
  
  if (!profile || profile.role === "buyer") {
    redirect("/account")
  }
  
  // Only super_admin OR admin/creative can access BTS
  const canAccess = 
    profile.role === "super_admin" ||
    (profile.role === "admin" && profile.role_scope === "creative")
  
  if (!canAccess) {
    redirect("/admin")
  }
  
  // Fetch Instagram handle from settings (with fallback)
  const instagramHandle = await getSetting("instagram_handle") || "dzanlawuheritage"
  
  return <BTSRedirectClient instagramHandle={instagramHandle} />
}