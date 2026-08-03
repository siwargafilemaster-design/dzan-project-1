"use client"

import { Message } from "./ChatbotProvider"

interface Props {
  message: Message
}

const MessageBubble = ({ message }: Props) => {
  const isUser = message.role === "user"
  
  const hasWhatsAppLink = message.content.includes("wa.me") || 
                          message.content.includes("whatsapp")
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-sm px-4 py-2.5 ${
        isUser 
          ? "bg-dzan-earth text-dzan-cream" 
          : "bg-white border border-dzan-brown/10 text-dzan-earth"
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        
        {!isUser && hasWhatsAppLink && (
          <a
            href="https://wa.me/6282226585576"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white text-xs tracking-[1.5px] uppercase px-3 py-2 rounded-sm transition-colors"
          >
            💬 Open WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}

export default MessageBubble