"use client"

import Link from "next/link"

const QRGeneratorPage = () => {
  
    <main className="bg-dzan-cream min-h-screen pt-16 pb-20 px-6">
      <div className="py-6">
        <Link href="/admin" className="text-xs text-dzan-stone">
          ← Dashboard
        </Link>
      </div>

      <h1 className="font-cormorant font-light text-3xl text-dzan-earth mb-2">
        QR Code Generator
      </h1>
      <p className="text-xs text-dzan-stone mb-6">
        QR code generator is coming soon. In the meantime, you can generate QR codes using bitly or any other QR code generator
      </p>

    </main>
  
}

export default QRGeneratorPage