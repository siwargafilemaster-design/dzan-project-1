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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-amber-50/75 backdrop-blur-sm">
      {/* Logo */}
      <Link href="/">
        <Image
          src="/dzan_logo.png"
          alt="DZAN Lawu Heritage"
          width={80}
          height={40}
          className="object-contain"
        />
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="text-stone-900 text-sm border border-stone-900 rounded-full px-3 py-1"
        >
          {lang === "ID" ? "🇮🇩 ID" : "🇬🇧 EN"}
        </button>

        {/* Login Button */}
        <Link
          href="/login"
          className="text-sm bg-amber-100 text-stone-900 font-semibold border border-stone-900 rounded-full px-4 py-1"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
