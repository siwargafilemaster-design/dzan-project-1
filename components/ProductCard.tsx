import Image from "next/image"
import Link from "next/link"

type ProductCardProps = {
  slug: string
  nameEn: string
  category: string
  imageUrl: string
  isFeatured?: boolean
}

const ProductCard = ({
  slug,
  nameEn,
  category,
  imageUrl,
  isFeatured = false,
}: ProductCardProps) => {
  return (
    <Link
      href={`/product/${slug}`}
      className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-dzan-earth group"
    >
      <Image
        src={imageUrl}
        alt={nameEn}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dzan-dark/90 via-transparent to-transparent" />

      {/* Badge */}
      {isFeatured && (
        <div className="absolute top-3 right-3 text-[8px] tracking-[2px] font-medium uppercase text-dzan-amber border border-dzan-amber rounded-full px-2.5 py-0.5 bg-dzan-dark/40 backdrop-blur-sm">
          Featured
        </div>
      )}

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-[9px] tracking-[2px] uppercase text-dzan-amber mb-1">
          {category}
        </p>
        <p className="font-cormorant text-lg leading-tight text-dzan-cream">
          {nameEn}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard