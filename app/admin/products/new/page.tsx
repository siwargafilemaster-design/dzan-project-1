"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

// Helper untuk auto-generate slug dari nama
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")  // hapus karakter non-alphanumeric
    .replace(/\s+/g, "-")           // spasi → dash
    .replace(/-+/g, "-")            // multiple dash → single dash
    .replace(/^-+|-+$/g, "")        // hapus dash di awal/akhir
}

interface Artisan {
  id: number
  name: string
}

const NewProductPage = () => {
  const router = useRouter()
  const supabase = createClient()
  
  // State untuk semua field form
  const [nameEn, setNameEn] = useState("")
  const [nameId, setNameId] = useState("")
  const [slug, setSlug] = useState("")
  const [descEn, setDescEn] = useState("")
  const [descId, setDescId] = useState("")
  const [category, setCategory] = useState("")
  const [artisanId, setArtisanId] = useState("")
  const [material, setMaterial] = useState("")
  const [moq, setMoq] = useState("")
  const [priceUsd, setPriceUsd] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  
  // State untuk image upload
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // State untuk artisans dropdown
  const [artisans, setArtisans] = useState<Artisan[]>([])
  
  // State untuk UI feedback
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch artisans untuk dropdown saat page mount
  useEffect(() => {
    const fetchArtisans = async () => {
      const { data, error } = await supabase
        .from("artisans")
        .select("id, name")
        .eq("is_active", true)
        .order("name")
      
      if (error) {
        console.error("Failed to fetch artisans:", error.message)
        return
      }
      
      setArtisans(data || [])
    }
    
    fetchArtisans()
  }, [supabase])

  // Auto-generate slug saat name_en berubah
  useEffect(() => {
    if (nameEn) {
      setSlug(generateSlug(nameEn))
    }
  }, [nameEn])

  // Handler saat user pilih file image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File terlalu besar (max 5 MB)")
      return
    }
    
    setImageFile(file)
    setError("")
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // Upload image ke Supabase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null
    
    // Generate unique filename: timestamp.ext
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, imageFile)
    
    if (error) {
      setError(`Upload gagal: ${error.message}`)
      return null
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(fileName)
    
    return publicUrl
  }

  // Auto-log activity setelah insert sukses
  const logActivity = async (productId: string, productName: string) => {
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
        action: "create",
        entity_type: "product",
        entity_id: productId,
        entity_name: productName,
        description: `Tambah produk baru: ${productName}`,
      })
    } catch (err: any) {
      // Silent fail — jangan block parent operation
      console.error("logActivity failed:", err?.message || err)
    }
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    // Validate image
    if (!imageFile) {
      setError("Foto produk wajib diisi")
      setLoading(false)
      return
    }
    
    try {
      // Step 1: Upload image dulu
      const imageUrl = await uploadImage()
      if (!imageUrl) {
        setLoading(false)
        return
      }
      
      // Step 2: Insert ke database products
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
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
          image_url: imageUrl,
          is_available: isAvailable,
          is_featured: isFeatured,
        })
        .select()
        .single()
      
      if (insertError) {
        setError(`Gagal simpan: ${insertError.message}`)
        setLoading(false)
        return
      }
      
      // Step 3: Auto-log activity
      await logActivity(newProduct.id, nameEn)
      
      // Step 4: Redirect ke list products
      router.push("/admin/products")
      router.refresh()
      
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
      setLoading(false)
    }
  }

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link — inline pill button dengan sage background */}
      <div className="py-8">
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
        Add New Product
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Fill all fields to add a new product to catalog
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
              placeholder="e.g. Bamboo Tumbler Lawu"
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
              placeholder="e.g. Tumbler Bambu Lawu"
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
              placeholder="bamboo-tumbler-lawu"
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
              placeholder="Tell the story of this product..."
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
              placeholder="Cerita produk dalam bahasa Indonesia..."
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
              placeholder="e.g. Bambu, Batik, Kayu, Rotan, etc."
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
            {artisans.length === 0 && (
              <p className="text-[10px] text-dzan-stone italic mt-1">
                Belum ada artisan. Tambah di /admin/artisans dulu.
              </p>
            )}
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
              placeholder="e.g. Bambu Apus, Cotton Primissima"
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
                placeholder="20"
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
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Image Upload */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Product Image *
          </p>
          
          {/* Preview */}
          {imagePreview && (
            <div className="relative w-full aspect-square bg-dzan-warm rounded-sm overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* File input */}
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-dzan-earth"
            />
            <p className="text-[10px] text-dzan-stone italic mt-1">
              Max 5 MB. Format: JPG, PNG, WebP
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

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-600 italic">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </main>
  )
}

export default NewProductPage