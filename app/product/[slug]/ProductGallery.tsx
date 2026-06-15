// app/product/[slug]/ProductGallery.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

interface Photo {
  id: number
  photo_url: string
  sort_order: number
}

interface ProductGalleryProps {
  photos: Photo[]
  productName: string
}

const ProductGallery = ({ photos, productName }: ProductGalleryProps) => {
  // Embla carousel untuk HERO (swipe-able)
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
  })
  
  const [activeIndex, setActiveIndex] = useState(0)
  const thumbnailsRef = useRef<HTMLDivElement>(null)
  
  // Sync hero swipe → activeIndex state
  useEffect(() => {
    if (!emblaApi) return
    
    const onSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap())
    }
    
    emblaApi.on("select", onSelect)
    onSelect()  // initial sync
    
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])
  
  // Auto-scroll thumbnails saat activeIndex berubah
  useEffect(() => {
    if (!thumbnailsRef.current) return
    
    const activeThumb = thumbnailsRef.current.querySelector(
      `[data-thumb-index="${activeIndex}"]`
    ) as HTMLElement
    
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    }
  }, [activeIndex])
  
  // Handler klik thumbnail → scroll hero ke index tsb
  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi]
  )
  
  if (photos.length === 0) return null
  
  return (
    <div>
      {/* HERO CAROUSEL (Swipe-able) */}
      <div className="relative">
        <div className="overflow-hidden bg-dzan-earth" ref={emblaRef}>
          <div className="flex">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="relative flex-[0_0_100%] aspect-square bg-dzan-warm"
              >
                <Image
                  src={photo.photo_url}
                  alt={`${productName} - photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Counter "X / Y" — Top Right */}
        {photos.length > 1 && (
          <div className="absolute top-3 right-3 bg-dzan-earth/85 text-dzan-cream text-[10px] tracking-[1.5px] uppercase px-3 py-1.5 rounded-full font-medium">
            {activeIndex + 1} / {photos.length}
          </div>
        )}
      </div>
      
      {/* THUMBNAILS — Auto-scroll horizontal */}
      {photos.length > 1 && (
        <div 
          ref={thumbnailsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 py-3"
          style={{ scrollbarWidth: "none" }}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              data-thumb-index={index}
              onClick={() => onThumbClick(index)}
              className={`relative flex-shrink-0 w-16 h-16 bg-dzan-warm rounded-sm overflow-hidden transition-all snap-start ${
                index === activeIndex 
                  ? "ring-2 ring-dzan-earth opacity-100 scale-105" 
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={photo.photo_url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductGallery