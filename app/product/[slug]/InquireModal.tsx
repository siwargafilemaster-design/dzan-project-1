"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"

interface Props {
  productSlug: string
  productName: string
  productId: number
  onClose: () => void
}

const InquireModal = ({ productSlug, productName, productId, onClose }: Props) => {
  const supabase = createClient()
  
  // Profile data
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  
  // Form fields
  const [phone, setPhone] = useState("")
  const [quantity, setQuantity] = useState("")
  const [message, setMessage] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(2)
  const [whatsappUrl, setWhatsappUrl] = useState("")
  
  // Fetch user profile untuk pre-fill
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, country")
        .eq("id", user.id)
        .single()
      
      if (profile) {
        setUserProfile(profile)
        // Pre-fill phone kalau ada di profile
        if ((profile as any).phone) {
          setPhone((profile as any).phone)
        }
      }
      setLoadingProfile(false)
    }
    
    fetchProfile()
  }, [])
  
  // Auto-redirect after success
  useEffect(() => {
    if (!success || !whatsappUrl) return
    
    if (countdown === 0) {
      window.location.href = whatsappUrl
      return
    }
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [success, countdown, whatsappUrl])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!message) {
      setError("Please tell us about your interest")
      return
    }
    
    if (quantity && (isNaN(Number(quantity)) || Number(quantity) < 1)) {
      setError("Quantity must be a positive number")
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          product_slug: productSlug,
          product_name: productName,
          phone: phone || null,
          quantity: quantity ? Number(quantity) : null,
          message,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit inquiry")
      }
      
      setWhatsappUrl(data.whatsapp_url)
      setSuccess(true)
      setLoading(false)
      
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      setLoading(false)
    }
  }
  
  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-sm max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="font-cormorant text-2xl text-dzan-earth mb-3">
            Inquiry Sent!
          </h2>
          <p className="text-sm text-dzan-stone italic mb-6 leading-relaxed">
            Thank you for reaching out to DZAN Lawu Heritage.
            <br />
            Continuing to WhatsApp in {countdown}s...
          </p>
          
          <a
            href={whatsappUrl}
            className="inline-block w-full bg-green-600 text-white text-xs tracking-[3px] uppercase py-4 rounded-sm hover:bg-green-700 transition-colors"
          >
            ⚡ Open WhatsApp Now
          </a>
        </div>
      </div>
    )
  }
  
  // Loading profile
  if (loadingProfile) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-sm p-8">
          <p className="text-sm text-dzan-stone italic">Loading your profile...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-dzan-cream rounded-sm max-w-md w-full my-8">
        {/* Header */}
        <div className="bg-dzan-warm/30 px-6 py-4 border-b border-dzan-brown/10 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-dzan-stone hover:text-dzan-earth text-xl"
          >
            ✕
          </button>
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-1">
            Inquire
          </p>
          <h2 className="font-cormorant text-2xl text-dzan-earth italic">
            {productName}
          </h2>
          <p className="text-xs text-dzan-stone italic mt-1">
            Hi, {userProfile?.full_name?.split(" ")[0] || "there"}! 
            Let's start our conversation.
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info Display (read-only) */}
          <div className="bg-white border border-dzan-brown/20 rounded-sm p-3">
            <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-2">
              Your Info
            </p>
            <div className="space-y-1">
              <p className="text-sm text-dzan-earth">
                {userProfile?.full_name || "—"}
              </p>
              <p className="text-xs text-dzan-stone">
                {userProfile?.email}
              </p>
              {userProfile?.country && (
                <p className="text-xs text-dzan-stone">
                  {userProfile.country}
                </p>
              )}
            </div>
            <p className="text-[10px] text-dzan-stone italic mt-2">
              Edit at <span className="text-dzan-amber">/account</span>
            </p>
          </div>
          
          {/* Phone (Optional) */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Phone / WhatsApp <span className="text-dzan-stone">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
              placeholder="+62 812 xxxx xxxx"
            />
          </div>
          
          {/* Quantity (Optional) */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Quantity Interest <span className="text-dzan-stone">(optional)</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
              placeholder="Number of pieces"
            />
          </div>
          
          {/* Message */}
          <div>
            <label className="text-[10px] tracking-[2px] uppercase text-dzan-amber block mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth resize-none"
              placeholder="Tell us about your interest — timeline, questions, or specifications..."
            />
          </div>
          
          {/* Info card */}
          <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-3">
            <p className="text-[11px] text-dzan-earth italic">
              💡 After submitting, you'll be redirected to WhatsApp 
              to continue the conversation with our team.
            </p>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm p-3">
              <p className="text-xs text-red-700 italic">{error}</p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 text-[11px] tracking-[2px] uppercase text-dzan-stone py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-dzan-earth text-dzan-cream text-[11px] tracking-[2px] uppercase py-3 rounded-sm disabled:opacity-50 hover:bg-dzan-brown transition-colors"
            >
              {loading ? "Sending..." : "Send Inquiry →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InquireModal