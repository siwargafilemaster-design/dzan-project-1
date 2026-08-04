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
      {/* Ikon logo — di-clip bulat oleh wrapper ini, BUKAN oleh <button>,
          supaya label/tooltip di kiri tidak ikut terpotong */}
      <span className="block h-full w-full overflow-hidden rounded-full ring-2 ring-dzan-earth/15 transition-all group-hover:ring-dzan-earth/40">
        <Image
          src="/dzan-assistant-icon.jpg"
          alt="DZAN Assistant"
          width={60}
          height={60}
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