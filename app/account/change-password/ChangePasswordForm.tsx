"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useState } from "react"
import PasswordInput from "@/components/ui/PasswordInput"

interface Props {
  isFirstTime?: boolean
}

const ChangePasswordForm = ({ isFirstTime = false }: Props) => {
  const router = useRouter()
  const supabase = createClient()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/account/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Gagal: ${data.error || "Unknown error"}`)
        setLoading(false)
        return
      }

      // Success — show popup
      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError(`Error: ${err.message || "Network error"}`)
      setLoading(false)
    }
  }

  const handleConfirmAndLogout = async () => {
    console.log("🔵 Logout button clicked")
    try {
      await supabase.auth.signOut()
      console.log("✅ Signed out, redirecting...")
      window.location.href = "/login?message=password_changed"
    } catch (err: any) {
      console.error("❌ Signout error:", err)
      // Force redirect anyway
      window.location.href = "/login?message=password_changed"
    }
  }

  // Success popup
  if (success) {
    return (
      <div className="bg-white border border-dzan-amber/30 rounded-sm p-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="font-cormorant text-2xl text-dzan-earth mb-3">
          Ganti Password Beres!
        </h2>
        <p className="text-sm text-dzan-stone italic mb-4 leading-relaxed">
          Password baru sudah aktif nih.
          <br />
          Yuk login ulang dengan password baru kamu! 🔐
        </p>

        <div className="bg-dzan-warm/30 rounded-sm p-3 mb-5">
          <p className="text-[11px] text-dzan-earth italic">
            ⚠️ Ingat-ingat password barunya ya! Catat dulu deh sebelum lanjut!
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirmAndLogout}
          className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm hover:bg-dzan-brown transition-colors cursor-pointer"
        >
          Login dengan Password Baru →
        </button>
      </div>
    )
  }

  // Form input
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
          Password Baru *
        </label>
        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
        />
        <p className="text-[10px] text-dzan-stone italic mt-1">
          Gunakan kombinasi huruf, angka, dan simbol untuk keamanan
        </p>
      </div>

      <div>
        <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
          Konfirmasi Password Baru *
        </label>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Ketik ulang password baru"
        />
      </div>

      <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-3">
        <p className="text-[11px] text-dzan-earth italic">
          {isFirstTime
            ? "💡 Setelah buat password, Anda akan login ulang dengan password baru."
            : "💡 Setelah ganti password, Anda akan diminta login ulang dengan password baru."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-3">
          <p className="text-xs text-red-700 italic">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm mt-6 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Ganti Password"}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        disabled={loading}
        className="w-full text-xs tracking-[2px] uppercase text-dzan-stone py-3"
      >
        Batal
      </button>
    </form>
  )
}

export default ChangePasswordForm
