// app/admin/bts/BTSRedirectClient.tsx

"use client"

import Link from "next/link"

interface Props {
  instagramHandle: string
}

const BTSRedirectClient = ({ instagramHandle }: Props) => {
  
  const instagramWebUrl = `https://www.instagram.com/${instagramHandle}/`
  const instagramAppUrl = `instagram://user?username=${instagramHandle}`
  
  // Smart detection: mobile → app, desktop → browser
  const handleOpenInstagram = () => {
    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Try open Instagram app first
      window.location.href = instagramAppUrl
      
      // Fallback: if app not installed, redirect to web after 1.5s
      setTimeout(() => {
        window.location.href = instagramWebUrl
      }, 1500)
    } else {
      // Desktop: open in new tab
      window.open(instagramWebUrl, "_blank", "noopener,noreferrer")
    }
  }
  
  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-20 px-6">
      {/* Back Link */}
      <div className="py-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 bg-dzan-sage/90 hover:bg-dzan-sage text-white text-[10px] tracking-[2px] uppercase font-medium px-4 py-2 rounded-full transition-colors"
        >
          <span>←</span>
          <span>Dashboard</span>
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2 mt-2">
        Behind The Scenes
      </h1>
      <p className="text-xs text-dzan-stone italic mb-8">
        Heritage stories in motion
      </p>

      {/* MAIN CARD — Instagram Redirect */}
      <div className="bg-white rounded-sm overflow-hidden mb-6">
        
        {/* Instagram Visual Header */}
        <div className="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-8 text-center">
          <div className="text-6xl mb-2">📷</div>
          <p className="text-white font-cormorant text-2xl font-light">
            We're on Instagram
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Pesan Indonesia (Dominan) */}
          <div>
            <p className="text-base text-dzan-earth leading-relaxed">
              Upload behind the scene video di Instagram aja ya!
            </p>
            <p className="text-xs text-dzan-stone italic mt-2 leading-relaxed">
              Upload behind the scenes videos on Instagram, please!
            </p>
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-dzan-brown/20" />
            <span className="text-dzan-amber text-xs">✦</span>
            <div className="h-px flex-1 bg-dzan-brown/20" />
          </div>
          
          {/* Handle Display */}
          <div className="text-center mb-4">
            <p className="text-[10px] tracking-[2px] uppercase text-dzan-stone mb-2">
              Follow Kami di
            </p>
            <p className="font-cormorant text-2xl text-dzan-earth">
              @{instagramHandle}
            </p>
          </div>
          
          {/* CTA Button */}
          <button
            type="button"
            onClick={handleOpenInstagram}
            className="block w-full bg-dzan-earth hover:opacity-90 text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm transition-opacity"
          >
            Buka Instagram →
          </button>
          
          <p className="text-[10px] text-dzan-stone italic text-center">
            Open in Instagram
          </p>
        </div>
      </div>

      {/* PHILOSOPHY CARD — Why on Instagram? */}
      <div className="bg-dzan-warm/30 border border-dzan-amber/30 rounded-sm p-5 space-y-3">
        <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium">
          🌿 Kenapa di Instagram?
        </p>
        
        <div className="space-y-3">
          {/* Reason 1 */}
          <div>
            <p className="text-sm text-dzan-earth font-medium mb-1">
              Native habitat untuk BTS
            </p>
            <p className="text-[11px] text-dzan-stone leading-relaxed italic">
              Instagram dibuat untuk vertical storytelling. 
              Reels 9:16 cocok untuk capture momen artisan dari dekat.
            </p>
            <p className="text-[10px] text-dzan-stone/80 italic mt-1">
              Instagram is built for vertical storytelling. 
              Reels 9:16 work perfectly for intimate artisan moments.
            </p>
          </div>
          
          {/* Reason 2 */}
          <div>
            <p className="text-sm text-dzan-earth font-medium mb-1">
              Reach yang organik
            </p>
            <p className="text-[11px] text-dzan-stone leading-relaxed italic">
              Algoritma Instagram bantu DZAN ketemu audiens baru 
              yang minat heritage craft.
            </p>
            <p className="text-[10px] text-dzan-stone/80 italic mt-1">
              Instagram's algorithm helps DZAN reach new audiences 
              interested in heritage craft.
            </p>
          </div>
          
          {/* Reason 3 */}
          <div>
            <p className="text-sm text-dzan-earth font-medium mb-1">
              Web fokus pada produk
            </p>
            <p className="text-[11px] text-dzan-stone leading-relaxed italic">
              DZAN web fokus showcase produk + cerita artisan. 
              BTS yang dinamis live di Instagram.
            </p>
            <p className="text-[10px] text-dzan-stone/80 italic mt-1">
              DZAN web focuses on product showcase and artisan stories. 
              Dynamic BTS lives on Instagram.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Card */}
      <div className="bg-white rounded-sm p-5 mt-6">
        <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber font-medium mb-3">
          📋 Workflow Tim Kreatif
        </p>
        
        <div className="space-y-2 text-[12px] text-dzan-earth">
          <div className="flex items-start gap-2">
            <span className="text-dzan-amber font-medium">1.</span>
            <span>Shoot BTS pakai HP/camera (9:16 vertical)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-dzan-amber font-medium">2.</span>
            <span>Edit di CapCut/Reels editor</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-dzan-amber font-medium">3.</span>
            <span>Upload langsung ke @{instagramHandle}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-dzan-amber font-medium">4.</span>
            <span>Tag produk & artisan kalau ada</span>
          </div>
        </div>
        
        <p className="text-[10px] text-dzan-stone italic mt-3 pt-3 border-t border-dzan-brown/10">
          Tips: Konsistensi posting & kualitas perfect. Just keep showing the craft.
        </p>
      </div>
    </main>
  )
}

export default BTSRedirectClient