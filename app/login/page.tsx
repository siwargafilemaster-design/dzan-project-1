"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import PasswordInput from "@/components/ui/PasswordInput"

const LoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Handle redirect params
  const redirectTo = searchParams.get("redirect")
  const action = searchParams.get("action")
  
  // Determine redirect URL after login
  const getRedirectUrl = (userRole: string | null | undefined, fullName: string | null | undefined) => {
    // Priority 1: Explicit redirect param
    if (redirectTo) {
      // Add ?openInquiry=true kalau action=inquire
      if (action === "inquire") {
        const separator = redirectTo.includes("?") ? "&" : "?"
        return `${redirectTo}${separator}openInquiry=true`
      }
      return redirectTo
    }
    
    // Priority 2: Onboarding untuk user tanpa full_name
    if (!fullName) {
      return "/onboarding"
    }
    
    // Priority 3: Role-based
    if (userRole === "super_admin" || userRole === "admin" || userRole === "freelancer") {
      return "/admin"
    }
    
    // Default: buyer ke /account
    return "/account"
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    
    // Include redirect params di OAuth callback
    let callbackUrl = `${window.location.origin}/auth/callback`
    if (redirectTo) {
      callbackUrl += `?redirect=${encodeURIComponent(redirectTo)}`
      if (action) {
        callbackUrl += `&action=${action}`
      }
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
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

    // Cek role untuk redirect
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
      
      // Use smart redirect logic
      const redirectUrl = getRedirectUrl(profile?.role, profile?.full_name)
      router.push(redirectUrl)
    } else {
      // Fallback
      router.push(redirectTo || "/account")
    }
    
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-3">
            Welcome
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Sign in to <em className="italic text-dzan-brown">DZAN</em>
          </h1>
        </div>
        
        {/* Action-specific banner */}
        {action === "inquire" && (
          <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-3 mb-4">
            <p className="text-xs text-dzan-earth italic text-center">
              💌 Please sign in to submit your inquiry
            </p>
          </div>
        )}

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
              placeholder="e.g. email@dzanlawu.com"
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Password
            </label>
            <PasswordInput             
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <div className="text-right mt-2">
              <Link 
                href="/forgot-password" 
                className="text-[11px] text-dzan-stone hover:text-dzan-amber italic"
              >
                Lupa password?
              </Link>
            </div>
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
          <Link 
            href={redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}${action ? `&action=${action}` : ""}` : "/signup"} 
            className="text-dzan-brown underline"
          >
            Create account
          </Link>
        </p>
        <p className="text-center text-[10px] text-dzan-stone mt-4">
          <Link href={redirectTo || "/"}>← Back</Link>
        </p>
      </div>
    </main>
  )
}

export default LoginPage