import { supabase } from "@/lib/supabase"
import Marquee from "@/components/Marquee"
import SectionLabel from "@/components/SectionLabel"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"
import { getSettingsByKeys } from "@/lib/settings"

async function getHeroVideo() {
  const { data, error } = await supabase
    .from("hero_setting")
    .select("video_url")
    .single()

  if (error) {
    console.error("Error fetching video:", error)
    return null
  }

  return data?.video_url
}

async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("slug, name_en, category, image_url, is_featured")
    .eq("is_featured", true)
    .eq("is_available", true)
    .limit(2)

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

async function getStats() {
  // Count artisans (active only)
  const { count: artisansCount } = await supabase
    .from("artisans")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
  
  // Count products (available only)
  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_available", true)
  
  // Count distinct categories
  const { data: categoriesData } = await supabase
    .from("products")
    .select("category")
    .eq("is_available", true)
  
  const uniqueCategories = new Set(
    categoriesData?.map((p) => p.category) || []
  )
  
  // Format number untuk display
  const formatStat = (num: number | null): string => {
    if (!num) return "0"
    if (num < 10) return `${num}`
    if (num < 100) return `${Math.floor(num / 10) * 10}+`
    return `${Math.floor(num / 100) * 100}+`
  }
  
  return {
    artisans: formatStat(artisansCount),
    products: formatStat(productsCount),
    categories: `${uniqueCategories.size}`,
  }
}

const Home = async () => {
  // Fetch all data in parallel for performance
  const [videoUrl, featuredProducts, stats, settings] = await Promise.all([
    getHeroVideo(),
    getFeaturedProducts(),
    getStats(),
    getSettingsByKeys([
      "business_name",
      "business_address",
      "tagline_en",
      "about_short",
    ]),
  ])
  
  // Extract settings with fallbacks
  const businessName = settings.business_name || "DZAN Lawu Heritage"
  const businessAddress = settings.business_address || "Karanganyar, Jawa Tengah, Indonesia"
  const taglineEn = settings.tagline_en || "Where Heritage Meets the World"
  const aboutShort = settings.about_short || 
    "A curated house of handcrafted products from the heart of Karanganyar, Central Java. Bridging noble artisans of Lawu Mountain with the global market."
  
  // Transform business address for hero eyebrow display
  // "Karanganyar, Jawa Tengah, Indonesia" → "Karanganyar · Central Java · Indonesia"
  const heroLocationDisplay = businessAddress
    .replace("Jawa Tengah", "Central Java")
    .replace(/,\s+/g, " · ")
  
  // Split business name for hero title
  // "DZAN Lawu Heritage" → ["DZAN Lawu", "Heritage"]
  const nameParts = businessName.split(" ")
  const heroTitleMain = nameParts.slice(0, -1).join(" ") || businessName
  const heroTitleAccent = nameParts[nameParts.length - 1] || ""

  return (
    <main>
      {/* HERO VIDEO — 16:9 CINEMATIC */}
      <section className="relative bg-dzan-dark pt-20">
        <div className="relative aspect-video overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-dzan-dark" />
          )}
          
          {/* Subtle bottom gradient for smooth transition */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-dzan-dark/80" />
        </div>
        
        {/* HERO TEXT BLOCK — Di bawah video */}
        <div className="bg-dzan-dark px-6 py-12 text-center">
          <p className="text-[10px] tracking-[4px] font-light uppercase text-dzan-amber mb-4 opacity-90">
            {heroLocationDisplay}
          </p>
          <h1 className="font-cormorant font-light text-5xl sm:text-6xl leading-tight text-dzan-cream mb-4">
            {heroTitleMain}
            <br/>
            <em className="italic text-dzan-amber">{heroTitleAccent}</em>
          </h1>
          <p className="text-xs tracking-[2px] font-light uppercase text-dzan-cream/70 mb-10">
            {taglineEn}
          </p>
          <a
            href="#about"
            className="inline-flex items-center gap-2 text-xs tracking-[2px] font-medium uppercase text-dzan-cream border-b border-dzan-amber pb-1"
          >
            Explore ↓
          </a>
        </div>
      </section>

      <Marquee />
      
      {/* ABOUT */}
      <section id="about" className="bg-dzan-cream px-6 py-20 text-center">
        <SectionLabel className="mb-6">Our Identity</SectionLabel>

        {/* DZAN Letters — Brand DNA, never changes */}
        <div className="flex justify-center mb-8">
          {[
            { letter: "D", word: "Distinctive" },
            { letter: "Z", word: "Zenith" },
            { letter: "A", word: "Authentic" },
            { letter: "N", word: "Noble" },
          ].map((item, i) => (
            <div
              key={i}
              className={`text-center px-4 ${
                i < 3 ? "border-r border-dzan-brown/15" : ""
              }`}
            >
              <span className="font-cormorant text-3xl font-semibold text-dzan-brown block leading-none">
                {item.letter}
              </span>
              <span className="text-[8px] tracking-[1.5px] text-dzan-stone uppercase mt-1 block">
                {item.word}
              </span>
            </div>
          ))}
        </div>

        {/* Description EN — Dynamic dari Settings */}
        <p className="text-sm leading-relaxed text-dzan-earth max-w-md mx-auto mb-4 font-light">
          {aboutShort}
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 my-8">
          <div className="h-px w-12 bg-dzan-amber" />
          <span className="text-dzan-amber text-sm">✦</span>
          <div className="h-px w-12 bg-dzan-amber" />
        </div>

        {/* Description ID — Tetap hardcode (sesuai keputusan) */}
        <p className="text-xs leading-relaxed text-dzan-stone max-w-md mx-auto">
          Rumah kurasi produk kerajinan tangan dari jantung Karanganyar —
          membawa warisan budaya Lawu ke panggung dunia.
        </p>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-dzan-dark px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-cormorant font-light text-3xl text-dzan-cream leading-tight">
            Featured
            <br />
            Crafts
          </h2>
          <Link
            href="/catalog"
            className="text-xs tracking-[2px] uppercase text-dzan-amber border-b border-dzan-amber pb-0.5"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {featuredProducts.map((p) => (
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

      {/* STATS — Auto-count dari DB + Since 2024 */}
      <section className="bg-dzan-earth px-6 py-16 text-center">
        <SectionLabel className="mb-8">Our Heritage</SectionLabel>

        <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto">
          {[
            { number: stats.artisans, label: "Artisans" },
            { number: stats.products, label: "Products" },
            { number: stats.categories, label: "Categories" },
            { number: "2024", label: "Since" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <span className="font-cormorant font-light text-5xl text-dzan-amber block leading-none">
                {stat.number}
              </span>
              <span className="text-[10px] tracking-[2px] text-dzan-stone uppercase mt-2 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — Tagline tetap hardcode (poetic, stable) */}
      <section className="bg-dzan-cream px-6 py-20 text-center">
        <h2 className="font-cormorant font-light text-3xl text-dzan-earth leading-tight mb-2">
          Crafted with soul,
          <br />
          <em className="italic text-dzan-brown">made for the world.</em>
        </h2>
        <p className="text-xs tracking-[1px] text-dzan-stone mb-8">
          {heroLocationDisplay}
        </p>
        <Link
          href="/catalog"
          className="inline-block bg-dzan-earth text-dzan-cream text-xs tracking-[3px] font-medium uppercase px-9 py-4 rounded-sm"
        >
          Explore Full Catalog
        </Link>
      </section>
      
    </main>
  )
}

export default Home