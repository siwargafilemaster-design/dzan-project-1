"use client"

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-dzan-brown/10 rounded-sm px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-dzan-amber rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-dzan-amber rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-dzan-amber rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator