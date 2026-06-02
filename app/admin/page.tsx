import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
}

const ROLE_SCOPE_LABELS: Record<string, string> = {
  all: "Founder",
  product: "Product & QC Manager",
  creative: "Design & Content Manager",
  sales: "Sales Manager",
}

// Action permissions per role
const getActions = (role: string, scope: string | null) => {
  const allActions = [
    { id: "products", icon: "📦", label: "Products", href: "/admin/products", scopes: ["product"] },
    { id: "artisans", icon: "👥", label: "Artisans", href: "/admin/artisans", scopes: ["product", "sales"] },
    { id: "media", icon: "🎬", label: "Hero Video", href: "/admin/media", scopes: ["creative"] },
    { id: "photos", icon: "📷", label: "Photo Upload", href: "/admin/photos", scopes: ["creative"] },
    { id: "bts", icon: "🎨", label: "Behind The Scenes", href: "/admin/bts", scopes: ["creative"] },
    { id: "qr", icon: "📱", label: "QR Codes", href: "/admin/qr", scopes: ["product", "creative"] },
    { id: "inquiries", icon: "✉️", label: "Inquiries", href: "/admin/inquiries", scopes: ["sales"] },
    { id: "team", icon: "👥", label: "Team Manage", href: "/admin/team", scopes: [] },
    { id: "settings", icon: "⚙️", label: "Settings", href: "/admin/settings", scopes: [] },
  ]

  return allActions.map((a) => ({
    ...a,
    enabled:
      role === "super_admin" ||
      (role === "admin" && a.scopes.includes(scope || "")),
  }))
}

const AdminDashboard = async () => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role === "buyer") {
    redirect("/account")
  }

  const actions = getActions(profile.role, profile.role_scope)

  // Stats
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  const { count: inquiriesCount } = await supabase
    .from("inquiries")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  // Activity Feed (20 terbaru)
  const { data: activities } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20">
      {/* Header */}
      <section className="bg-dzan-earth px-6 py-8 text-dzan-cream">
        <span className="inline-block bg-dzan-amber text-dzan-earth text-[8px] tracking-[2px] uppercase font-semibold px-2 py-0.5 rounded-sm mb-2">
          {ROLE_LABELS[profile.role]}
        </span>
        <h1 className="font-cormorant font-light text-2xl">
          <em className="italic">{profile.full_name}</em>
        </h1>
        {profile.role_scope && (
          <p className="text-xs text-dzan-stone mt-1">
            {ROLE_SCOPE_LABELS[profile.role_scope]}
          </p>
        )}
      </section>

      {/* Stats */}
      <section className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-sm p-4 grid grid-cols-2 gap-2 shadow-md">
          <div className="text-center p-2">
            <p className="font-cormorant text-3xl text-dzan-brown">
              {productsCount || 0}
            </p>
            <p className="text-[8px] tracking-[2px] uppercase text-dzan-stone mt-1">
              Products
            </p>
          </div>
          <div className="text-center p-2">
            <p className="font-cormorant text-3xl text-dzan-brown">
              {inquiriesCount || 0}
            </p>
            <p className="text-[8px] tracking-[2px] uppercase text-dzan-stone mt-1">
              New Inquiries
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="px-6 py-8">
        <h2 className="font-cormorant text-lg text-dzan-earth mb-4">
          Your Actions
        </h2>

        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) =>
            action.enabled ? (
              <Link
                key={action.id}
                href={action.href}
                className="bg-white rounded-sm p-4 text-center border-t-2 border-dzan-amber"
              >
                <div className="text-2xl mb-1">{action.icon}</div>
                <p className="text-[10px] font-medium text-dzan-earth">
                  {action.label}
                </p>
              </Link>
            ) : (
              <div
                key={action.id}
                className="bg-white rounded-sm p-4 text-center border-t-2 border-dzan-stone/30 opacity-40 relative"
              >
                <span className="absolute top-1 right-2 text-xs">🔒</span>
                <div className="text-2xl mb-1">{action.icon}</div>
                <p className="text-[10px] font-medium text-dzan-earth">
                  {action.label}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Activity Feed */}
      <section className="px-6 py-4">
        <h2 className="font-cormorant text-lg text-dzan-earth mb-4">
          Recent Activity
        </h2>

        {activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-sm p-4 border-l-2 border-dzan-amber"
              >
                <p className="text-xs text-dzan-stone">
                  {new Date(act.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-dzan-earth mt-1">
                  <span className="font-semibold">{act.actor_name}</span>{" "}
                  {act.description}
                </p>
                {act.entity_name && (
                  <p className="text-xs text-dzan-stone mt-1 italic">
                    {act.entity_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm p-6 text-center border border-dzan-stone/20">
            <p className="text-xs text-dzan-stone italic">
              Belum ada aktivitas — mulai bekerja untuk lihat history di sini
            </p>
          </div>
        )}
      </section>

      {/* View as Buyer */}
      <section className="px-6 py-8">
        <Link
          href="/account"
          className="block text-center text-xs tracking-[2px] uppercase text-dzan-stone hover:text-dzan-amber transition-colors"
        >
          👁️ View as Buyer
        </Link>
      </section>
    </main>
  )
}

export default AdminDashboard