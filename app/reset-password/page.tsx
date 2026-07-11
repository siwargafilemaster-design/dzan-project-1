import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border p-6 text-center space-y-3">
          <h1 className="text-xl font-semibold">Link Tidak Valid ⏱️</h1>
          <p className="text-sm text-gray-600">
            Link reset password sudah kadaluarsa atau sudah pernah digunakan.
          </p>
          <p className="text-sm text-gray-600">
            Silakan minta link baru, atau hubungi admin DZAN via WhatsApp
            untuk reset manual.
          </p>
          <Link href="/forgot-password" className="text-sm underline">
            Minta Link Baru
          </Link>
        </div>
      </div>
    )
  }

  return <ResetPasswordForm email={user.email ?? ''} />
}