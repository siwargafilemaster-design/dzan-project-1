"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useChatbot } from "./ChatbotProvider"
import MessageBubble from "./MessageBubble"
import TypingIndicator from "./TypingIndicator"
import QuickActions from "./QuickActions"

const ChatWindow = () => {
  const { isOpen, closeChat, messages, isLoading, sendMessage, clearChat } = useChatbot()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput("")
    await sendMessage(message)
  }

  const handleQuickAction = async (message: string) => {
    if (isLoading) return
    await sendMessage(message)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md h-[600px] max-h-[calc(100vh-6rem)] bg-dzan-cream rounded-sm shadow-2xl flex flex-col border border-dzan-brown/20 overflow-hidden">

      {/* Header */}
      <div className="bg-dzan-earth text-dzan-cream px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-dzan-cream/30 flex-shrink-0">
            <Image
              src="/dzan-assistant-icon.png"
              alt="DZAN Assistant"
              width={32}
              height={32}
              className="w-full h-full object-contain bg-dzan-cream"
            />
          </div>
          <div>
            <p className="text-sm font-medium">DZAN Assistant</p>
            <p className="text-[10px] text-dzan-cream/70 tracking-wider">
              Online · Ready to help
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="text-dzan-cream/70 hover:text-dzan-cream text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm hover:bg-white/10 transition-colors"
              title="Clear chat"
            >
              Clear
            </button>
          )}
          <button
            onClick={closeChat}
            className="text-dzan-cream/70 hover:text-dzan-cream w-8 h-8 flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-dzan-cream">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        {messages.length === 1 && !isLoading && (
          <QuickActions onAction={handleQuickAction} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-dzan-brown/20 bg-white p-3 flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 bg-dzan-cream border border-dzan-brown/20 rounded-sm px-3 py-2 text-sm text-dzan-earth focus:outline-none focus:border-dzan-amber disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-dzan-earth hover:bg-dzan-brown text-dzan-cream px-4 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </form>

      {/* Footer */}
      <div className="bg-dzan-warm/30 px-4 py-2 border-t border-dzan-brown/10">
        <p className="text-[10px] text-dzan-stone italic text-center">
          💡 Untuk pertanyaan kompleks, langsung chat tim kami via WhatsApp
        </p>
      </div>
    </div>
  )
}

export default ChatWindow