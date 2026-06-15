// app/admin/photo-upload/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

const PhotoUploadRedirectPage = async () => {
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
  
  // Fetch produk pertama
  const { data: firstProduct } = await supabase
    .from("products")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .single()
  
  // Edge case: belum ada produk
  if (!firstProduct) {
    return (
      <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
        <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
          Photo Upload
        </h1>
        <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-5 mt-6">
          <p className="text-sm text-dzan-stone leading-relaxed">
            Belum ada produk untuk dikelola fotonya. 
            Tambah produk dulu untuk mulai upload foto.
          </p>
          <a 
            href="/admin/products/new"
            className="inline-block mt-4 bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
          >
            Buat Produk Baru
          </a>
        </div>
      </main>
    )
  }
  
  // Redirect ke produk pertama
  redirect(`/admin/products/${firstProduct.id}/photos`)
}

export default PhotoUploadRedirectPage