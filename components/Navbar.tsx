"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const Navbar = () => {
  const [lang, setLang] = useState<"ID" | "EN">("EN")

  const toggleLang = () => {
    setLang(lang === "ID" ? "EN" : "ID")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-dzan-cream/95 backdrop-blur-md border-b border-dzan-brown/10">
      
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo-dzan.png"
          alt="DZAN Lawu Heritage"
          width={80}
          height={40}
          className="object-contain h-auto w-auto"
          priority
        />
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLang}
          className="text-xs font-medium tracking-wider text-dzan-brown border border-dzan-brown rounded-full px-3 py-1"
        >
          {lang === "ID" ? "🇮🇩 ID" : "🇬🇧 EN"}
        </button>

        <Link
          href="/login"
          className="text-xs font-medium tracking-wider bg-dzan-earth text-dzan-cream rounded-full px-4 py-1.5"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
