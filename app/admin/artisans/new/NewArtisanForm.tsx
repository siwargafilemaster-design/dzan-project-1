// app/admin/artisans/new/NewArtisanForm.tsx

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
    .replace(/[^a-z0-9\s-]/g, "") // hapus karakter non-alphanumeric
    .replace(/\s+/g, "-") // spasi → dash
    .replace(/-+/g, "-") // multiple dash → single
    .replace(/^-+|-+$/g, "") // hapus dash awal/akhir
}

const NewArtisanForm = () => {
  const router = useRouter()
  const supabase = createClient()

  // State form
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [location, setLocation] = useState("")
  const [craftType, setCraftType] = useState("")
  const [bioEn, setBioEn] = useState("")
  const [bioId, setBioId] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Image state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // UI feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-generate composite slug saat name/craft/location berubah
  useEffect(() => {
    if (name && craftType && location) {
      setSlug(generateSlug(name, craftType, location))
    } else if (name) {
      // Fallback: kalau craft/location belum diisi, pakai name saja
      setSlug(generateSlug(name, "", ""))
    }
  }, [name, craftType, location])

  // Handler image
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

  // Upload photo
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

  // Activity log
  const logActivity = async (
    artisanId: string | number,
    artisanName: string
  ) => {
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
        action: "create",
        entity_type: "artisan",
        entity_id: String(artisanId),
        entity_name: artisanName,
        description: `Tambah artisan baru: ${artisanName}`,
      })
    } catch (err: any) {
      console.error("logActivity failed:", err?.message || err)
    }
  }

  //SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // GUARD: cegah double-submit
    if (loading) return

    setLoading(true)
    setError("")

    try {
      // Upload photo HANYA jika user pilih file
      let photoUrl: string | null = null
      if (photoFile) {
        photoUrl = await uploadPhoto()
        if (!photoUrl) {
          setLoading(false)
          return
        }
      }

      // Insert artisan
      const { data: newArtisan, error: insertError } = await supabase
        .from("artisans")
        .insert({
          slug,
          name,
          location,
          craft_type: craftType,
          bio_en: bioEn,
          bio_id: bioId,
          photo_url: photoUrl, // ← null kalau tidak upload
          is_active: isActive,
        })
        .select()
        .single()

      if (insertError) {
        setError(`Gagal simpan: ${insertError.message}`)
        setLoading(false)
        return
      }

      // Log activity
      await logActivity(newArtisan.id, name)

      // Redirect
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
        Add New Artisan
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Welcome a new keeper of heritage into DZAN family
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
              placeholder="e.g. Pak Anton"
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
              placeholder="e.g. Mojogedang, Karanganyar"
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
              placeholder="e.g. Bambu, Batik, Kayu, Rotan"
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
              placeholder="Tell the artisan's story in English..."
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
              placeholder="Cerita artisan dalam bahasa Indonesia..."
            />
          </div>
        </div>

        {/* SECTION 4: Photo (Optional) */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Photo
          </p>
          <p className="text-[10px] text-dzan-stone italic">
            Opsional. Kalau belum ada foto, kami akan tampilkan logo DZAN
            sebagai placeholder. Bisa di-upload nanti saat sudah siap.
          </p>

          {photoPreview && (
            <div className="relative w-full aspect-square bg-dzan-warm rounded-sm overflow-hidden">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="w-full text-sm text-dzan-earth"
            />
            <p className="text-[10px] text-dzan-stone italic mt-1">
              Max 5 MB. Format: JPG, PNG, WebP. Kosongkan untuk pakai logo DZAN.
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
              Semua artisan adalah keluarga DZAN, tapi mungkin ada yang tidak
              aktif sementara karena alasan personal atau profesional.
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
              Artisan aktif di DZAN Family? Artisan akan ditampilkan sebagai
              Family aktif
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
          {loading ? "Saving..." : "Welcome to DZAN Family"}
        </button>
      </form>
    </main>
  )
}

export default NewArtisanForm
