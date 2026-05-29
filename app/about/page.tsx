import SectionLabel from "@/components/SectionLabel"
import Link from "next/link"

const AboutPage = () => {
  return (
    <main className="bg-dzan-cream min-h-screen pt-28 pb-12">
      {/* Header */}
      <section className="px-6 py-12 text-center">
        <SectionLabel className="mb-4">Our Story</SectionLabel>
        <h1 className="font-cormorant font-light text-4xl text-dzan-earth mb-3">
          About <em className="italic text-dzan-brown">DZAN</em>
        </h1>
      </section>

      {/* DZAN Breakdown */}
      <section className="px-6 mb-12">
        <div className="space-y-6">
          {[
            {
              letter: "D",
              word: "Distinctive",
              desc: "Every piece tells a unique story of Karanganyar's heritage, distinct from mass-produced crafts.",
            },
            {
              letter: "Z",
              word: "Zenith",
              desc: "We carry only the finest works — the peak of each artisan's craftsmanship.",
            },
            {
              letter: "A",
              word: "Authentic",
              desc: "Genuine traditional techniques passed down through generations, never compromised.",
            },
            {
              letter: "N",
              word: "Noble",
              desc: "We honor the artisans behind every product, ensuring fair partnership and recognition.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-4 pb-6 border-b border-dzan-brown/10 last:border-0"
            >
              <span className="font-cormorant text-5xl font-light text-dzan-amber leading-none">
                {item.letter}
              </span>
              <div>
                <p className="font-cormorant text-xl text-dzan-earth mb-1">
                  {item.word}
                </p>
                <p className="text-xs leading-relaxed text-dzan-stone">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="bg-dzan-earth px-6 py-16 text-center mx-6 rounded-sm">
        <SectionLabel className="mb-6">Our Mission</SectionLabel>
        <p className="font-cormorant italic text-2xl text-dzan-cream leading-relaxed">
          "To carry the heritage of Karanganyar to the world stage,
          honoring every hand that shapes it."
        </p>
      </section>

      {/* CTA */}
      <section className="px-6 py-12 text-center">
        <Link
          href="/catalog"
          className="inline-block bg-dzan-earth text-dzan-cream text-xs tracking-[3px] font-medium uppercase px-9 py-4 rounded-sm"
        >
          Explore Our Catalog
        </Link>
      </section>
    </main>
  )
}

export default AboutPage