// app/admin/products/[id]/photos/PhotosManager.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase-browser"

interface Product {
  id: number
  name_en: string
  name_id: string
  image_url: string
}

interface ProductOption {
  id: number
  name_en: string
}

interface Photo {
  id: number
  product_id: number
  photo_url: string
  sort_order: number
  created_at: string
}

interface PhotosManagerProps {
  product: Product
  allProducts: ProductOption[]
  existingPhotos: Photo[]
}

const MAX_PHOTOS = 8

const PhotosManager = ({
  product,
  allProducts,
  existingPhotos,
}: PhotosManagerProps) => {
  const router = useRouter()
  const supabase = createClient()

  const [photos, setPhotos] = useState<Photo[]>(existingPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const [error, setError] = useState("")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const remainingSlots = MAX_PHOTOS - photos.length

  // Handler ganti produk via dropdown
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (uploading) {
      setError("Tunggu upload selesai sebelum pindah produk.")
      return
    }
    const newProductId = e.target.value
    router.push(`/admin/products/${newProductId}/photos`)
  }

  // Handler upload multiple files
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate jumlah file
    if (files.length > remainingSlots) {
      setError(
        `Maksimal ${remainingSlots} foto lagi (total ${MAX_PHOTOS}). Anda pilih ${files.length}.`
      )
      e.target.value = "" // reset input
      return
    }

    // Validate setiap file
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" terlalu besar (max 5 MB).`)
        e.target.value = ""
        return
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError(
          `File "${file.name}" format tidak didukung. Pakai JPG, PNG, atau WebP.`
        )
        e.target.value = ""
        return
      }
    }

    setUploading(true)
    setError("")

    try {
      const uploadedPhotos: Photo[] = []
      const startOrder =
        photos.length > 0 ? Math.max(...photos.map((p) => p.sort_order)) + 1 : 0

      // Upload each file sequentially (lebih reliable dari parallel)
      setUploadProgress({ current: 0, total: files.length })

      for (let i = 0; i < files.length; i++) {
        setUploadProgress({ current: i + 1, total: files.length })

        const file = files[i]
        const fileExt = file.name.split(".").pop()
        const fileName = `product-${product.id}-${Date.now()}-${i}.${fileExt}`

        // Upload ke storage
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file)

        if (uploadError) {
          setError(`Upload "${file.name}" gagal: ${uploadError.message}`)
          setUploading(false)
          return
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(fileName)

        // Insert ke product_photos
        const { data: newPhoto, error: insertError } = await supabase
          .from("product_photos")
          .insert({
            product_id: product.id,
            photo_url: publicUrl,
            sort_order: startOrder + i,
          })
          .select()
          .single()

        if (insertError) {
          setError(`Save "${file.name}" gagal: ${insertError.message}`)
          setUploading(false)
          return
        }

        uploadedPhotos.push(newPhoto)
      }

      // Update state lokal
      setPhotos([...photos, ...uploadedPhotos])

      // Activity log
      await logActivity(`Upload ${files.length} foto ke ${product.name_en}`)

      // Reset input
      e.target.value = ""
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  // Handler delete photo
  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm(`Yakin hapus foto ini?`)) return

    try {
      // Extract filename dari URL
      const filename = photo.photo_url.split("/products/")[1]?.split("?")[0]

      // Delete dari product_photos
      const { error: deleteError } = await supabase
        .from("product_photos")
        .delete()
        .eq("id", photo.id)

      if (deleteError) {
        setError(`Gagal hapus: ${deleteError.message}`)
        return
      }

      // Delete dari storage (best effort)
      if (filename) {
        try {
          await supabase.storage.from("products").remove([filename])
        } catch (err) {
          console.warn("Storage cleanup failed:", err)
        }
      }

      // Update state lokal
      setPhotos(photos.filter((p) => p.id !== photo.id))

      // Activity log
      await logActivity(`Hapus 1 foto dari ${product.name_en}`)
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
    }
  }

  // Handler drag-drop reorder
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) return

    // Reorder array
    const newPhotos = [...photos]
    const [movedPhoto] = newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(targetIndex, 0, movedPhoto)

    // Update sort_order locally
    const updatedPhotos = newPhotos.map((p, idx) => ({ ...p, sort_order: idx }))
    setPhotos(updatedPhotos)
    setDraggedIndex(null)

    // Batch update sort_order ke database
    try {
      const updates = updatedPhotos.map((p) =>
        supabase
          .from("product_photos")
          .update({ sort_order: p.sort_order })
          .eq("id", p.id)
      )

      await Promise.all(updates)

      // Activity log
      await logActivity(`Reorder foto di ${product.name_en}`)
    } catch (err: any) {
      setError(`Reorder gagal: ${err?.message}`)
    }
  }

  // Activity log helper
  const logActivity = async (description: string) => {
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
        entity_type: "product_photos",
        entity_id: String(product.id),
        entity_name: product.name_en,
        description,
      })
    } catch (err: any) {
      console.error("logActivity failed:", err?.message || err)
    }
  }

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-8">
        <Link
          href={`/admin/products/${product.id}`}
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Back to Product</span>
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2 mt-2">
        Manage Photos
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        {photos.length} dari {MAX_PHOTOS} foto · Drag-drop untuk reorder
      </p>

      {/* Product Switcher */}
      <div className="bg-white rounded-sm p-4 mb-4">
        <label className="text-[9px] tracking-[2px] uppercase text-dzan-stone block mb-2">
          Produk
        </label>
        <select
          value={product.id}
          onChange={handleProductChange}
          disabled={uploading}
          className="w-full text-dzan-dark bg-dzan-cream border border-dzan-brown/20 rounded-sm p-2 text-sm disabled:opacity-50"
        >
          {allProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Main Thumbnail Reference */}
      <div className="bg-white rounded-sm p-4 mb-4">
        <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-2">
          Main Thumbnail (Edit di Product Details)
        </p>
        <div className="relative w-24 h-24 bg-dzan-warm rounded-sm overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name_en}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <p className="text-[10px] text-dzan-stone italic mt-2">
          Foto utama untuk catalog dan thumbnail
        </p>
      </div>

      {/* Upload New Photos */}
      {remainingSlots > 0 && (
        <div className="bg-white rounded-sm p-4 mb-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Upload Foto Detail (Max {remainingSlots} lagi)
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFilesUpload}
            multiple
            disabled={uploading}
            className="w-full text-sm text-dzan-earth disabled:opacity-50"
          />
          <p className="text-[10px] text-dzan-stone italic">
            Pilih beberapa file sekaligus. Max 5 MB per file. JPG/PNG/WebP.
          </p>
          {uploading && uploadProgress && (
            <div className="space-y-2">
              <p className="text-xs text-dzan-amber italic">
                Uploading {uploadProgress.current} of {uploadProgress.total}... jangan tutup halaman ini.
              </p>
              {/* Visual progress bar */}
              <div className="w-full bg-dzan-warm rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-dzan-amber h-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Philosophy Card */}
      <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-4 mb-4">
        <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
          📸 Tiap Sudut Punya Cerita
        </p>
        <p className="text-[11px] text-dzan-stone mt-1 leading-relaxed italic">
          Buyer B2B butuh verify dari berbagai angle. Upload foto depan,
          samping, atas, detail texture, dan in-use untuk membangun trust.
        </p>
      </div>

      {error && <p className="text-xs text-red-600 italic mb-4">{error}</p>}

      {/* Photos Grid */}
      <div className="bg-white rounded-sm p-4">
        <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-3">
          Detail Photos ({photos.length}/{MAX_PHOTOS})
        </p>

        {photos.length === 0 ? (
          <p className="text-sm text-dzan-stone italic text-center py-8">
            Belum ada foto detail. Upload untuk mulai.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative bg-dzan-warm rounded-sm overflow-hidden cursor-move ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <div className="relative aspect-square">
                  <Image
                    src={photo.photo_url}
                    alt={`Photo ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover"
                  />
                </div>

                <div className="absolute top-1 left-1 bg-dzan-earth/85 text-dzan-cream text-[9px] tracking-[1.5px] uppercase px-2 py-0.5 rounded-full">
                  #{index + 1}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-0.5 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default PhotosManager
