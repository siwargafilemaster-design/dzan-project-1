"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"

interface Comment {
  id: string
  comment: string
  commenter_name: string
  created_at: string
}

interface ActivityDiscussModalProps {
  activityId: string | null
  activityDescription: string
  activityActor: string
  onClose: () => void
}

const ActivityDiscussModal = ({
  activityId,
  activityDescription,
  activityActor,
  onClose,
}: ActivityDiscussModalProps) => {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!activityId) return

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("activity_comments")
        .select("id, comment, commenter_name, created_at")
        .eq("activity_id", activityId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Fetch comments error:", error.message)
        return
      }

      setComments(data || [])
    }

    fetchComments()
  }, [activityId, supabase])

  const handleSubmit = async () => {
    if (!newComment.trim() || !activityId) return

    setLoading(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("User tidak ditemukan")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()

    if (!profile?.full_name) {
      setError("Profile tidak ditemukan")
      setLoading(false)
      return
    }

    const { data: inserted, error: insertError } = await supabase
      .from("activity_comments")
      .insert({
        activity_id: activityId,
        commenter_id: user.id,
        commenter_name: profile.full_name,
        comment: newComment.trim(),
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setComments([...comments, inserted])
    setNewComment("")
    setLoading(false)
  }

  if (!activityId) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-dzan-cream w-full sm:max-w-md max-h-[85vh] sm:rounded-sm rounded-t-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-dzan-brown/10">
          <p className="text-[9px] tracking-[2px] uppercase text-dzan-amber mb-1">
            Discuss Activity
          </p>
          <p className="text-sm text-dzan-earth font-medium">
            {activityActor}
          </p>
          <p className="text-xs text-dzan-stone mt-1 italic">
            {activityDescription}
          </p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-dzan-stone italic text-center py-8">
              Belum ada diskusi — jadilah yang pertama berkomentar
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-sm p-3 border-l-2 border-dzan-amber/50"
              >
                <p className="text-xs text-dzan-brown font-medium">
                  {c.commenter_name}
                </p>
                <p className="text-sm text-dzan-earth mt-1">{c.comment}</p>
                <p className="text-[10px] text-dzan-stone mt-1">
                  {new Date(c.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Jakarta",
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <div className="px-6 py-4 border-t border-dzan-brown/10 bg-white">
          {error && (
            <p className="text-xs text-red-600 italic mb-2">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Tulis komentar..."
              disabled={loading}
              className="flex-1 bg-dzan-cream border border-dzan-brown/20 rounded-sm px-3 py-2 text-sm text-dzan-earth"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !newComment.trim()}
              className="bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase px-4 py-2 rounded-sm disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 text-xs text-dzan-stone tracking-[2px] uppercase py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActivityDiscussModal