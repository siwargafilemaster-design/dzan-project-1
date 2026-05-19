"use client"

import { createClient } from "@/lib/supabase-browser"
import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"

const QRGeneratorPage = () => {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name_en")
        .order("name_en")
      if (data) setProducts(data)
    }
    load()
  }, [])

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  return (
    <main className="bg-dzan-cream min-h-screen pt-16 pb-20 px-6">
      <div className="py-6">
        <Link href="/admin" className="text-xs text-dzan-stone">
          ← Dashboard
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
        QR Code Generator
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        Generate QR codes for hangtags
      </p>

      <div className="bg-white rounded-sm p-4 mb-6">
        <label className="text-[10px] uppercase tracking-[2px] text-dzan-amber block mb-2">
          Select Product
        </label>
        <select
          onChange={(e) => {
            const p = products.find((x) => x.id === Number(e.target.value))
            setSelected(p)
          }}
          className="w-full bg-white border border-dzan-brown/20 rounded-sm p-3 text-sm"
        >
          <option value="">— Choose a product —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_en}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="bg-white rounded-sm p-8 text-center">
          <QRCodeSVG
            value={`${baseUrl}/product/${selected.slug}`}
            size={240}
            level="H"
            includeMargin={true}
          />
          <p className="font-cormorant text-lg text-dzan-earth mt-4">
            {selected.name_en}
          </p>
          <p className="text-[10px] text-dzan-stone mt-1 break-all">
            {baseUrl}/product/{selected.slug}
          </p>

          <button
            onClick={() => window.print()}
            className="mt-6 bg-dzan-earth text-dzan-cream text-xs tracking-[2px] uppercase px-6 py-3 rounded-sm"
          >
            Print QR Code
          </button>
        </div>
      )}
    </main>
  )
}

export default QRGeneratorPage