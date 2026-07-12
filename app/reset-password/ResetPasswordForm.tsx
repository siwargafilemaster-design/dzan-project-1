"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PasswordInput from "@/components/ui/PasswordInput"

interface Props {
  email: string
}

export default function ResetPasswordForm({ email }: Props) {
  const router = useRouter()
  
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 8) {
      setErrorMsg("Password minimal 8 karakter.")
      setStatus("error")
      return
    }
    
    if (password !== confirm) {
      setErrorMsg("Konfirmasi password tidak cocok.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? "Gagal menyimpan password.")
        setStatus("error")
        return
      }

      // Success → redirect ke login dengan pesan
      router.push("/login?message=password_updated")
      router.refresh()
      
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.")
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-3">
            Set New Password
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Atur <em className="italic text-dzan-brown">Password Baru</em>
          </h1>
          <p className="text-xs text-dzan-stone italic mt-3">
            Untuk akun: <strong className="text-dzan-earth">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Password Baru
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Konfirmasi Password
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password baru"
              required
            />
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3">
              <p className="text-xs text-red-700 italic">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] font-medium uppercase py-4 rounded-sm disabled:opacity-50"
          >
            {status === "loading" ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
      </div>
    </main>
  )
}