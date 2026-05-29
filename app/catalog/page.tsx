import { supabase } from "@/lib/supabase"
import ProductCard from "@/components/ProductCard"
import SectionLabel from "@/components/SectionLabel"

async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("slug, name_en, category, image_url, is_featured")
    .eq("is_available", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

const CatalogPage = async () => {
  const products = await getAllProducts()

  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-12">
      {/* Header */}
      <section className="px-6 py-12 text-center">
        <SectionLabel className="mb-4">Full Collection</SectionLabel>
        <h1 className="font-cormorant font-light text-4xl text-dzan-earth mb-3">
          The <em className="italic text-dzan-brown">Catalog</em>
        </h1>
        <p className="text-xs tracking-[1px] text-dzan-stone">
          {products.length} crafted pieces · Karanganyar
        </p>
      </section>

      {/* Products Grid */}
      <section className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.slug}
              slug={p.slug}
              nameEn={p.name_en}
              category={p.category}
              imageUrl={p.image_url}
              isFeatured={p.is_featured}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default CatalogPage