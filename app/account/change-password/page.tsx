import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import ChangePasswordForm from "./ChangePasswordForm"

interface Props {
  searchParams: Promise<{ from?: string }>
}

export default async function ChangePasswordPage({ searchParams }: Props) {
  const supabase = await createClient()
  const params = await searchParams
  const fromForgot = params.from === "forgot"
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  return (
    <main className="min-h-screen bg-dzan-cream px-6 py-12 flex items-center justify-center pt-28">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-2">
            Account Security
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            {fromForgot ? "Buat Password Baru" : "Ubah Password"}
          </h1>
          <p className="text-sm text-dzan-stone italic mt-2">
            {fromForgot 
              ? "Anda berhasil login via magic link. Sekarang buat password baru untuk akun Anda."
              : "Pilih password baru yang aman dan mudah Anda ingat"
            }
          </p>
        </div>
        
        <ChangePasswordForm isFirstTime={fromForgot} />
      </div>
    </main>
  )
}