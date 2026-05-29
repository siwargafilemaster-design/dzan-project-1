"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"

const Navbar = () => {
  const supabase = createClient()
  const [lang, setLang] = useState<"ID" | "EN">("EN")
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("title, full_name, avatar_url")
          .eq("id", user.id)
          .single()
        setProfile(data)
      }
    }

    getUserAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("title, full_name, avatar_url")
            .eq("id", session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const toggleLang = () => {
    setLang(lang === "ID" ? "EN" : "ID")
  }

  // Ambil inisial dari nama untuk avatar fallback
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-26 flex items-center justify-between px-6 bg-dzan-cream/95 backdrop-blur-md border-b border-dzan-brown/10">
      
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo-dzan.png"
          alt="DZAN Lawu Heritage"
          width={80}
          height={40}
          className="object-contain h-auto w-auto"
          priority
        />
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="text-lg font-bold tracking-wider text-dzan-brown"
        >
          {lang === "ID" ? "🇮🇩 ID" : "🇬🇧 EN"}
        </button>

        {/* Conditional: Login Button atau User Avatar */}
        {user ? (
          <Link
            href="/account"
            className="w-20 h-20 rounded-full bg-dzan-amber text-dzan-earth font-bold text-lg flex items-center justify-center hover:bg-dzan-brown hover:text-dzan-cream transition-colors"
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || "User"}
                width={20}
                height={20}
                className="rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-xs font-medium tracking-wider bg-dzan-earth text-dzan-cream px-4 py-2 rounded-sm"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar