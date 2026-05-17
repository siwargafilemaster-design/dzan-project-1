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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dzan-cream/95 backdrop-blur-md border-t border-dzan-brown/10">
      <div className="flex items-center justify-around py-2 pb-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-1"
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className={`text-[9px] tracking-widest font-medium uppercase ${
                  isActive ? "text-dzan-brown" : "text-dzan-stone"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-dzan-amber" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav