import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"

const AdminArtisansPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, role_scope")
    .eq("id", user.id)
    .single()

  if (
    !profile ||
    (profile.role !== "super_admin" &&
      profile.role_scope !== "product" &&
      profile.role_scope !== "sales")
  ) {
    redirect("/admin")
  }

  const { data: artisans } = await supabase
    .from("artisans")
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
        The Artisans
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Heritage keepers of Karanganyar
      </p>

      <Link
        href="/admin/artisans/new"
        className="block w-full bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase text-center py-3 rounded-sm mb-6"
      >
        + Add New Artisan
      </Link>

      <div className="space-y-3">
        {artisans?.map((a) => (
          <Link
            key={a.id}
            href={`/admin/artisans/${a.id}`}
            className="bg-white rounded-sm p-4 block"
          >
            <p className="font-cormorant text-lg text-dzan-earth">{a.name}</p>
            <p className="text-[10px] uppercase tracking-[1px] text-dzan-stone mt-1">
              {a.location} · {a.craft_type}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default AdminArtisansPage