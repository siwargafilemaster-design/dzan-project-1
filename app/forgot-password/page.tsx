'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!email) return
    setStatus('loading')
    setErrorMsg('')

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // KUNCI: origin dinamis — jalan di Codespace maupun Vercel
      redirectTo: `${window.location.origin}/auth/confirm`,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }

    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border p-6 text-center space-y-3">
          <h1 className="text-xl font-semibold">Email Terkirim 📧</h1>
          <p className="text-sm text-gray-600">
            Silakan cek inbox <strong>{email}</strong> dan klik link reset password.
            Link berlaku selama 1 jam.
          </p>
          <p className="text-xs text-gray-400">
            Tidak menerima email? Cek folder spam, atau hubungi admin via WhatsApp.
          </p>
          <Link href="/login" className="text-sm underline">
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Lupa Password</h1>
        <p className="text-sm text-gray-600">
          Masukkan email akun Anda. Kami akan mengirimkan link untuk
          mengatur ulang password.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
          className="w-full rounded border px-3 py-2"
          disabled={status === 'loading'}
        />

        {status === 'error' && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !email}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {status === 'loading' ? 'Mengirim...' : 'Kirim Link Reset'}
        </button>

        <Link href="/login" className="block text-center text-sm underline">
          Kembali ke Login
        </Link>
      </div>
    </div>
  )
}