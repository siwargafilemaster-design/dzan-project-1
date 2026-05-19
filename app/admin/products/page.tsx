import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

const AdminProductsPage = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, role_scope")
    .eq("id", user.id)
    .single()

  if (!profile || (profile.role !== "super_admin" && profile.role_scope !== "product")) {
    redirect("/admin")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <main className="bg-dzan-cream min-h-screen pt-16 pb-20 px-6">
      <div className="py-6 flex items-center justify-between">
        <Link href="/admin" className="text-xs text-dzan-stone">
          ← Dashboard
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
        Products
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        {products?.length || 0} products in catalog
      </p>

      <Link
        href="/admin/products/new"
        className="block w-full bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase text-center py-3 rounded-sm mb-6"
      >
        + Add New Product
      </Link>

      <div className="space-y-3">
        {products?.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="bg-white rounded-sm p-3 flex items-center gap-3"
          >
            <div className="relative w-16 h-16 bg-dzan-warm rounded-sm overflow-hidden flex-shrink-0">
              {p.image_url && (
                <Image
                  src={p.image_url}
                  alt={p.name_en}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-cormorant text-base text-dzan-earth">
                {p.name_en}
              </p>
              <p className="text-[10px] uppercase tracking-[1px] text-dzan-stone">
                {p.category} · ${p.price_usd}
              </p>
              {p.is_featured && (
                <span className="inline-block text-[8px] uppercase tracking-[1px] bg-dzan-amber text-dzan-earth px-2 py-0.5 rounded-sm mt-1">
                  Featured
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default AdminProductsPage