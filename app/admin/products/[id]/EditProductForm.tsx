"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

// Helper untuk auto-generate slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface Artisan {
  id: number
  name: string
}

interface Product {
  id: number
  slug: string
  name_en: string
  name_id: string
  desc_en: string
  desc_id: string
  category: string
  artisan_id: number
  material: string
  moq: number
  price_usd: number
  image_url: string
  is_available: boolean
  is_featured: boolean
}

interface EditProductFormProps {
  product: Product
  artisans: Artisan[]
}

const EditProductForm = ({ product, artisans }: EditProductFormProps) => {
  const router = useRouter()
  const supabase = createClient()
  
  // Pre-fill state dari existing product
  const [nameEn, setNameEn] = useState(product.name_en)
  const [nameId, setNameId] = useState(product.name_id)
  const [slug, setSlug] = useState(product.slug)
  const [descEn, setDescEn] = useState(product.desc_en)
  const [descId, setDescId] = useState(product.desc_id)
  const [category, setCategory] = useState(product.category)
  const [artisanId, setArtisanId] = useState(String(product.artisan_id))
  const [material, setMaterial] = useState(product.material)
  const [moq, setMoq] = useState(String(product.moq))
  const [priceUsd, setPriceUsd] = useState(String(product.price_usd))
  const [isAvailable, setIsAvailable] = useState(product.is_available)
  const [isFeatured, setIsFeatured] = useState(product.is_featured)
  
  // Image state — optional replace
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const existingImageUrl = product.image_url
  
  // UI feedback state
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Auto-update slug saat name_en berubah
  useEffect(() => {
    if (nameEn) {
      setSlug(generateSlug(nameEn))
    }
  }, [nameEn])

  // Handler image file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError("File terlalu besar (max 5 MB)")
      return
    }
    
    setImageFile(file)
    setError("")
    
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // Upload new image (only if user selected new file)
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null
    
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile)
    
    if (error) {
      setError(`Upload gagal: ${error.message}`)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(fileName)
    
    return publicUrl
  }

  // Build activity log description (Hybrid format)
  const buildUpdateDescription = (newImageUrl: string | null): string => {
    const changes: string[] = []
    
    // Detail untuk field penting
    if (parseFloat(priceUsd) !== product.price_usd) {
      changes.push(`Harga $${product.price_usd} → $${priceUsd}`)
    }
    
    if (parseInt(moq) !== product.moq) {
      changes.push(`MOQ ${product.moq} → ${moq}`)
    }
    
    if (isAvailable !== product.is_available) {
      changes.push(
        isAvailable 
          ? "Tampilkan di katalog" 
          : "Sembunyikan dari katalog"
      )
    }
    
    if (isFeatured !== product.is_featured) {
      changes.push(
        isFeatured 
          ? "Jadikan featured" 
          : "Hapus dari featured"
      )
    }
    
    if (newImageUrl) {
      changes.push("Update foto produk")
    }
    
    // Build description
    if (changes.length === 0) {
      return `Update produk: ${nameEn}`
    }
    
    return `Update produk: ${nameEn} — ${changes.join(", ")}`
  }

  // Log activity for update
  const logUpdateActivity = async (newImageUrl: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
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
        entity_type: "product",
        entity_id: String(product.id),
        entity_name: nameEn,
        description: buildUpdateDescription(newImageUrl),
      })
    } catch (err: any) {
      console.error("logUpdateActivity failed:", err?.message || err)
    }
  }

  // Log activity for delete
  const logDeleteActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
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
        action: "delete",
        entity_type: "product",
        entity_id: String(product.id),
        entity_name: product.name_en,
        description: `Hapus produk: ${product.name_en}`,
      })
    } catch (err: any) {
      console.error("logDeleteActivity failed:", err?.message || err)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError("")
  
  try {
    let newImageUrl: string | null = null
    
    if (imageFile) {
      newImageUrl = await uploadImage()
      
      if (!newImageUrl) {
        setLoading(false)
        return
      }
    } else {
    }
    
    const updatePayload: any = {
      slug,
      name_en: nameEn,
      name_id: nameId,
      desc_en: descEn,
      desc_id: descId,
      category,
      artisan_id: parseInt(artisanId),
      material,
      moq: parseInt(moq),
      price_usd: parseFloat(priceUsd),
      is_available: isAvailable,
      is_featured: isFeatured,
    }
    
    if (newImageUrl) {
      updatePayload.image_url = newImageUrl
    }
    
    const { error: updateError } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", product.id)
    
    if (updateError) {
      setError(`Gagal update: ${updateError.message}`)
      setLoading(false)
      return
    }
    
    await logUpdateActivity(newImageUrl)
    
    router.push("/admin/products")
    router.refresh()
    
  } catch (err: any) {
    setError(`Error: ${err?.message || "Unknown error"}`)
    setLoading(false)
  }
}

