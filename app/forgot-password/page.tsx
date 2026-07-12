"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"
import { getBaseUrl } from "@/lib/get-base-url"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setStatus("loading")
    setErrorMsg("")

    const supabase = createClient()

    let baseUrl = window.location.origin
    if (baseUrl.includes('.app.github.dev:3000')) {
      baseUrl = baseUrl.replace (':3000', '')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getBaseUrl()}/auth/confirm`,
    })

    if (error) {
      setStatus("error")
      setErrorMsg(error.message)
      return
    }

    setStatus("sent")
  }

  // Success state
  if (status === "sent") {
    return (
      <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-dzan-amber/30 rounded-sm p-6 text-center">
            <div className="text-5xl mb-3">📧</div>
            <h1 className="font-cormorant text-2xl text-dzan-earth mb-3">
              Email Terkirim!
            </h1>
            <p className="text-sm text-dzan-stone italic mb-4 leading-relaxed">
              Silakan cek inbox <strong className="text-dzan-earth">{email}</strong>
              <br />
              dan klik link reset password.
            </p>
            
            <div className="bg-dzan-warm/30 rounded-sm p-3 mb-5">
              <p className="text-[11px] text-dzan-earth italic">
                💡 Link berlaku selama 1 jam. 
                Cek folder spam jika tidak ada di inbox.
              </p>
            </div>
            
            <Link 
              href="/login" 
              className="block w-full text-center text-xs tracking-[2px] uppercase text-dzan-stone hover:text-dzan-amber py-3"
            >
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Form state
  return (
    <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-3">
            Password Recovery
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Lupa <em className="italic text-dzan-brown">Password?</em>
          </h1>
          <p className="text-sm text-dzan-stone italic mt-4 leading-relaxed">
            Masukkan email akun Anda. Kami akan kirimkan link 
            untuk mengatur ulang password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@contoh.com"
              disabled={status === "loading"}
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
            />
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3">
              <p className="text-xs text-red-700 italic">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] font-medium uppercase py-4 rounded-sm disabled:opacity-50"
          >
            {status === "loading" ? "Mengirim..." : "Kirim Link Reset"}
          </button>

          <Link 
            href="/login" 
            className="block text-center text-xs tracking-[2px] uppercase text-dzan-stone hover:text-dzan-amber py-3"
          >
            ← Kembali ke Login
          </Link>
        </form>
      </div>
    </main>
  )
}