"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase-browser"

// Type untuk data profile yang di-share
interface Profile {
  id: string
  full_name: string | null
  title: string | null
  avatar_url: string | null
  role: string | null
  role_scope: string | null
  country: string | null
}

// Type untuk context value
interface AuthContextType {
  user: any | null
  profile: Profile | null
}

// Buat Context dengan default value (safety net)
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
})

// Custom hook untuk akses context dari component manapun
export const useAuth = () => useContext(AuthContext)

// Props yang diterima AuthProvider dari Server Component
interface AuthProviderProps {
  children: ReactNode
  initialUser: any | null
  initialProfile: Profile | null
}

export const AuthProvider = ({
  children,
  initialUser,
  initialProfile,
}: AuthProviderProps) => {
  const supabase = createClient()
  
  // KUNCI: Initial state DARI SERVER DATA (bukan null)
  // Tidak ada race condition karena data sudah tersedia
  const [user, setUser] = useState(initialUser)
  const [profile, setProfile] = useState(initialProfile)

  // Listener untuk handle perubahan auth di runtime
  // (login, logout, token refresh, multi-tab sync)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // CASE 1: User logout
      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        return
      }

      // CASE 2: User login atau token refresh
      if (session?.user) {
        setUser(session.user)
        
        // Fetch profile baru (kalau session ada user)
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, title, avatar_url, role, role_scope, country")
          .eq("id", session.user.id)
          .single()
        
        setProfile(data)
      }
    })

    // Cleanup saat component unmount
    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, profile }}>
      {children}
    </AuthContext.Provider>
  )
}