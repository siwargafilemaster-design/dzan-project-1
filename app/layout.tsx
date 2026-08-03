import type { Metadata } from "next"
import { Cormorant_Garamond, Jost } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"
import { AuthProvider } from "@/components/AuthProvider"
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider"
import FloatingChatButton from "@/components/chatbot/FloatingChatButton"
import ChatWindow from "@/components/chatbot/ChatWindow"
import { createClient } from "@/lib/supabase-server"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
})

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
})

export const metadata: Metadata = {
  title: "DZAN Lawu Heritage — Where Heritage Meets the World",
  description:
    "Curated handcrafted products from Karanganyar, Central Java. Bridging noble artisans of Lawu Mountain with the global market.",
}

// ⚠️ Function jadi ASYNC karena fetch data di server
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch user & profile di SERVER (sekali per request)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, title, avatar_url, role, role_scope, country")
      .eq("id", user.id)
      .single()
    
    profile = data
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-jost bg-dzan-dark text-dzan-cream pb-20">
        {/* Bungkus semua dengan AuthProvider, pass data dari server */}
        <AuthProvider initialUser={user} initialProfile={profile}>
          <ChatbotProvider>
            <Navbar />
            {children}
            <BottomNav />
            
            {/* DZAN AI Assistant */}
            <FloatingChatButton />
            <ChatWindow />
          </ChatbotProvider>
        </AuthProvider>
      </body>
    </html>
  )
}