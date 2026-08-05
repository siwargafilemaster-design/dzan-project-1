"use client"

import Image from "next/image"
import { useChatbot } from "./ChatbotProvider"

const FloatingChatButton = () => {
  const { isOpen, openChat } = useChatbot()

  if (isOpen) return null

  return (
    <button
      onClick={openChat}
      className="group fixed bottom-24 right-6 z-60 h-20 w-20 rounded-full shadow-lg transition-all hover:shadow-xl"
      aria-label="Tanya DZAN Assistant"
    >
      {/* bg-dzan-cream WAJIB karena icon-nya transparan; p-3.5 kasih ruang
          biar bubble/dot di kanan tidak kepotong garis lingkaran */}
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-dzan-cream p-3.5 ring-2 ring-dzan-earth/15 transition-all group-hover:ring-dzan-earth/40">
        <Image
          src="/dzan-asst-icon.png"
          alt="DZAN Assistant"
          width={80}
          height={80}
          priority
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </span>

      {/* Label muncul saat hover */}
      <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-sm bg-dzan-earth px-3 py-1.5 text-xs uppercase tracking-[1.5px] text-dzan-cream opacity-0 transition-opacity group-hover:opacity-100">
        Tanya DZAN Assistant!
      </span>
    </button>
  )
}

export default FloatingChatButton