import { supabase } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import SectionLabel from "@/components/SectionLabel"

async function getProduct(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      artisans (
        name,
        location,
        craft_type
      )
    `)
    .eq("slug", slug)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

type Props = {
  params: { slug: string }
}

const ProductDetailPage = async ({ params }: Props) => {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <main className="bg-dzan-cream min-h-screen pt-16 pb-12">
      {/* Image */}
      <div className="relative w-full aspect-square bg-dzan-earth">
        <Image
          src={product.image_url}
          alt={product.name_en}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <section className="px-6 py-8">
        <p className="text-[10px] tracking-[3px] uppercase text-dzan-amber mb-2">
          {product.category}
        </p>
        <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-1">
          {product.name_en}
        </h1>
        <p className="text-sm italic text-dzan-stone mb-6">
          {product.name_id}
        </p>

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
          href={`https://wa.me/6281234567890?text=Hi, I'm interested in ${product.name_en} (${product.slug})`}
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