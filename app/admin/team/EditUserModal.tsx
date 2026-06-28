"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import { 
  type UserProfile, 
  ROLE_LABELS, 
  SCOPE_LABELS,
} from "@/lib/permissions"

interface Props {
  user: UserProfile
  viewerProfile: UserProfile
  onClose: () => void
  onSuccess: () => void
}

const EditUserModal = ({ user, viewerProfile, onClose, onSuccess }: Props) => {
  const supabase = createClient()
  
  const [fullName, setFullName] = useState(user.full_name || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Only super_admin can change role/scope
  // Admin can only edit name
  const canEditRoleScope = viewerProfile.role === "super_admin"
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!fullName) {
      setError("Nama wajib diisi")
      return
    }
    
    setLoading(true)
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)
    
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    
    // Log activity
    await supabase.from("activity_log").insert({
      user_id: viewerProfile.id,
      action: "update",
      entity_type: "user",
      entity_id: user.id,
      description: `Updated user: ${fullName}`,
    })
    
    onSuccess()
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-md w-full">
        <div className="bg-dzan-warm/30 px-4 py-3 border-b border-dzan-brown/10">
          <h2 className="font-cormorant text-xl text-dzan-earth">
            Edit User
          </h2>
          <p className="text-[11px] text-dzan-stone italic mt-0.5">
            {user.email}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-dzan-cream/50 border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
            />
            <p className="text-[10px] text-dzan-stone italic mt-1">
              🔒 Email tidak bisa diubah
            </p>
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
            />
          </div>
          
          {/* Role (read-only) */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
              Role
            </label>
            <input
              type="text"
              value={ROLE_LABELS[user.role]}
              disabled
              className="w-full bg-dzan-cream/50 border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
            />
            {!canEditRoleScope && (
              <p className="text-[10px] text-dzan-stone italic mt-1">
                🔒 Hanya super_admin yang bisa ubah role
              </p>
            )}
          </div>
          
          {/* Scope (read-only) */}
          {user.role_scope && (
            <div>
              <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-1">
                Scope
              </label>
              <input
                type="text"
                value={SCOPE_LABELS[user.role_scope] || user.role_scope}
                disabled
                className="w-full bg-dzan-cream/50 border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
              />
            </div>
          )}
          
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
              className="flex-1 text-[11px] tracking-[2px] uppercase text-dzan-stone py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-dzan-earth text-dzan-cream text-[11px] tracking-[2px] uppercase py-3 rounded-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUserModal