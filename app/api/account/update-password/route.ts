import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { newPassword } = await request.json()
    
    // Validate
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" }, 
        { status: 400 }
      )
    }
    
    // Get current user via session
    const serverSupabase = await createServerClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      )
    }
    
    // Admin client (service_role)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Update password via admin API (NO session conflict)
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )
    
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message }, 
        { status: 500 }
      )
    }
    
    // Activity log (non-blocking)
    await adminClient.from("activity_log").insert({
      user_id: user.id,
      action: "update",
      entity_type: "user",
      entity_id: user.id,
      description: "Changed own password",
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error("Update password error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    )
  }
}