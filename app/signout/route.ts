import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Ambil URL public dari header (sama seperti di callback)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  const host = forwardedHost || request.headers.get("host")
  const origin = `${forwardedProto}://${host}`

  return NextResponse.redirect(`${origin}/`, {
    status: 302,
  })
}