"use client"

import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  isFirstTime: boolean
}

const ChangePasswordForm = ({ isFirstTime }: Props) => {
  const router = useRouter()
  const supabase = createClient()
  
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    console.log("🔵 Submit triggered")
    
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok")
      return
    }
    
    setLoading(true)
    console.log("🔵 Loading set to true")
    
    try {
      // STEP 1: Update password
      console.log("🔵 Calling supabase.auth.updateUser...")
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      
      if (updateError) {
        console.error("❌ updateUser error:", updateError)
        setError(`Gagal: ${updateError.message}`)
        setLoading(false)
        return
      }
      
      console.log("✅ Password updated in auth")
      
      // STEP 2: Call API
      console.log("🔵 Calling /api/account/complete-password-change...")
      
      const response = await fetch("/api/account/complete-password-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      console.log("🔵 API response status:", response.status)
      console.log("🔵 API response ok:", response.ok)
      
      const data = await response.json()
      console.log("🔵 API response data:", data)
      
      if (!response.ok) {
        console.error("❌ API error:", data.error)
        setError(`Server error: ${data.error || "Unknown"}`)
        setLoading(false)
        return
      }
      
      // STEP 3: Redirect
      const role = data.role || "buyer"
      console.log("✅ Success, redirecting to role:", role)
      
      router.push(role === "buyer" ? "/account" : "/admin")
      router.refresh()
      
    } catch (err: any) {
      console.error("❌ Caught error:", err)
      setError(`Error: ${err.message || "Unknown error"}`)
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toggle Show/Hide Password */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-[10px] tracking-[1.5px] uppercase text-dzan-amber hover:text-dzan-earth flex items-center gap-1.5"
        >
          {showPassword ? (
            <>
              <span>🙈</span>
              <span>Sembunyikan</span>
            </>
          ) : (
            <>
              <span>👁️</span>
              <span>Tampilkan Password</span>
            </>
          )}
        </button>
      </div>
      
      <div>
        <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
          Password Baru *
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
          placeholder="Minimal 8 karakter"
        />
      </div>
      
      <div>
        <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
          Konfirmasi Password Baru *
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
          placeholder="Ketik ulang"
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
        className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm mt-6 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Ganti Password"}
      </button>
      
      {!isFirstTime && (
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full text-xs tracking-[2px] uppercase text-dzan-stone py-3"
        >
          Batal
        </button>
      )}
    </form>
  )
}

export default ChangePasswordForm