import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import InquiriesManager from "./InquiriesManager"

export default async function InquiriesPage() {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  // Get viewer profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, role_scope")
    .eq("id", user.id)
    .single()
  
  if (!profile) redirect("/login")
  
  // Permission: super_admin OR admin/sales
  const hasAccess = 
    profile.role === "super_admin" ||
    (profile.role === "admin" && profile.role_scope === "sales")
  
  if (!hasAccess) {
    redirect("/admin")
  }
  
  // Fetch all inquiries (RLS handles filtering)
  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching inquiries:", error)
  }
  
  return (
    <InquiriesManager 
      initialInquiries={inquiries || []}
      viewerRole={profile.role}
    />
  )
}