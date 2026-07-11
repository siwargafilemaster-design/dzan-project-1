"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import InquireModal from "./InquireModal"

interface Props {
  productSlug: string
  productName: string
  productId: number
}

const InquireButton = ({ productSlug, productName, productId }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [showModal, setShowModal] = useState(false)
  const [checking, setChecking] = useState(false)
  
  // Auto-open modal kalau ?openInquiry=true (after login redirect)
  useEffect(() => {
    const shouldOpen = searchParams.get("openInquiry") === "true"
    if (shouldOpen) {
      // Verify user is authenticated
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setShowModal(true)
          // Clean URL (remove ?openInquiry=true)
          router.replace(`/product/${productSlug}`)
        }
      })
    }
  }, [searchParams])
  
  const handleClick = async () => {
    setChecking(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push(`/login?redirect=/product/${productSlug}&action=inquire`)
      return
    }
    
    setShowModal(true)
    setChecking(false)
  }
  
  return (
    <>
      <button
        onClick={handleClick}
        disabled={checking}
        className="w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm hover:bg-dzan-brown transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span>💌</span>
        <span>{checking ? "Loading..." : "Inquire"}</span>
      </button>
      
      {showModal && (
        <InquireModal
          productSlug={productSlug}
          productName={productName}
          productId={productId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

export default InquireButton