// app/product/[slug]/page.tsx

import { supabase } from "@/lib/supabase"
import SectionLabel from "@/components/SectionLabel"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  getSettingsByKeys, 
  buildWhatsAppUrl 
} from "@/lib/settings"
import InquireButton from "./InquireButton"

interface Props {
  params: Promise<{ slug: string }>
}

const ProductDetailPage = async ({ params }: Props) => {
  const { slug } = await params

  // Fetch product from Supabase
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_available", true)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch WhatsApp settings for backup direct link
  const settings = await getSettingsByKeys([
    "whatsapp_sales",
    "inquiry_wa_template",
  ])
  
  const whatsappRaw = settings.whatsapp_sales || "+6282226585576"
  const template = settings.inquiry_wa_template || 
    "Halo DZAN, saya tertarik dengan {product}."
  
  const waMessage = template.replace("{product}", product.name_en)
  const waUrl = buildWhatsAppUrl(whatsappRaw, waMessage)

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-12">
      {/* Back Link */}
      <div className="px-6 py-4">
        <Link
          href="/catalog"
          className="text-xs tracking-[2px] uppercase text-dzan-stone hover:text-dzan-amber"
        >
          ← Back to Catalog
        </Link>
      </div>

      {/* Product Image */}
      <section className="px-6 py-8">
        <div className="aspect-square rounded-sm overflow-hidden bg-dzan-warm/30">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dzan-stone italic text-sm">
              No image
            </div>
          )}
        </div>
      </section>

      {/* Product Info */}
      <section className="px-6 py-8">
        <SectionLabel className="mb-3">
          {product.category} · {product.is_featured ? "Featured" : "Available"}
        </SectionLabel>
        
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-8 bg-dzan-amber" />
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth text-center">
            <em className="italic">{product.name_en}</em>
          </h1>
          <div className="h-px w-8 bg-dzan-amber" />
        </div>

        {product.name_id && (
          <p className="text-center text-xs tracking-[2px] uppercase text-dzan-stone mb-8">
            {product.name_id}
          </p>
        )}

        {product.description_en && (
          <p className="text-sm leading-relaxed text-dzan-earth mb-8 max-w-md mx-auto text-center">
            {product.description_en}
          </p>
        )}

        {/* Specs */}
        <SectionLabel className="mb-3">Specifications</SectionLabel>
        <div className="space-y-2 mb-8">
          <div className="flex justify-between text-sm py-2 border-b border-dzan-brown/10">
            <span className="text-dzan-stone">Material</span>
            <span className="text-dzan-earth">{product.material || "—"}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-dzan-brown/10">
            <span className="text-dzan-stone">MOQ</span>
            <span className="text-dzan-earth">{product.moq || "—"}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-dzan-brown/10">
            <span className="text-dzan-stone">Price (Est)</span>
            <span className="text-dzan-earth font-medium">
              ${product.price_usd} USD
            </span>
          </div>
        </div>
        
        {/* CTA - Inquire with lead capture */}
        <InquireButton 
          productSlug={product.slug}
          productName={product.name_en}
          productId={product.id}
        />

        {/* Backup: Direct WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs tracking-[2px] uppercase text-dzan-stone mt-3 hover:text-dzan-amber transition-colors"
        >
          Or chat directly via WhatsApp →
        </a>

        {/* Back */}
        <Link
          href="/catalog"
          className="block text-center text-xs tracking-[2px] uppercase text-dzan-stone mt-8"
        >
          ← Back to Catalog
        </Link>
      </section>
    </main>
  )
}

export default ProductDetailPage
