"use client"

import { useChatbot } from "./ChatbotProvider"

const FloatingChatButton = () => {
  const { isOpen, openChat } = useChatbot()
  
  if (isOpen) return null

  return (
    <button
      onClick={openChat}
      className="fixed bottom-24 right-6 z-60 bg-dzan-earth hover:bg-dzan-brown text-dzan-cream w-20 h-20 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      aria-label="Open DZAN Assistant"
    >
      <svg 
        className="w-14 h-14" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1.5" 
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
        />
      </svg>
      
      <span className="absolute right-full mr-3 bg-dzan-earth text-dzan-cream text-xs tracking-[1.5px] uppercase px-3 py-1.5 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        DZAN Assistant
      </span>
    </button>
  )
}

export default FloatingChatButton