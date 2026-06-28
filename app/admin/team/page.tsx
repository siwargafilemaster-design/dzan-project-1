import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import TeamManager from "./TeamManager"
import type { UserProfile } from "@/lib/permissions"

export default async function TeamPage() {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  // Get viewer profile
  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  if (!viewerProfile) redirect("/login")
  
  // Permission: only super_admin or admin can access
  if (!["super_admin", "admin"].includes(viewerProfile.role)) {
    redirect("/admin")
  }
  
  // Fetch viewable users via helper function
  const { data: users, error } = await supabase.rpc("get_viewable_users", {
    viewer_id: user.id
  })
  
  if (error) {
    console.error("Error fetching users:", error)
  }
  
  return (
    <TeamManager 
      viewerProfile={viewerProfile as UserProfile}
      initialUsers={(users || []) as UserProfile[]}
    />
  )
}