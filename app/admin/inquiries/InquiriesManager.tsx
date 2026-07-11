"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

type InquiryStatus = "new" | "contacted" | "closed" | "archived"

interface Inquiry {
  id: number
  product_id: number | null
  product_slug: string | null
  product_name: string | null
  buyer_name: string | null
  buyer_email: string | null
  phone: string | null
  quantity: number | null
  message: string | null
  status: InquiryStatus
  notes: string | null
  created_at: string
  contacted_at: string | null
  closed_at: string | null
}

interface Props {
  initialInquiries: Inquiry[]
  viewerRole: string
}

const InquiriesManager = ({ initialInquiries, viewerRole }: Props) => {
  const supabase = createClient()
  
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)
  const [filter, setFilter] = useState<InquiryStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  
  // Filter + search
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      if (filter !== "all" && inq.status !== filter) return false
      
      if (search) {
        const q = search.toLowerCase()
        const matches = 
          (inq.buyer_name?.toLowerCase().includes(q)) ||
          (inq.buyer_email?.toLowerCase().includes(q)) ||
          (inq.product_name?.toLowerCase().includes(q)) ||
          (inq.message?.toLowerCase().includes(q))
        if (!matches) return false
      }
      
      return true
    })
  }, [inquiries, filter, search])
  
  // Stats
  const stats = useMemo(() => {
    return {
      new: inquiries.filter(i => i.status === "new").length,
      contacted: inquiries.filter(i => i.status === "contacted").length,
      closed: inquiries.filter(i => i.status === "closed").length,
      archived: inquiries.filter(i => i.status === "archived").length,
    }
  }, [inquiries])
  
  // Status update
  const updateStatus = async (id: number, newStatus: InquiryStatus) => {
    setActionLoading(id)
    
    const updates: any = { status: newStatus }
    if (newStatus === "contacted") updates.contacted_at = new Date().toISOString()
    if (newStatus === "closed") updates.closed_at = new Date().toISOString()
    
    const { error } = await supabase
      .from("inquiries")
      .update(updates)
      .eq("id", id)
    
    if (error) {
      alert(`Failed: ${error.message}`)
      setActionLoading(null)
      return
    }
    
    setInquiries(inquiries.map(inq => 
      inq.id === id ? { ...inq, ...updates } : inq
    ))
    setActionLoading(null)
  }
  
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this inquiry permanently? This cannot be undone.")) return
    
    setActionLoading(id)
    
    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", id)
    
    if (error) {
      alert(`Failed: ${error.message}`)
      setActionLoading(null)
      return
    }
    
    setInquiries(inquiries.filter(inq => inq.id !== id))
    setActionLoading(null)
  }
  
  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }
  
  // Status badge config
  const getStatusBadge = (status: InquiryStatus) => {
    const config = {
      new: { icon: "🔴", label: "NEW", color: "bg-red-100 text-red-700" },
      contacted: { icon: "🟡", label: "CONTACTED", color: "bg-amber-100 text-amber-700" },
      closed: { icon: "🟢", label: "CLOSED", color: "bg-green-100 text-green-700" },
      archived: { icon: "⚪", label: "ARCHIVED", color: "bg-gray-100 text-gray-500" },
    }
    return config[status]
  }
  
  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-12 px-6">
      {/* Back */}
      <div className="py-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full"
        >
          <span>←</span><span>Dashboard</span>
        </Link>
      </div>
      
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-2">
          Our Conversations
        </p>
        <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
          Inquiries
        </h1>
        <p className="text-xs text-dzan-stone italic mt-1">
          {stats.new} pending · {stats.contacted} in progress · {stats.closed} closed
        </p>
      </div>
      
      {/* Filter + Search */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", "new", "contacted", "closed", "archived"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[10px] tracking-[2px] uppercase px-3 py-2 rounded-sm transition-colors ${
                filter === s
                  ? "bg-dzan-earth text-dzan-cream"
                  : "bg-dzan-warm/30 text-dzan-stone hover:bg-dzan-warm/50"
              }`}
            >
              {s === "all" ? "All" : s}
              {s !== "all" && ` (${stats[s]})`}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, product..."
          className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm text-dzan-earth"
        />
      </div>
      
      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-dzan-stone italic">
              {inquiries.length === 0 
                ? "No inquiries yet. Waiting for the first buyer..."
                : "No inquiries match your filter"}
            </p>
          </div>
        ) : (
          filteredInquiries.map(inq => {
            const badge = getStatusBadge(inq.status)
            const isExpanded = expandedId === inq.id
            
            return (
              <div key={inq.id} className="bg-white border border-dzan-brown/10 rounded-sm p-4">
                {/* Status + Time */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] tracking-[1.5px] uppercase font-medium px-2 py-1 rounded-sm ${badge.color}`}>
                    {badge.icon} {badge.label}
                  </span>
                  <span className="text-[10px] text-dzan-stone italic">
                    {formatTime(inq.created_at)}
                  </span>
                  <span className="text-[10px] text-dzan-stone ml-auto">
                    #{inq.id}
                  </span>
                </div>
                
                {/* Product */}
                <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-1">
                  Product
                </p>
                <p className="font-cormorant text-lg text-dzan-earth mb-3">
                  {inq.product_name || "—"}
                </p>
                
                {/* Buyer */}
                <div className="mb-3 space-y-1">
                  <p className="text-sm text-dzan-earth font-medium">
                    {inq.buyer_name || "Anonymous"}
                  </p>
                  {inq.buyer_email && (
                    <a 
                      href={`mailto:${inq.buyer_email}`}
                      className="text-xs text-dzan-amber hover:underline block"
                    >
                      📧 {inq.buyer_email}
                    </a>
                  )}
                  {inq.phone && (
                    <a 
                      href={`https://wa.me/${inq.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-dzan-amber hover:underline block"
                    >
                      📞 {inq.phone}
                    </a>
                  )}
                  {inq.quantity && (
                    <p className="text-xs text-dzan-stone">
                      📦 Quantity: <strong>{inq.quantity}</strong> pieces
                    </p>
                  )}
                </div>
                
                {/* Message */}
                {inq.message && (
                  <div className="bg-dzan-warm/30 rounded-sm p-3 mb-3">
                    <p className="text-xs text-dzan-earth italic leading-relaxed">
                      "{isExpanded || inq.message.length < 150 
                        ? inq.message 
                        : inq.message.substring(0, 150) + "..."}"
                    </p>
                    {inq.message.length >= 150 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                        className="text-[10px] text-dzan-amber uppercase mt-2"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                )}
                
                {/* Notes (admin internal) */}
                {inq.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 mb-3">
                    <p className="text-[10px] tracking-[1.5px] uppercase text-yellow-800 mb-1">
                      Internal Notes
                    </p>
                    <p className="text-xs text-yellow-900 italic">
                      {inq.notes}
                    </p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {inq.status === "new" && (
                    <button
                      onClick={() => updateStatus(inq.id, "contacted")}
                      disabled={actionLoading === inq.id}
                      className="text-[10px] tracking-[1.5px] uppercase bg-amber-500 text-white px-3 py-2 rounded-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
                    >
                      → Mark Contacted
                    </button>
                  )}
                  
                  {inq.status === "contacted" && (
                    <button
                      onClick={() => updateStatus(inq.id, "closed")}
                      disabled={actionLoading === inq.id}
                      className="text-[10px] tracking-[1.5px] uppercase bg-green-600 text-white px-3 py-2 rounded-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      → Close Deal
                    </button>
                  )}
                  
                  {(inq.status === "new" || inq.status === "contacted") && (
                    <button
                      onClick={() => updateStatus(inq.id, "archived")}
                      disabled={actionLoading === inq.id}
                      className="text-[10px] tracking-[1.5px] uppercase bg-gray-500 text-white px-3 py-2 rounded-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      Archive
                    </button>
                  )}
                  
                  {(inq.status === "closed" || inq.status === "archived") && (
                    <button
                      onClick={() => updateStatus(inq.id, "new")}
                      disabled={actionLoading === inq.id}
                      className="text-[10px] tracking-[1.5px] uppercase bg-dzan-stone text-white px-3 py-2 rounded-sm hover:bg-dzan-earth transition-colors disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                  
                  {viewerRole === "super_admin" && (
                    <button
                      onClick={() => handleDelete(inq.id)}
                      disabled={actionLoading === inq.id}
                      className="text-[10px] tracking-[1.5px] uppercase text-red-600 px-3 py-2 rounded-sm hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}

export default InquiriesManager