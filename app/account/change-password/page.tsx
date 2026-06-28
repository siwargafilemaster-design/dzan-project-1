import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import ChangePasswordForm from "./ChangePasswordForm"

export default async function ChangePasswordPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("must_change_password, full_name")
    .eq("id", user.id)
    .single()
  
  return (
    <main className="min-h-screen bg-dzan-cream px-6 py-12 flex items-center justify-center pt-28">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-[10px] tracking-[4px] uppercase text-dzan-amber mb-2">
            Account Security
          </p>
          <h1 className="font-cormorant font-light text-3xl text-dzan-earth">
            {profile?.must_change_password 
              ? "Ganti Password Anda" 
              : "Ubah Password"}
          </h1>
          {profile?.must_change_password && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-sm p-3">
              <p className="text-xs text-amber-900 italic">
                ⚠️ Demi keamanan, Anda wajib ganti password sebelum melanjutkan.
              </p>
            </div>
          )}
        </div>
        
        <ChangePasswordForm 
          isFirstTime={profile?.must_change_password ?? false}
        />
      </div>
    </main>
  )
}