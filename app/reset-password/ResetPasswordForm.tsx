'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (password.length < 8) {
      setErrorMsg('Password minimal 8 karakter.')
      setStatus('error')
      return
    }
    if (password !== confirm) {
      setErrorMsg('Konfirmasi password tidak cocok.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Gagal menyimpan password.')
        setStatus('error')
        return
      }

      // Sukses → arahkan ke login dengan pesan
      router.push('/login?message=password_updated')
      router.refresh()
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan. Coba lagi.')
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Atur Password Baru</h1>
        <p className="text-sm text-gray-600">
          Untuk akun: <strong>{email}</strong>
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password baru (min. 8 karakter)"
          className="w-full rounded border px-3 py-2"
          disabled={status === 'loading'}
        />

        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Ulangi password baru"
          className="w-full rounded border px-3 py-2"
          disabled={status === 'loading'}
        />

        {status === 'error' && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {status === 'loading' ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </div>
    </div>
  )
}