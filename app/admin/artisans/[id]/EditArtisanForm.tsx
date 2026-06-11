// app/admin/artisans/[id]/EditArtisanForm.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

// Helper untuk auto-generate composite slug: nama-craft-location
const generateSlug = (
  name: string,
  craftType: string,
  location: string
): string => {
  // Ambil bagian utama dari location (sebelum koma)
  const locationPart = location.split(",")[0].trim()

  // Compose: name + craft + location
  const composed = `${name} ${craftType} ${locationPart}`

  return composed
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface Artisan {
  id: number
  slug: string
  name: string
  location: string
  craft_type: string
  bio_en: string
  bio_id: string
  photo_url: string
  is_active: boolean
}

interface EditArtisanFormProps {
  artisan: Artisan
  productCount: number
  isSuperAdmin: boolean
}

const EditArtisanForm = ({ artisan, productCount, isSuperAdmin }: EditArtisanFormProps) => {
  const router = useRouter()
  const supabase = createClient()

  // Pre-fill state
  const [name, setName] = useState(artisan.name)
  const [slug, setSlug] = useState(artisan.slug)
  const [location, setLocation] = useState(artisan.location)
  const [craftType, setCraftType] = useState(artisan.craft_type)
  const [bioEn, setBioEn] = useState(artisan.bio_en)
  const [bioId, setBioId] = useState(artisan.bio_id)
  const [isActive, setIsActive] = useState(artisan.is_active)

  // Photo state — optional replace
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const existingPhotoUrl = artisan.photo_url

// UI feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Delete state (super admin only)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Auto-update composite slug saat name/craft/location berubah
  useEffect(() => {
    if (name && craftType && location) {
      setSlug(generateSlug(name, craftType, location))
    }
  }, [name, craftType, location])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Foto terlalu besar (max 5 MB)")
      return
    }

    setPhotoFile(file)
    setError("")

    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null

    const fileExt = photoFile.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from("artisans")
      .upload(fileName, photoFile)

    if (error) {
      setError(`Upload gagal: ${error.message}`)
      return null
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("artisans").getPublicUrl(fileName)

    return publicUrl
  }

  // Build description untuk activity log (Hybrid format)
  const buildUpdateDescription = (newPhotoUrl: string | null): string => {
    const changes: string[] = []

    if (isActive !== artisan.is_active) {
      changes.push(
        isActive ? "Aktifkan di keluarga DZAN" : "Tidak aktif sementara"
      )
    }

    if (newPhotoUrl) {
      changes.push("Update foto artisan")
    }

    if (changes.length === 0) {
      return `Update artisan: ${name}`
    }

    return `Update artisan: ${name} — ${changes.join(", ")}`
  }

  const logUpdateActivity = async (newPhotoUrl: string | null) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, role_scope")
        .eq("id", user.id)
        .single()

      if (!profile) return

      await supabase.from("activity_log").insert({
        actor_id: user.id,
        actor_name: profile.full_name,
        actor_role: profile.role_scope || profile.role,
        action: "update",
        entity_type: "artisan",
        entity_id: String(artisan.id),
        entity_name: name,
        description: buildUpdateDescription(newPhotoUrl),
      })
    } catch (err: any) {
      console.error("logUpdateActivity failed:", err?.message || err)
    }
  }

  // Handler untuk delete artisan (super admin only)
  const handleDelete = async () => {
    if (deleting) return
    
    setDeleting(true)
    setError("")
    
    try {
      // SAFETY: cek produk linked dulu
      if (productCount > 0) {
        setError(
          `Tidak bisa hapus. Artisan ini punya ${productCount} produk yang terhubung. ` +
          `Pindahkan produk ke artisan lain atau hapus produk dulu.`
        )
        setDeleting(false)
        setShowDeleteModal(false)
        return
      }
      
      // Log activity SEBELUM delete (supaya nama artisan ter-record)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, role_scope")
          .eq("id", user.id)
          .single()
        
        if (profile) {
          await supabase.from("activity_log").insert({
            actor_id: user.id,
            actor_name: profile.full_name,
            actor_role: profile.role_scope || profile.role,
            action: "delete",
            entity_type: "artisan",
            entity_id: String(artisan.id),
            entity_name: artisan.name,
            description: `Hapus artisan: ${artisan.name}`,
          })
        }
      }
      
      // DELETE artisan
      const { error: deleteError } = await supabase
        .from("artisans")
        .delete()
        .eq("id", artisan.id)
      
      if (deleteError) {
        setError(`Gagal hapus: ${deleteError.message}`)
        setDeleting(false)
        setShowDeleteModal(false)
        return
      }
      
      // Redirect
      router.push("/admin/artisans")
      router.refresh()
      
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // GUARD: cegah double-submit
    if (loading) return

    setLoading(true)
    setError("")

    try {
      // Upload photo baru jika ada
      let newPhotoUrl: string | null = null
      if (photoFile) {
        newPhotoUrl = await uploadPhoto()
        if (!newPhotoUrl) {
          setLoading(false)
          return
        }
      }

      // Build update payload
      const updatePayload: any = {
        slug,
        name,
        location,
        craft_type: craftType,
        bio_en: bioEn,
        bio_id: bioId,
        is_active: isActive,
      }

      if (newPhotoUrl) {
        updatePayload.photo_url = newPhotoUrl
      }

      const { error: updateError } = await supabase
        .from("artisans")
        .update(updatePayload)
        .eq("id", artisan.id)

      if (updateError) {
        setError(`Gagal update: ${updateError.message}`)
        setLoading(false)
        return
      }

      await logUpdateActivity(newPhotoUrl)

      router.push("/admin/artisans")
      router.refresh()
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
      setLoading(false)
    }
  }

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-6">
        <Link
          href="/admin/artisans"
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Back to Artisans</span>
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2 mt-2">
        Edit Artisan
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Update artisan profile or status di keluarga DZAN
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION 1: Identity */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Artisan Identity
          </p>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Slug (auto-generated)
            </label>
            <input
              type="text"
              value={slug}
              readOnly
              className="w-full bg-dzan-stone/10 border border-dzan-brown/20 rounded-sm p-2 text-sm text-dzan-stone"
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
        </div>

        {/* SECTION 2: Craft */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Craft
          </p>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Craft Type *
            </label>
            <input
              type="text"
              value={craftType}
              onChange={(e) => setCraftType(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
        </div>

        {/* SECTION 3: Bio */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Story & Bio
          </p>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Bio (English) *
            </label>
            <textarea
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              required
              rows={3}
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Bio (Indonesian) *
            </label>
            <textarea
              value={bioId}
              onChange={(e) => setBioId(e.target.value)}
              required
              rows={3}
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
        </div>

        {/* SECTION 4: Photo */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Photo
          </p>

          <div className="relative w-full aspect-square bg-dzan-warm rounded-sm overflow-hidden">
            <img
              src={photoPreview || existingPhotoUrl || "/logo-dzan.png"}
              alt="Artisan preview"
              className={`w-full h-full ${
                !photoPreview && !existingPhotoUrl
                  ? "object-contain p-8"
                  : "object-cover"
              }`}
            />
            <span className="absolute top-2 left-2 bg-dzan-earth/85 text-dzan-cream text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-full">
              {photoPreview
                ? "New Preview"
                : existingPhotoUrl
                  ? "Current Photo"
                  : "DZAN Logo (Default)"}
            </span>
          </div>

          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="w-full text-sm text-dzan-earth"
            />
            <p className="text-[10px] text-dzan-stone italic mt-1">
              Kosongkan jika tidak ingin mengubah foto. Max 5 MB.
              {!existingPhotoUrl &&
                " Upload foto untuk ganti logo DZAN dengan foto artisan."}
            </p>
          </div>
        </div>

        {/* SECTION 5: Status di Keluarga DZAN — CARD KHUSUS */}
        <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-5 space-y-3">
          <div>
            <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
              🌿 Bagian dari Keluarga DZAN
            </p>
            <p className="text-[11px] text-dzan-stone mt-1 leading-relaxed italic">
              {artisan.name} adalah keluarga DZAN.
              {productCount > 0 && (
                <>
                  {" "}
                  Tercatat{" "}
                  <span className="text-dzan-earth font-medium not-italic">
                    {productCount} produk
                  </span>{" "}
                  dari artisan ini.
                </>
              )}{" "}
              Toggle hanya menentukan apakah {artisan.name} tampil di pilihan
              saat menambahkan produk baru.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-white/50 rounded-sm p-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-dzan-earth">
              {isActive
                ? "Masih aktif — tampil di dropdown produk baru"
                : "Tidak aktif sementara — tidak tampil di dropdown"}
            </span>
          </label>
        </div>

        {error && <p className="text-xs text-red-600 italic">{error}</p>}

        {/* Submit */}
<button
          type="submit"
          disabled={loading}
          className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* DANGER ZONE — SUPER ADMIN ONLY */}
        {isSuperAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-sm p-4 space-y-3 mt-8">
            <div>
              <p className="text-[10px] tracking-[2px] uppercase text-red-700 font-medium">
                ⚠ Zona Hati-Hati (Super Admin Only)
              </p>
              <p className="text-[11px] text-red-600 mt-1 leading-relaxed">
                Hapus artisan dari database. Aksi ini PERMANEN dan tidak bisa dibatalkan. 
                Gunakan dengan bijak — hanya untuk cleanup data testing atau emergency.
              </p>
              {productCount > 0 && (
                <p className="text-[11px] text-red-600 mt-2 italic">
                  Tidak bisa hapus: artisan ini punya {productCount} produk terhubung.
                </p>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={productCount > 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs tracking-[3px] uppercase py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hapus Artisan
            </button>
          </div>
        )}
      </form>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setShowDeleteModal(false)
            }
          }}
        >
          <div className="bg-dzan-cream rounded-sm p-7 max-w-sm w-full shadow-xl">
            <div className="text-2xl mb-2">⚠️</div>
            
            <h3 className="font-cormorant text-2xl text-dzan-earth mb-3">
              Hapus Artisan?
            </h3>
            
            <p className="text-sm text-dzan-stone mb-4 leading-relaxed">
              Yakin mau hapus <span className="text-dzan-earth font-medium italic">"{artisan.name}"</span> dari database?
            </p>
            
            <p className="text-xs text-dzan-stone/80 mb-6 italic leading-relaxed">
              Ingat filosofi DZAN: "Sekali keluarga, tetaplah keluarga." 
              Hanya hapus kalau ini benar-benar dummy data atau kesalahan input.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[11px] tracking-[2px] uppercase font-medium px-4 py-3 rounded-full transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[11px] tracking-[2px] uppercase font-medium px-4 py-3 rounded-full transition-colors disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Iya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default EditArtisanForm
