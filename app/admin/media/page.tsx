"use client"

import { createClient } from "@/lib/supabase-browser"
import { useEffect, useState } from "react"
import Link from "next/link"

const MediaUploadPage = () => {
  const supabase = createClient()
  const [currentVideo, setCurrentVideo] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("hero_setting")
        .select("video_url")
        .single()
      if (data) setCurrentVideo(data.video_url)
    }
    load()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage("")

    const fileName = `hero-${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from("media")
      .upload(`hero/${fileName}`, file)

    if (error) {
      setMessage(`Error: ${error.message}`)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(`hero/${fileName}`)

    // Update hero_setting
    const { error: updateError } = await supabase
      .from("hero_setting")
      .update({ video_url: publicUrl })
      .eq("id", 1)

    if (updateError) {
      setMessage(`Error updating: ${updateError.message}`)
    } else {
      setCurrentVideo(publicUrl)
      setMessage("✅ Hero video updated successfully!")
    }

    setUploading(false)
  }

  return (
    <main className="bg-dzan-cream min-h-screen pt-16 pb-20 px-6">
      <div className="py-6">
        <Link href="/admin" className="text-xs text-dzan-stone">
          ← Dashboard
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
        Hero Video
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Update the main video on landing page
      </p>

      {/* Current Video Preview */}
      {currentVideo && (
        <div className="bg-white rounded-sm p-4 mb-6">
          <p className="text-[10px] uppercase tracking-[2px] text-dzan-amber mb-2">
            Current Video
          </p>
          <video
            src={currentVideo}
            controls
            className="w-full rounded-sm"
          />
        </div>
      )}

      {/* Upload */}
      <div className="bg-white rounded-sm p-6 text-center border-2 border-dashed border-dzan-brown/20">
        <p className="text-4xl mb-2">🎬</p>
        <p className="text-sm text-dzan-earth mb-2">Upload New Hero Video</p>
        <p className="text-[10px] text-dzan-stone mb-4">
          MP4, max 50MB recommended
        </p>

        <label className="inline-block bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase px-6 py-3 rounded-sm cursor-pointer">
          {uploading ? "Uploading..." : "Choose File"}
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {message && (
          <p className="text-xs mt-4 italic text-dzan-brown">{message}</p>
        )}
      </div>
    </main>
  )
}

export default MediaUploadPage