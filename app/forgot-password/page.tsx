"use client"

import { createClient } from "@/lib/supabase-browser"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )
    
    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }
    
    setSent(true)
    setLoading(false)
  }
  
  return (
    <main className="min-h-screen bg-dzan-cream px-6 py-12 flex items-center justify-center pt-28">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-2">
            Account Recovery
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Lupa Password?
          </h1>
          <p className="text-sm text-dzan-stone italic mt-2">
            Kami akan kirim link reset password ke email Anda
          </p>
        </div>
        
        {sent ? (
          <div className="bg-white border border-dzan-sage/30 rounded-sm p-6 text-center">
            <p className="text-2xl mb-2">📧</p>
            <h2 className="font-cormorant text-xl text-dzan-earth mb-2">
              Email Terkirim
            </h2>
            <p className="text-sm text-dzan-brown mb-4">
              Kami telah mengirim link reset password ke:
            </p>
            <p className="font-medium text-dzan-earth mb-4">{email}</p>
            <p className="text-[11px] text-dzan-stone italic mb-6">
              Cek inbox Anda (atau folder spam). Link berlaku 1 jam.
            </p>
            <Link 
              href="/login"
              className="inline-block text-xs tracking-[2px] uppercase text-dzan-amber"
            >
              ← Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm"
                placeholder="email@example.com"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                <p className="text-xs text-red-700 italic">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
            
            <div className="text-center pt-2">
              <Link 
                href="/login"
                className="text-[11px] text-dzan-stone hover:text-dzan-amber italic"
              >
                ← Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}