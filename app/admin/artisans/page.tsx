// app/admin/artisans/page.tsx

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

const AdminArtisansPage = async () => {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Permission check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, role_scope")
    .eq("id", user.id)
    .single()

  if (
    !profile ||
    (profile.role !== "super_admin" && profile.role_scope !== "product")
  ) {
    redirect("/admin")
  }

  // Fetch all artisans (active + inactive untuk admin view)
  const { data: artisans } = await supabase
    .from("artisans")
    .select("*")
    .order("name")

  // Count active vs inactive
  const activeCount = artisans?.filter((a) => a.is_active).length || 0
  const inactiveCount = (artisans?.length || 0) - activeCount

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Dashboard</span>
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
        The Artisans
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Heritage keepers of Karanganyar
        {artisans && artisans.length > 0 && (
          <span>
            {" "}
            · {activeCount} aktif · {inactiveCount} tidak aktif
          </span>
        )}
      </p>

      {/* Add New Button */}
      <Link
        href="/admin/artisans/new"
        className="block w-full bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase text-center py-3 rounded-sm mb-6 hover:opacity-90 transition-opacity"
      >
        + Add New Artisan
      </Link>

      {/* List Artisans */}
      {artisans && artisans.length > 0 ? (
        <div className="space-y-3">
          {artisans.map((artisan) => (
            <Link
              key={artisan.id}
              href={`/admin/artisans/${artisan.id}`}
              className={`bg-white rounded-sm p-3 flex items-center gap-3 transition-opacity ${
                !artisan.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="relative w-16 h-16 bg-dzan-warm rounded-sm overflow-hidden flex-shrink-0">
                <Image
                  src={artisan.photo_url || "/logo-dzan.png"}
                  alt={artisan.name}
                  fill
                  sizes="64px"
                  className={
                    artisan.photo_url ? "object-cover" : "object-contain p-2"
                  }
                />
              </div>
              <div className="flex-1">
                <p className="font-cormorant text-base text-dzan-earth">
                  {artisan.name}
                </p>
                <p className="text-[10px] uppercase tracking-[1px] text-dzan-stone">
                  {artisan.craft_type} · {artisan.location}
                </p>
                {!artisan.is_active && (
                  <span className="inline-block text-[8px] uppercase tracking-[1px] bg-dzan-stone/20 text-dzan-stone px-2 py-0.5 rounded-sm mt-1">
                    Tidak Aktif
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-dzan-stone italic">
            Belum ada artisan. Tambah artisan pertama untuk memulai.
          </p>
        </div>
      )}
    </main>
  )
}

export default AdminArtisansPage
