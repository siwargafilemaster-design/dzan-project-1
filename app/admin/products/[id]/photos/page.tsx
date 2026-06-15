// app/admin/products/[id]/photos/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect, notFound } from "next/navigation"
import PhotosManager from "./PhotosManager"

interface PageProps {
  params: Promise<{ id: string }>
}

const ProductPhotosPage = async ({ params }: PageProps) => {
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
  
  const allowedScopes = ["product", "creative", "all"]
  if (
    !profile || 
    (profile.role !== "super_admin" && !allowedScopes.includes(profile.role_scope))
  ) {
    redirect("/admin")
  }
  
  // Fetch product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name_en, name_id, image_url")
    .eq("id", id)
    .single()
  
  if (productError || !product) {
    notFound()
  }
  
  // Fetch all products untuk dropdown switcher
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name_en")
    .order("name_en")
  
  // Fetch existing photos untuk produk ini
  const { data: existingPhotos } = await supabase
    .from("product_photos")
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true })
  
  return (
    <PhotosManager 
      product={product}
      allProducts={allProducts || []}
      existingPhotos={existingPhotos || []}
    />
  )
}

export default ProductPhotosPage