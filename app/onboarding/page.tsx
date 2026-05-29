"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const COUNTRIES = [
  "🇩🇪 Germany", "🇮🇩 Indonesia", "🇳🇱 Netherlands",
  "🇫🇷 France", "🇬🇧 United Kingdom", "🇺🇸 United States",
  "🇸🇬 Singapore", "🇯🇵 Japan", "🇦🇺 Australia", "Other",
]

const OnboardingPage = () => {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState("Mr.")
  const [fullName, setFullName] = useState("")
  const [country, setCountry] = useState("🇩🇪 Germany")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Pre-fill from Google if available
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name)
      }
    }
    loadUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("No user found!")
    setLoading(false)
    return
  }

  console.log("Updating profile for user:", user.id)
  console.log("Data to update:", { title, full_name: fullName, country })

  const { data, error } = await supabase
    .from("profiles")
    .update({
      title,
      full_name: fullName,
      country,
    })
    .eq("id", user.id)
    .select()  // ← TAMBAH .select() — biar tahu data yang ter-update

  console.log("Update result:", { data, error })

  if (error) {
    console.error("Update error:", error)
    alert(`Error: ${error.message}`)
    setLoading(false)
    return
  }

  if (!data || data.length === 0) {
    console.error("No rows updated!")
    alert("Profile update failed - no rows affected")
    setLoading(false)
    return
  }

  router.push("/account")
  router.refresh()
  }

  return (
    <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex gap-1 mb-8">
          <div className="flex-1 h-0.5 bg-dzan-amber" />
          <div className="flex-1 h-0.5 bg-dzan-amber" />
          <div className="flex-1 h-0.5 bg-dzan-brown/15" />
        </div>

        <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-3">
          One Last Step
        </p>
        <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
          Welcome to<br />
          <em className="italic text-dzan-brown">DZAN Lawu Heritage</em>
        </h1>
        <p className="text-xs text-dzan-stone mb-8 leading-relaxed">
          We'd love to address you properly when you visit.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              How shall we address you?
            </label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            >
              <option>Mr.</option>
              <option>Ms.</option>
              <option>Mrs.</option>
              <option>Mx.</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Jürgen Klopp"
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <p className="text-[9px] text-dzan-stone mt-1 italic">
              Helps us tailor greetings for you
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] font-medium uppercase py-4 rounded-sm mt-6"
          >
            {loading ? "Saving..." : "Continue →"}
          </button>
        </form>
      </div>
    </main>
  )
}

export default OnboardingPage