const handleDelete = async () => {
  setDeleting(true)
  setError("")
  
  try {
    await logDeleteActivity()
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
    
    if (deleteError) {
      setError(`Gagal hapus: ${deleteError.message}`)
      setDeleting(false)
      setShowDeleteModal(false)
      return
    }
    
    router.push("/admin/products")
    router.refresh()
    
  } catch (err: any) {
    setError(`Error: ${err?.message || "Unknown error"}`)
    setDeleting(false)
    setShowDeleteModal(false)
  }
}

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-6">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Header */}
      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2 mt-2">
        Edit Product
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Update product details or remove from catalog
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* SECTION 1: Product Identity */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Product Identity
          </p>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Name (English) *
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Name (Indonesian) *
            </label>
            <input
              type="text"
              value={nameId}
              onChange={(e) => setNameId(e.target.value)}
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
        </div>

        {/* SECTION 2: Description */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Description
          </p>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Description (English) *
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              required
              rows={3}
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Description (Indonesian) *
            </label>
            <textarea
              value={descId}
              onChange={(e) => setDescId(e.target.value)}
              required
              rows={3}
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
        </div>

        {/* SECTION 3: Category & Artisan */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Category & Artisan
          </p>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Category *
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Artisan *
            </label>
            <select
              value={artisanId}
              onChange={(e) => setArtisanId(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            >
              <option value="">-- Select Artisan --</option>
              {artisans.map((artisan) => (
                <option key={artisan.id} value={artisan.id}>
                  {artisan.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 4: Specifications */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Specifications
          </p>
          
          <div>
            <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
              Material *
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
              className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
                MOQ (pcs) *
              </label>
              <input
                type="number"
                value={moq}
                onChange={(e) => setMoq(e.target.value)}
                required
                min="1"
                className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-1">
                Price USD *
              </label>
              <input
                type="number"
                step="0.01"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                required
                min="0"
                className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Image */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Product Image
          </p>
          
          {/* Preview — show new if uploaded, else show existing */}
          <div className="relative w-full aspect-square bg-dzan-warm rounded-sm overflow-hidden">
            <img
              src={imagePreview || existingImageUrl}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-dzan-earth/85 text-dzan-cream text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-full">
              {imagePreview ? "New Preview" : "Current Image"}
            </span>
          </div>
          
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-dzan-earth"
            />
            <p className="text-[10px] text-dzan-stone italic mt-1">
              Kosongkan jika tidak ingin mengubah foto. Max 5 MB. Format: JPG, PNG, WebP.
            </p>
          </div>
        </div>

        {/* SECTION 6: Status */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Status
          </p>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <span className="text-sm text-dzan-earth">
              Available (show in catalog)
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <span className="text-sm text-dzan-earth">
              Featured (highlighted product)
            </span>
          </label>
        </div>

        {error && (
          <p className="text-xs text-red-600 italic">{error}</p>
        )}

        {/* MANAGE PHOTOS SECTION */}
        <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-4 space-y-3">
          <div>
            <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
              📸 Detail Photos
            </p>
            <p className="text-[11px] text-dzan-stone mt-1 italic">
              Kelola foto detail dari berbagai angle untuk produk ini.
            </p>
          </div>
          
          <Link
            href={`/admin/products/${product.id}/photos`}
            className="block w-full bg-dzan-sage hover:opacity-90 text-white text-xs tracking-[2px] uppercase text-center py-3 rounded-sm transition-opacity"
          >
            Manage Photos →
          </Link>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {/* DANGER ZONE */}
        <div className="bg-red-50 border border-red-200 rounded-sm p-4 space-y-3 mt-8">
          <div>
            <p className="text-[10px] tracking-[2px] uppercase text-red-700 font-medium">
              ⚠ Zona Hati-Hati
            </p>
            <p className="text-[11px] text-red-600 mt-1">
              Aksi ini permanen, hati-hati ya
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs tracking-[3px] uppercase py-3 rounded-sm transition-colors"
          >
            Hapus Produk
          </button>
        </div>
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
              Hapus Produk?
            </h3>
            
            <p className="text-sm text-dzan-stone mb-6 leading-relaxed">
              Yakin mau hapus <span className="text-dzan-earth font-medium italic">"{product.name_en}"</span>?
              Setelah dihapus tidak bisa dibatalkan lho.
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

export default EditProductForm