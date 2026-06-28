"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"
import { 
  type UserProfile, 
  ROLE_LABELS, 
  SCOPE_LABELS,
  canAddUser,
  canEditUser,
  canDeactivateUser
} from "@/lib/permissions"
import AddUserModal from "./AddUserModal"
import EditUserModal from "./EditUserModal"

interface Props {
  viewerProfile: UserProfile
  initialUsers: UserProfile[]
}

const TeamManager = ({ viewerProfile, initialUsers }: Props) => {
  const router = useRouter()
  const supabase = createClient()
  
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Group users by role
  const superAdmins = users.filter(u => u.role === "super_admin")
  const admins = users.filter(u => u.role === "admin")
  const freelancers = users.filter(u => u.role === "freelancer")
  
  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "??"
    return name.split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }
  
  // Toggle active status
  const handleToggleActive = async (user: UserProfile) => {
    if (!confirm(
      user.is_active 
        ? `Deactivate ${user.full_name}?`
        : `Reactivate ${user.full_name}?`
    )) return
    
    setActionLoading(user.id)
    
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !user.is_active })
      .eq("id", user.id)
    
    if (error) {
      alert(`Gagal: ${error.message}`)
      setActionLoading(null)
      return
    }
    
    // Log activity
    await supabase.from("activity_log").insert({
      user_id: viewerProfile.id,
      action: user.is_active ? "deactivate" : "activate",
      entity_type: "user",
      entity_id: user.id,
      description: `${user.is_active ? "Deactivated" : "Reactivated"} user: ${user.full_name}`,
    })
    
    // Update local state
    setUsers(users.map(u => 
      u.id === user.id ? { ...u, is_active: !u.is_active } : u
    ))
    setActionLoading(null)
  }
  
  // User card component
  const UserCard = ({ user }: { user: UserProfile }) => {
    const isYou = user.id === viewerProfile.id
    const canEdit = canEditUser(viewerProfile, user)
    const canDeactivate = canDeactivateUser(viewerProfile, user)
    
    return (
      <div className={`p-4 flex items-center gap-3 ${!user.is_active ? "opacity-50" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-dzan-earth text-dzan-cream flex items-center justify-center font-medium">
          {getInitials(user.full_name)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-cormorant text-base text-dzan-earth">
              {user.full_name || "Unnamed"}
            </p>
            {isYou && (
              <span className="text-[8px] tracking-[1.5px] uppercase bg-dzan-amber text-white px-1.5 py-0.5 rounded-sm">
                You
              </span>
            )}
            {!user.is_active && (
              <span className="text-[8px] tracking-[1.5px] uppercase bg-dzan-stone text-white px-1.5 py-0.5 rounded-sm">
                Inactive
              </span>
            )}
            {user.must_change_password && (
              <span className="text-[8px] tracking-[1.5px] uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-sm">
                Pending Setup
              </span>
            )}
          </div>
          <p className="text-[11px] text-dzan-stone truncate">{user.email}</p>
          {user.role_scope && (
            <p className="text-[10px] text-dzan-amber mt-0.5">
              {SCOPE_LABELS[user.role_scope] || user.role_scope}
            </p>
          )}
        </div>
        
        {(canEdit || canDeactivate) && !isYou && (
          <div className="flex flex-col gap-1">
            {canEdit && (
              <button
                onClick={() => setEditingUser(user)}
                className="text-[10px] tracking-[1.5px] uppercase text-dzan-earth hover:text-dzan-amber px-2 py-1"
                disabled={actionLoading === user.id}
              >
                Edit
              </button>
            )}
            {canDeactivate && (
              <button
                onClick={() => handleToggleActive(user)}
                disabled={actionLoading === user.id}
                className={`text-[10px] tracking-[1.5px] uppercase px-2 py-1 ${
                  user.is_active 
                    ? "text-red-600 hover:text-red-700" 
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                {actionLoading === user.id 
                  ? "..." 
                  : user.is_active ? "Deactivate" : "Reactivate"}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
  
  // Section component
  const Section = ({ 
    label, 
    users: sectionUsers 
  }: { 
    label: string
    users: UserProfile[]
  }) => {
    if (sectionUsers.length === 0) return null
    
    return (
      <div className="mb-4">
        <div className="bg-dzan-warm/30 px-4 py-2 rounded-t-sm border-b border-dzan-brown/10">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
            {label} ({sectionUsers.length})
          </p>
        </div>
        <div className="bg-white rounded-b-sm divide-y divide-dzan-brown/10">
          {sectionUsers.map(u => <UserCard key={u.id} user={u} />)}
        </div>
      </div>
    )
  }
  
  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-12 px-6">
      {/* Back */}
      <div className="py-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full"
        >
          <span>←</span><span>Dashboard</span>
        </Link>
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-3">
        <div>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            Team
          </h1>
          <p className="text-xs text-dzan-stone italic mt-1">
            {users.length} anggota DZAN family
          </p>
        </div>
        
        {canAddUser(viewerProfile) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-dzan-earth text-dzan-cream text-[10px] tracking-[2px] uppercase px-3 py-2 rounded-sm font-medium flex-shrink-0"
          >
            + Add User
          </button>
        )}
      </div>
      
      {/* Sections */}
      <Section label="👴 Super Admin" users={superAdmins} />
      <Section label="👤 Admin" users={admins} />
      <Section label="🤝 Freelancer" users={freelancers} />
      
      {users.length === 0 && (
        <div className="text-center py-12 text-dzan-stone text-sm italic">
          Belum ada anggota team.
        </div>
      )}
      
      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          viewerProfile={viewerProfile}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}
      
      {editingUser && (
        <EditUserModal
          user={editingUser}
          viewerProfile={viewerProfile}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null)
            router.refresh()
          }}
        />
      )}
    </main>
  )
}

export default TeamManager