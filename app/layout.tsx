import type { Metadata } from "next"
import { Cormorant_Garamond, Jost } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import BottomNav from "@/components/BottomNav"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="font-jost bg-dzan-dark text-dzan-cream pb-20">
        <Navbar />
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
