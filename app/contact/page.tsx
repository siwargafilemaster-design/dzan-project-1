import SectionLabel from "@/components/SectionLabel"

const ContactPage = () => {
  return (
    <main className="bg-dzan-cream min-h-screen pt-20 pb-12">
      {/* Header */}
      <section className="px-6 py-12 text-center">
        <SectionLabel className="mb-4">Get in Touch</SectionLabel>
        <h1 className="font-cormorant font-light text-4xl text-dzan-earth mb-3">
          <em className="italic text-dzan-brown">Contact</em> Us
        </h1>
        <p className="text-xs tracking-[1px] text-dzan-stone max-w-xs mx-auto leading-relaxed">
          For inquiries, bulk orders, or partnership opportunities
        </p>
      </section>

      {/* Contact Methods */}
      <section className="px-6 space-y-4">
        {/* WhatsApp */}
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-dzan-warm/40 rounded-sm p-5 border-l-4 border-dzan-amber"
        >
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-1">
            WhatsApp
          </p>
          <p className="font-cormorant text-xl text-dzan-earth">
            +62 812-3456-7890
          </p>
          <p className="text-xs text-dzan-stone mt-1">
            Fastest response, 24/7
          </p>
        </a>

        {/* Email */}
        <a
          href="mailto:hello@dzanlawu.com"
          className="block bg-dzan-warm/40 rounded-sm p-5 border-l-4 border-dzan-brown"
        >
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-1">
            Email
          </p>
          <p className="font-cormorant text-xl text-dzan-earth">
            hello@dzanlawu.com
          </p>
          <p className="text-xs text-dzan-stone mt-1">
            Business inquiries
          </p>
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com/dzanlawuheritage"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-dzan-warm/40 rounded-sm p-5 border-l-4 border-dzan-sage"
        >
          <p className="text-[10px] tracking-[2px] uppercase text-dzan-amber mb-1">
            Instagram
          </p>
          <p className="font-cormorant text-xl text-dzan-earth">
            @dzanlawuheritage
          </p>
          <p className="text-xs text-dzan-stone mt-1">
            Behind the scenes
          </p>
        </a>
      </section>

      {/* Location */}
      <section className="px-6 py-12 mt-8 text-center">
        <SectionLabel className="mb-4">Visit Us</SectionLabel>
        <p className="font-cormorant text-2xl text-dzan-earth mb-2">
          Karanganyar
        </p>
        <p className="text-xs tracking-[1px] text-dzan-stone leading-relaxed">
          Central Java, Indonesia
          <br />
          At the foot of Mount Lawu
        </p>
      </section>
    </main>
  )
}

export default ContactPage