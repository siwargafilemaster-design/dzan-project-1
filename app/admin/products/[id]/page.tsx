import { createClient } from "@/lib/supabase-server"
import { redirect, notFound } from "next/navigation"
import EditProductForm from "./EditProductForm"

interface PageProps {
  params: Promise<{ id: string }>
}

const EditProductPage = async ({ params }: PageProps) => {
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
  
  // Fetch product by id
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()
  
  // Handle product not found
  if (error || !product) {
    notFound()
  }
  
  // Fetch active artisans (untuk dropdown)
  const { data: artisans } = await supabase
    .from("artisans")
    .select("id, name")
    .eq("is_active", true)
    .order("name")
  
  return (
    <EditProductForm 
      product={product} 
      artisans={artisans || []} 
    />
  )
}

export default EditProductPage