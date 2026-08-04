import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabase } from "@/lib/supabase"
import { buildSystemPrompt } from "@/lib/chatbot/system-prompt"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      )
    }

    console.log("🤖 Chatbot request:", message.substring(0, 100))

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not set")
      return NextResponse.json(
        { error: "API not configured" },
        { status: 500 }
      )
    }

    // Fetch context data (products, artisans)
    const [productsResult, artisansResult] = await Promise.all([
      supabase
        .from("products")
        .select("name_en, category, material, moq, price_usd, description_en")
        .eq("is_available", true)
        .limit(50),
      supabase
        .from("artisans")
        .select("name, craft_type, location, bio")
        .eq("is_active", true)
        .limit(20),
    ])

    const products = productsResult.data || []
    const artisans = artisansResult.data || []

    // Build system prompt
    const systemPrompt = buildSystemPrompt({
      products,
      artisans,
    })

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      systemInstruction: systemPrompt,
    })

    // Convert history ke Gemini format
// Gemini requires first message to be from user
// So kita skip semua assistant messages di depan sampai ketemu user message
let geminiHistory = history?.map((msg: ChatMessage) => ({
  role: msg.role === "user" ? "user" : "model",
  parts: [{ text: msg.content }],
})) || []

// Skip leading model messages (welcome message akan di-skip)
while (geminiHistory.length > 0 && geminiHistory[0].role === "model") {
  geminiHistory.shift()
}

    // Start chat dengan history
    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    })

    // Send message
    const result = await chat.sendMessage(message)
    const response = result.response.text()

    console.log("✅ Gemini response received")

    return NextResponse.json({ response })
    
  } catch (error: any) {
    console.error("❌ Chatbot error:", error.message)
    return NextResponse.json(
      { error: error.message || "Chatbot error" },
      { status: 500 }
    )
  }
}