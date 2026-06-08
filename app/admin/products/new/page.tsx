import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import NewProductForm from "./NewProductForm"

const NewProductPage = async () => {
  const supabase = await createClient()
  
  // Auth check di server
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
  
  // Fetch artisans di server (always fresh)
  const { data: artisans } = await supabase
    .from("artisans")
    .select("id, name")
    .eq("is_active", true)
    .order("name")
  
  return <NewProductForm artisans={artisans || []} />
}

export default NewProductPage