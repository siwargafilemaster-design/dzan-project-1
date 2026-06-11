// app/admin/artisans/[id]/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect, notFound } from "next/navigation"
import EditArtisanForm from "./EditArtisanForm"

interface PageProps {
  params: Promise<{ id: string }>
}

const EditArtisanPage = async ({ params }: PageProps) => {
  const { id } = await params
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
  
  // Cek apakah super admin (untuk delete capability)
  const isSuperAdmin = profile.role === "super_admin"
  
  // Fetch artisan by id
  const { data: artisan, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", id)
    .single()
  
  if (error || !artisan) {
    notFound()
  }
  
  // Count products yang link ke artisan ini (untuk info)
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("artisan_id", id)
  
return (
    <EditArtisanForm 
      artisan={artisan} 
      productCount={productCount || 0}
      isSuperAdmin={isSuperAdmin}
    />
  )
}

export default EditArtisanPage