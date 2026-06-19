// app/admin/settings/SettingsManager.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

interface SettingRow {
  id: number
  key: string
  value: string | null
  category: string
  label: string
  description: string | null
  field_type: string
  sort_order: number
  is_required: boolean
}

interface SettingsManagerProps {
  initialSettings: SettingRow[]
}

const CATEGORY_INFO: Record<string, { label: string; icon: string; description: string }> = {
  contact: {
    label: "Kontak",
    icon: "📱",
    description: "WhatsApp, Email, dan template inquiry"
  },
  business: {
    label: "Bisnis",
    icon: "🏢",
    description: "Informasi bisnis DZAN"
  },
  social: {
    label: "Media Sosial",
    icon: "🌐",
    description: "Instagram, YouTube, Facebook, dll"
  },
  brand: {
    label: "Brand Content",
    icon: "✨",
    description: "Tagline, footer text, deskripsi"
  }
}

const SettingsManager = ({ initialSettings }: SettingsManagerProps) => {
  const router = useRouter()
  const supabase = createClient()
  
  // Local state untuk track changes
  const [settings, setSettings] = useState<SettingRow[]>(initialSettings)
  const [originalSettings] = useState<SettingRow[]>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  // Detect changes
  const hasChanges = settings.some((s, i) => 
    s.value !== originalSettings[i]?.value
  )
  
  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = []
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, SettingRow[]>)
  
  // Update local state
  const handleChange = (id: number, newValue: string) => {
    setSettings(prev => 
      prev.map(s => s.id === id ? { ...s, value: newValue } : s)
    )
    setError("")
    setSuccessMessage("")
  }
  
  // Save all changes
  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccessMessage("")
    
    try {
      // Get changed settings only
      const changed = settings.filter((s, i) => 
        s.value !== originalSettings[i]?.value
      )
      
      if (changed.length === 0) {
        setError("Tidak ada perubahan untuk disimpan.")
        return
      }
      
      // Get current user untuk audit
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User tidak terautentikasi")
      
      // Update each changed setting
      const updates = changed.map(setting => 
        supabase
          .from("site_settings")
          .update({
            value: setting.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .eq("id", setting.id)
      )
      
      const results = await Promise.all(updates)
      
      // Check for errors
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        throw new Error(`Gagal update ${errors.length} setting`)
      }
      
      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "update",
        entity_type: "site_settings",
        entity_id: "settings",
        description: `Updated ${changed.length} setting(s): ${changed.map(c => c.key).join(", ")}`,
      })
      
      setSuccessMessage(`✅ ${changed.length} setting berhasil disimpan!`)
      
      // Refresh data
      setTimeout(() => {
        router.refresh()
      }, 1500)
      
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }
  
  // Reset to original
  const handleReset = () => {
    setSettings(originalSettings)
    setError("")
    setSuccessMessage("")
  }
  
  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2 mt-2">
        Settings
      </h1>
      <p className="text-xs text-dzan-stone italic mb-8">
        Configurable values untuk DZAN web
      </p>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-3 mb-4">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-sm p-3 mb-4">
          <p className="text-xs text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Sections by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSettings).map(([category, items]) => {
          const info = CATEGORY_INFO[category] || { label: category, icon: "📋", description: "" }
          
          return (
            <section key={category} className="bg-white rounded-sm overflow-hidden">
              {/* Section Header */}
              <div className="bg-dzan-warm/30 px-5 py-3 border-b border-dzan-brown/10">
                <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
                  {info.icon} {info.label}
                </p>
                <p className="text-[11px] text-dzan-stone italic mt-0.5">
                  {info.description}
                </p>
              </div>
              
              {/* Section Fields */}
              <div className="p-5 space-y-4">
                {items.map(setting => (
                  <div key={setting.id}>
                    {/* Label */}
                    <label 
                      htmlFor={`setting-${setting.id}`}
                      className="block text-xs text-dzan-earth font-medium mb-1"
                    >
                      {setting.label}
                      {setting.is_required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    
                    {/* Description */}
                    {setting.description && (
                      <p className="text-[10px] text-dzan-stone italic mb-2">
                        {setting.description}
                      </p>
                    )}
                    
                    {/* Input Field */}
                    {setting.field_type === "textarea" ? (
                      <textarea
                        id={`setting-${setting.id}`}
                        value={setting.value || ""}
                        onChange={(e) => handleChange(setting.id, e.target.value)}
                        disabled={saving}
                        rows={3}
                        className="w-full bg-dzan-cream border border-dzan-brown/20 rounded-sm px-3 py-2 text-sm text-dzan-earth focus:outline-none focus:border-dzan-amber disabled:opacity-50"
                      />
                    ) : (
                      <input
                        id={`setting-${setting.id}`}
                        type={setting.field_type === "email" ? "email" : setting.field_type === "url" ? "url" : "text"}
                        value={setting.value || ""}
                        onChange={(e) => handleChange(setting.id, e.target.value)}
                        disabled={saving}
                        className="w-full bg-dzan-cream border border-dzan-brown/20 rounded-sm px-3 py-2 text-sm text-dzan-earth focus:outline-none focus:border-dzan-amber disabled:opacity-50"
                      />
                    )}
                    
                    {/* Field Key (small, untuk reference) */}
                    <p className="text-[9px] text-dzan-stone/60 mt-1 font-mono">
                      key: {setting.key}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Action Buttons (sticky bottom) */}
      <div className="sticky bottom-4 mt-6 bg-white border border-dzan-brown/20 rounded-sm p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            {hasChanges ? (
              <p className="text-xs text-dzan-amber font-medium">
                ⚠️ Ada perubahan belum disimpan
              </p>
            ) : (
              <p className="text-xs text-dzan-stone italic">
                Tidak ada perubahan
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || !hasChanges}
            className="text-xs tracking-[2px] uppercase text-dzan-stone hover:text-dzan-earth disabled:opacity-30"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-dzan-earth hover:opacity-90 text-dzan-cream text-xs tracking-[2px] uppercase font-medium px-6 py-3 rounded-sm transition-opacity disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </main>
  )
}

export default SettingsManager