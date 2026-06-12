// app/admin/media/MediaForm.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

interface HeroSetting {
  id: number
  video_url: string
}

interface MediaFormProps {
  heroSetting: HeroSetting
}

const MediaForm = ({ heroSetting }: MediaFormProps) => {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  
  // UI feedback
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  // Handler video file
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate size (max 50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setError(`File terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.`)
      return
    }
    
    // Validate type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"]
    if (!allowedTypes.includes(file.type)) {
      setError(`Format tidak didukung: ${file.type}. Pakai MP4, WebM, atau MOV.`)
      return
    }
    
    setVideoFile(file)
    setError("")
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setVideoPreview(previewUrl)
  }

  // Extract filename dari URL Supabase
  const extractFilename = (url: string): string | null => {
    try {
      // URL format: https://xxx.supabase.co/storage/v1/object/public/videos/FILENAME
      const parts = url.split("/videos/")
      if (parts.length < 2) return null
      return parts[1].split("?")[0]  // remove query params
    } catch {
      return null
    }
  }

  // Upload video baru
  const uploadVideo = async (): Promise<string | null> => {
    if (!videoFile) return null
    
    const fileExt = videoFile.name.split(".").pop()
    const fileName = `hero-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, videoFile)
    
    if (uploadError) {
      setError(`Upload gagal: ${uploadError.message}`)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName)
    
    return publicUrl
  }

  // Delete file lama dari storage
  const deleteOldVideo = async (oldUrl: string) => {
    const oldFilename = extractFilename(oldUrl)
    if (!oldFilename) return  // Gracefully skip jika URL tidak valid
    
    try {
      await supabase.storage
        .from("videos")
        .remove([oldFilename])
    } catch (err) {
      // Log only, don't block flow
      console.warn("Failed to delete old video:", err)
    }
  }

  // Activity log
  const logActivity = async () => {
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
        entity_type: "hero_video",
        entity_id: String(heroSetting.id),
        entity_name: "Hero Video Homepage",
        description: "Ganti hero video di homepage",
      })
    } catch (err: any) {
      console.error("logActivity failed:", err?.message || err)
    }
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploading) return
    if (!videoFile) {
      setError("Pilih video baru dulu sebelum simpan.")
      return
    }
    
    setUploading(true)
    setError("")
    
    try {
      // Upload video baru
      const newVideoUrl = await uploadVideo()
      if (!newVideoUrl) {
        setUploading(false)
        return
      }
      
      // UPDATE hero_setting
      const { error: updateError } = await supabase
        .from("hero_setting")
        .update({ video_url: newVideoUrl })
        .eq("id", heroSetting.id)
      
      if (updateError) {
        setError(`Gagal update: ${updateError.message}`)
        setUploading(false)
        return
      }
      
      // Log activity
      await logActivity()
      
      // Delete video lama (best effort)
      await deleteOldVideo(heroSetting.video_url)
      
      // Redirect ke admin
      router.push("/admin")
      router.refresh()
      
    } catch (err: any) {
      setError(`Error: ${err?.message || "Unknown error"}`)
      setUploading(false)
    }
  }

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-8">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Dashboard</span>
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2 mt-2">
        Hero Video
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Video di homepage. Upload baru untuk replace yang lama.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* SECTION 1: Current Video Preview */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Video Sekarang
          </p>
          
          <div className="relative w-full aspect-video bg-dzan-warm rounded-sm overflow-hidden">
            <video
              src={heroSetting.video_url}
              controls
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-dzan-earth/85 text-dzan-cream text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-full">
              Live di Homepage
            </span>
          </div>
        </div>

        {/* SECTION 2: Upload New Video */}
        <div className="bg-white rounded-sm p-4 space-y-3">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber">
            Video Baru
          </p>
          <p className="text-[11px] text-dzan-stone italic leading-relaxed">
            Upload video baru untuk replace yang sekarang. Video lama akan otomatis 
            terhapus dari storage setelah upload berhasil.
          </p>
          
          {/* Preview new video */}
          {videoPreview && (
            <div className="relative w-full aspect-video bg-dzan-warm rounded-sm overflow-hidden">
              <video
                src={videoPreview}
                controls
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-dzan-amber text-white text-[9px] tracking-[1.5px] uppercase px-2.5 py-1 rounded-full">
                Preview (Belum Live)
              </span>
            </div>
          )}
          
          <div>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoChange}
              className="w-full text-sm text-dzan-earth"
            />
            <p className="text-[10px] text-dzan-stone italic mt-1">
              Max 50 MB. Format: MP4, WebM, MOV. Resolusi optimal: 1080p atau 720p.
            </p>
            <p className="text-[10px] text-dzan-stone italic mt-1">
              Tips: kompres video dulu (target 3-10 MB) untuk loading cepat.
            </p>
          </div>
        </div>

        {/* SECTION 3: Filosofi Reminder */}
        <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-4">
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
            🎬 Always Forward, Always Fresh
          </p>
          <p className="text-[11px] text-dzan-stone mt-1 leading-relaxed italic">
            DZAN heritage timeless, tapi visual brand selalu segar. 
            Video lama digantikan video baru — bukan menumpuk. 
            Storage hemat = fokus ke material dan craft.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 italic">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !videoFile}
          className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Replace Hero Video"}
        </button>
      </form>
    </main>
  )
}

export default MediaForm