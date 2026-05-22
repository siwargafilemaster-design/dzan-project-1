import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

const AccountPage = async () => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.full_name) redirect("/onboarding")

  // Update last visit
  await supabase
    .from("profiles")
    .update({ last_visit_at: new Date().toISOString() })
    .eq("id", user.id)

  // Get saved products
  const { data: savedProducts } = await supabase
    .from("saved_products")
    .select(`
      created_at,
      products (slug, name_en, category, image_url)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get inquiries
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select(`
      id, status, quantity, created_at,
      products (name_en)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <main className="bg-dzan-cream min-h-screen pt-16 pb-20">
      {/* Greeting Hero */}
      <section className="bg-gradient-to-br from-dzan-earth to-dzan-brown px-6 py-10">
        <p className="text-[10px] tracking-[3px] uppercase text-dzan-amber mb-2">
          {getGreeting()}
        </p>
        <h1 className="font-cormorant font-light text-3xl text-dzan-cream leading-tight mb-1">
          {profile.title}{" "}
          <em className="italic text-dzan-amber">{profile.full_name}</em>
        </h1>
        <p className="text-sm text-dzan-cream/70">{profile.country}</p>

        <div className="mt-6 pt-5 border-t border-dzan-cream/15">
          <p className="font-cormorant italic text-sm text-dzan-cream/70 leading-relaxed">
            "Welcome back. The artisans of Lawu have been crafting
            something new since your last visit."
          </p>
        </div>
      </section>

      {/* Saved Products */}
      <section className="px-6 py-8">
        <p className="text-[10px] tracking-[3px] uppercase text-dzan-amber mb-3">
          Your Saved Crafts
        </p>

        {savedProducts && savedProducts.length > 0 ? (
          <div className="bg-white rounded-sm p-4 space-y-3">
            {savedProducts.map((item: any) => (
              <Link
                key={item.products.slug}
                href={`/product/${item.products.slug}`}
                className="flex items-center gap-3 pb-3 border-b border-dzan-brown/8 last:border-0 last:pb-0"
              >
                <div className="relative w-12 h-12 bg-dzan-warm rounded-sm overflow-hidden flex-shrink-0">
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name_en}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-cormorant text-base text-dzan-earth leading-tight">
                    {item.products.name_en}
                  </p>
                  <p className="text-[9px] tracking-[1px] uppercase text-dzan-stone mt-0.5">
                    {item.products.category}
                  </p>
                </div>
                <span className="text-dzan-amber text-lg">♥</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm p-6 text-center">
            <p className="text-xs text-dzan-stone italic">
              No saved crafts yet
            </p>
          </div>
        )}
      </section>

      {/* Inquiries */}
      <section className="px-6 pb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-dzan-amber mb-3">
          Your Inquiries
        </p>

        {inquiries && inquiries.length > 0 ? (
          <div className="space-y-2">
            {inquiries.map((inq: any) => (
              <div
                key={inq.id}
                className="bg-white rounded-sm p-4 border-l-4 border-dzan-amber"
              >
                <p className="text-[8px] tracking-[2px] uppercase text-dzan-sage mb-1">
                  ● {inq.status === "new" ? "Pending Review" : inq.status}
                </p>
                <p className="text-sm text-dzan-earth leading-relaxed">
                  {inq.products.name_en} — {inq.quantity} pcs
                </p>
                <p className="text-[10px] text-dzan-stone mt-1">
                  {new Date(inq.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm p-6 text-center">
            <p className="text-xs text-dzan-stone italic">
              No inquiries yet — explore our catalog
            </p>
          </div>
        )}
      </section>

      {/* Logout */}
      <section className="px-6">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full text-xs tracking-[2px] uppercase text-dzan-stone border border-dzan-stone/30 rounded-sm py-3"
          >
            Sign Out
          </button>
        </form>
      </section>
    </main>
  )
}

export default AccountPage