import { supabase } from "@/lib/supabase";

async function getHeroVideo() {
  const { data, error } = await supabase
    .from("hero_setting")
    .select("video_url")
    .single();

  if (error) {
    console.error("Error fetching video:", error);
    return null;
  }

  return data?.video_url;
}

const Home = async () => {
  const videoUrl = await getHeroVideo();

  return (
    <main className="relative min-h-screen">
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
        <div className="absolute inset-0 bg-stone-900" />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-amber-100 mb-4">
          DZAN Lawu Heritage
        </h1>
        <p className="text-stone-300 text-lg">
          Crafted from the soul of Lawu Mountain
        </p>
      </div>
    </main>
  );
};

export default Home;
