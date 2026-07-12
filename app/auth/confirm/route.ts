import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getBaseUrl } from '@/lib/get-base-url'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  
  const baseUrl = getBaseUrl(request.url)
  
  console.log("🔵 /auth/confirm called:")
  console.log("  request.url:", request.url)
  console.log("  baseUrl:", baseUrl)
  console.log("  token_hash:", token_hash ? "present" : "missing")
  console.log("  type:", type)

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log("✅ verifyOtp success, redirecting to /reset-password")
      return NextResponse.redirect(`${baseUrl}/reset-password`)
    }

    console.error('❌ verifyOtp error:', error.message)
  } else {
    console.error('❌ Missing token_hash or type')
  }

  return NextResponse.redirect(`${baseUrl}/login?error=link_invalid`)
}