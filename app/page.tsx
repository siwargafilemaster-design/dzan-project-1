import { supabase } from "@/lib/supabase"
import Marquee from "@/components/Marquee"

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

const Home = async () => {
  const videoUrl = await getHeroVideo()

  return (
    <main>
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
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

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-dzan-dark/30 to-dzan-dark/60" />

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <p className="text-[10px] tracking-[4px] font-light uppercase text-dzan-amber mb-4 opacity-90">
            Karanganyar · Central Java · Indonesia
          </p>
          <h1 className="font-cormorant font-light text-5xl sm:text-6xl leading-tight text-dzan-cream mb-4">
            DZAN Lawu
            <br />
            <em className="italic text-dzan-amber">Heritage</em>
          </h1>
          <p className="text-xs tracking-[2px] font-light uppercase text-dzan-cream/70 mb-10">
            Where Heritage Meets the World
          </p>
          <a
            href="#about"
            className="inline-flex items-center gap-2 text-xs tracking-[2px] font-medium uppercase text-dzan-cream border-b border-dzan-amber pb-1"
          >
            Explore ↓
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-10 bg-dzan-amber animate-pulse" />
        </div>
      </section>

      <Marquee />
      
    </main>
  )
}

export default Home
