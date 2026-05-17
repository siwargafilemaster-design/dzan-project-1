const items = [
  "Batik",
  "Anyaman",
  "Bambu",
  "Karanganyar",
  "Export Ready",
  "Handcrafted",
  "Heritage",
  "Authentic",
]

const Marquee = () => {
  // Gandakan items biar animasi seamless
  const doubled = [...items, ...items]

  return (
    <div className="bg-dzan-amber overflow-hidden py-2.5">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-[10px] tracking-[3px] font-medium uppercase text-dzan-earth px-6"
          >
            {item} <span className="opacity-50 ml-6">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default Marquee