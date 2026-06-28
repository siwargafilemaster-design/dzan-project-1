"use client"

import PasswordInput from "@/components/ui/PasswordInput"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [validSession, setValidSession] = useState(false)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true)
      } else {
        setError("Link reset tidak valid atau sudah expired. Silakan request ulang.")
      }
    })
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }
    
    setLoading(true)
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    
    // Clear must_change_password flag
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id)
    }
    
    router.push("/admin")
    router.refresh()
  }
  
  return (
    <main className="min-h-screen bg-dzan-cream px-6 py-12 flex items-center justify-center pt-28">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-2">
            Set New Password
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Buat Password Baru
          </h1>
        </div>
        
        {!validSession && error ? (
          <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-center">
            <p className="text-sm text-red-800 mb-3">{error}</p>
            <a 
              href="/forgot-password"
              className="text-xs tracking-[2px] uppercase text-dzan-amber"
            >
              Request Link Baru
            </a>
          </div>
        ) : (
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
            </div>
            
            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
                Konfirmasi Password *
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Masukkan ulang Password baru"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                <p className="text-xs text-red-700 italic">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !validSession}
              className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Set Password Baru"}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}