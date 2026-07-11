import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-browser'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Session sudah ter-set di cookies oleh server client.
      // Redirect bersih ke halaman reset password.
      return NextResponse.redirect(
        new URL('/reset-password', request.url)
      )
    }

    console.error('[auth/confirm] verifyOtp error:', error.message)
  }

  // Token invalid / expired / sudah terpakai
  return NextResponse.redirect(
    new URL('/login?error=link_invalid', request.url)
  )
}