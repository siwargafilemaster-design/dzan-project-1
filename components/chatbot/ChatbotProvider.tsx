"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatbotContextType {
  isOpen: boolean
  messages: Message[]
  isLoading: boolean
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

interface Props {
  children: ReactNode
}

export function ChatbotProvider({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const openChat = () => {
    setIsOpen(true)
    // Welcome message pada open pertama
    if (messages.length === 0) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: "Halo! 👋 Saya DZAN Assistant. Saya bisa membantu Anda mengenal produk DZAN Lawu Heritage — dari basket handwoven, bambu, sampai wooden crafts. Ada yang ingin ditanyakan?",
          timestamp: new Date(),
        },
      ])
    }
  }

  const closeChat = () => setIsOpen(false)

  const clearChat = () => {
    setMessages([])
    setIsOpen(false)
  }

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Chat history untuk context
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      // Error fallback
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Maaf, ada gangguan sebentar 🙏 Coba lagi atau chat langsung dengan tim kami via WhatsApp.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        messages,
        isLoading,
        openChat,
        closeChat,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider")
  }
  return context
}