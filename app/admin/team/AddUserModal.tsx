"use client"

import { useState, useMemo } from "react"
import { 
  type UserProfile, 
  type UserRole, 
  type UserScope,
  getAllowedRolesForAdd,
  getAllowedScopesForAdd,
  ROLE_LABELS,
  SCOPE_LABELS,
} from "@/lib/permissions"

interface Props {
  viewerProfile: UserProfile
  onClose: () => void
  onSuccess: () => void
}

const AddUserModal = ({ viewerProfile, onClose, onSuccess }: Props) => {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<UserRole>("freelancer")
  const [scope, setScope] = useState<UserScope>(
    viewerProfile.role === "admin" ? viewerProfile.role_scope : "sales"
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null)
  
  const allowedRoles = useMemo(
    () => getAllowedRolesForAdd(viewerProfile),
    [viewerProfile]
  )
  
  const allowedScopes = useMemo(
    () => getAllowedScopesForAdd(viewerProfile, role),
    [viewerProfile, role]
  )
  
  // Lock fields for non-super_admin
  const isRoleLocked = viewerProfile.role !== "super_admin"
  const isScopeLocked = viewerProfile.role === "admin"
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !fullName) {
      setError("Email dan Nama wajib diisi")
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role,
          role_scope: scope,
          recruited_by: viewerProfile.id,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal create user")
      }
      
      // Show credentials
      setCredentials({
        email: data.email,
        password: data.password,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // Credentials success view
  if (credentials) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-sm max-w-md w-full p-6 text-center">
          <div className="text-5xl mb-2">✅</div>
          <h2 className="font-cormorant text-2xl text-dzan-earth">
            User Berhasil Dibuat!
          </h2>
          <p className="text-xs text-dzan-stone italic mb-4">
            Bagikan credentials ini ke user
          </p>
          
          <div className="bg-dzan-warm/30 rounded-sm p-4 text-left mb-3">
            <div className="mb-3">
              <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">Email</p>
              <p className="font-mono text-sm text-dzan-earth mt-1 select-all">
                {credentials.email}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">Password</p>
              <p className="font-mono text-sm text-dzan-earth mt-1 select-all">
                {credentials.password}
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 mb-4">
            <p className="text-[11px] text-amber-900 italic">
              ⚠️ Catat password ini sekarang dan bagikan ke user via Whatsapp. 
              User dapat ganti password sendiri setelah login.
            </p>
          </div>
          
          <button
            onClick={onSuccess}
            className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm"
          >
            Selesai
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-sm max-w-md w-full my-8">
        <div className="bg-dzan-warm/30 px-4 py-3 border-b border-dzan-brown/10">
          <h2 className="font-cormorant text-xl text-dzan-earth">
            Add New User
          </h2>
          <p className="text-[11px] text-dzan-stone italic mt-0.5">
            Tambahkan anggota baru ke DZAN family
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Email */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
              placeholder="user@example.com"
            />
          </div>
          
          {/* Full Name */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
              placeholder="Givenchy Az Zhafran"
            />
          </div>
          
          {/* Role */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
              Role
            </label>
            {isRoleLocked ? (
              <>
                <input
                  type="text"
                  value={ROLE_LABELS[role]}
                  disabled
                  className="w-full bg-dzan-cream/50 border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
                />
                <p className="text-[10px] text-dzan-stone italic mt-1">
                  🔒 Anda hanya bisa create freelancer
                </p>
              </>
            ) : (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
              >
                {allowedRoles.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            )}
          </div>
          
          {/* Scope */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
              Scope
            </label>
            {isScopeLocked ? (
              <>
                <input
                  type="text"
                  value={scope ? SCOPE_LABELS[scope] : ""}
                  disabled
                  className="w-full bg-dzan-cream/50 border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
                />
                <p className="text-[10px] text-dzan-stone italic mt-1">
                  🔒 Scope locked sesuai akses Anda
                </p>
              </>
            ) : (
              <select
                value={scope || ""}
                onChange={(e) => setScope(e.target.value as UserScope)}
                className="w-full bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
              >
                {allowedScopes.map(s => (
                  <option key={s} value={s || ""}>
                    {s ? SCOPE_LABELS[s] : "—"}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Info */}
          <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-3">
            <p className="text-[11px] text-dzan-earth italic">
              🔑 Password akan diberikan.
              User dapat mengganti Password kapan saja di halaman akun.
            </p>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3">
              <p className="text-[11px] text-red-700">{error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-[11px] tracking-[2px] uppercase text-dzan-stone py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-dzan-earth text-dzan-cream text-[11px] tracking-[2px] uppercase py-3 rounded-sm disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddUserModal