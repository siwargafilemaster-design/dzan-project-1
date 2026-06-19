// app/product/[slug]/page.tsx

import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { notFound } from "next/navigation"
import SectionLabel from "@/components/SectionLabel"
import ProductGallery from "./ProductGallery"
import { getSetting, buildWhatsAppUrl } from "@/lib/settings"

async function getProduct(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      artisans (
        name,
        location,
        craft_type
      )
    `
    )
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

async function getProductPhotos(productId: number) {
  const { data, error } = await supabase
    .from("product_photos")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching product photos:", error)
    return []
  }

  return data || []
}

type Props = {
  params: Promise<{ slug: string }>
}

const ProductDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Fetch detail photos dari product_photos table
  const detailPhotos = await getProductPhotos(product.id)

  // Combine: image_url sebagai photo pertama + product_photos sebagai gallery
  const allPhotos = [
    { id: 0, photo_url: product.image_url, sort_order: -1 },
    ...detailPhotos,
  ]

  // Fetch settings untuk WhatsApp CTA
  const waNumber = await getSetting("whatsapp_sales")
  const waTemplate = await getSetting("inquiry_wa_template")

  // Build personalized message
  const waMessage = waTemplate.replace("[PRODUCT]", product.name_en)
  const waUrl = buildWhatsAppUrl(waNumber, waMessage)

  return (
    <main className="bg-dzan-cream min-h-screen pt-16 pb-12">
      {/* GALLERY — Swipe-able dengan counter + thumbnails */}
      <ProductGallery photos={allPhotos} productName={product.name_en} />

      {/* Content */}
      <section className="px-6 py-8">
        <p className="text-[10px] tracking-[3px] uppercase text-dzan-amber mb-2">
          {product.category}
        </p>
        <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-1">
          {product.name_en}
        </h1>
        <p className="text-sm italic text-dzan-stone mb-6">{product.name_id}</p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-dzan-brown/20" />
          <span className="text-dzan-amber text-xs">✦</span>
          <div className="h-px flex-1 bg-dzan-brown/20" />
        </div>

        {/* Description */}
        <SectionLabel className="mb-3">About</SectionLabel>
        <p className="text-sm leading-relaxed text-dzan-earth mb-3">
          {product.desc_en}
        </p>
        <p className="text-xs leading-relaxed text-dzan-stone mb-8 italic">
          {product.desc_id}
        </p>

        {/* Artisan */}
        {product.artisans && (
          <>
            <SectionLabel className="mb-3">Crafted By</SectionLabel>
            <div className="bg-dzan-warm/30 rounded-sm p-4 mb-8">
              <p className="font-cormorant text-xl text-dzan-earth">
                {product.artisans.name}
              </p>
              <p className="text-xs text-dzan-stone mt-1">
                {product.artisans.location} · {product.artisans.craft_type}
              </p>
            </div>
          </>
        )}

        {/* Specs */}
        <SectionLabel className="mb-3">Specifications</SectionLabel>
        <div className="space-y-2 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-dzan-stone">Material</span>
            <span className="text-dzan-earth">{product.material}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dzan-stone">MOQ</span>
            <span className="text-dzan-earth">{product.moq} pcs</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dzan-stone">Price (Export)</span>
            <span className="text-dzan-earth font-medium">
              ${product.price_usd} USD
            </span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-dzan-earth text-dzan-cream text-center text-xs tracking-[3px] font-medium uppercase py-4 rounded-sm"
        >
          Inquire via WhatsApp
        </a>

        {/* Back */}
        <Link
          href="/catalog"
          className="block text-center text-xs tracking-[2px] uppercase text-dzan-stone mt-6"
        >
          ← Back to Catalog
        </Link>
      </section>
    </main>
  )
}

export default ProductDetailPage
