import Link from "next/link"
import { createClient } from "@/lib/supabase-server"
import ResetPasswordForm from "./ResetPasswordForm"

export default async function ResetPasswordPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No session — link invalid or expired
  if (!user) {
    return (
      <main className="min-h-screen bg-dzan-cream flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-red-200 rounded-sm p-6 text-center">
            <div className="text-5xl mb-3">⏱️</div>
            <h1 className="font-cormorant text-2xl text-dzan-earth mb-3">
              Link Tidak Valid
            </h1>
            <p className="text-sm text-dzan-stone italic mb-4 leading-relaxed">
              Link reset password sudah kadaluarsa atau sudah pernah digunakan.
            </p>
            
            <div className="bg-dzan-warm/30 rounded-sm p-3 mb-5">
              <p className="text-[11px] text-dzan-earth italic">
                💡 Silakan minta link baru, atau hubungi admin DZAN 
                via WhatsApp untuk reset manual.
              </p>
            </div>
            
            <Link 
              href="/forgot-password" 
              className="inline-block w-full bg-dzan-earth text-dzan-cream text-xs tracking-[3px] uppercase py-4 rounded-sm mb-3"
            >
              Minta Link Baru
            </Link>
            
            <Link 
              href="/login" 
              className="block text-center text-xs tracking-[2px] uppercase text-dzan-stone hover:text-dzan-amber py-3"
            >
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Valid session — show form
  return <ResetPasswordForm email={user.email ?? ""} />
}