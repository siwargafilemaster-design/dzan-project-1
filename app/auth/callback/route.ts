import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  // Ambil URL public dari header
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  const host = forwardedHost || request.headers.get("host")
  const origin = `${forwardedProto}://${host}`

  // Buat client SEKALI
  const supabase = await createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Cek user
  const { data: { user } } = await supabase.auth.getUser()

  // GUARD: Kalau user tidak ada, kembali ke login
  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Ambil profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  // Step 1: Cek profile completion (user baru)
  if (!profile?.full_name) {
    return NextResponse.redirect(`${origin}/onboarding`)
  }

  // Step 2: Cek role — admin & super_admin ke /admin
  if (profile.role === "super_admin" || profile.role === "admin") {
    return NextResponse.redirect(`${origin}/admin`)
  }

  // Default: ke /account (untuk buyer)
  return NextResponse.redirect(`${origin}/account`)
}