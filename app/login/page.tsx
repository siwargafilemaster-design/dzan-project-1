"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

const LoginPage = () => {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Cek role untuk redirect yang tepat (role-based routing)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
      
      // Step 1: Cek profile completion (user baru)
      if (!profile?.full_name) {
        router.push("/onboarding")
      }
      // Step 2: Admin & super_admin ke /admin
      else if (profile.role === "super_admin" || profile.role === "admin") {
        router.push("/admin")
      }
      // Default: ke /account (buyer)
      else {
        router.push("/account")
      }
    } else {
      // Fallback (kalau user fetch gagal)
      router.push("/account")
    }
    
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-3">
            Welcome
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Sign in to <em className="italic text-dzan-brown">DZAN</em>
          </h1>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 flex items-center justify-center gap-3 text-sm font-medium text-dzan-earth mb-3"
        >
          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-red-500 via-yellow-400 to-blue-500" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-dzan-brown/15" />
          <span className="text-[9px] tracking-[2px] uppercase text-dzan-stone">
            or
          </span>
          <div className="flex-1 h-px bg-dzan-brown/15" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 italic">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] font-medium uppercase py-4 rounded-sm mt-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-dzan-stone mt-6">
          New to DZAN?{" "}
          <Link href="/signup" className="text-dzan-brown underline">
            Create account
          </Link>
        </p>
        <p className="text-center text-[10px] text-dzan-stone mt-4">
          <Link href="/">← Browse without account</Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage