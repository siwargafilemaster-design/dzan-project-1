// app/admin/artisans/new/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import NewArtisanForm from "./NewArtisanForm"

const NewArtisanPage = async () => {
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
  
  if (!profile || (profile.role !== "super_admin" && profile.role_scope !== "product")) {
    redirect("/admin")
  }
  
  return <NewArtisanForm />
}

export default NewArtisanPage