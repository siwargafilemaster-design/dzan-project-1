import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Pastikan ada session (dari verifyOtp di /auth/confirm)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Session tidak ditemukan. Link mungkin sudah kadaluarsa." },
        { status: 401 }
      )
    }

    console.log("🔵 Updating password for user:", user.id)

    // Update password — DI SERVER
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      console.error("❌ updateUser error:", updateError.message)
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    console.log("✅ Password updated, signing out...")

    // Logout supaya recovery session tidak tertinggal
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
    
  } catch (err) {
    console.error("❌ /api/auth/reset-password unexpected:", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    )
  }
}