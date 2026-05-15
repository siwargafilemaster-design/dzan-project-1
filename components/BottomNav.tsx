"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/catalog", label: "Catalog", icon: "🧺" },
  { href: "/about", label: "About", icon: "🌿" },
  { href: "/contact", label: "Contact", icon: "✉️" },
]

const BottomNav = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-amber-50/95 backdrop-blur-sm border-t border-stone-200">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all ${
                isActive ? "text-stone-800 font-semibold" : "text-stone-400"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
