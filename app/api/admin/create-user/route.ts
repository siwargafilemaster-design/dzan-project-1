import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { 
  getDefaultPassword,
  canAddUser,
  getAllowedRolesForAdd,
  getAllowedScopesForAdd,
} from "@/lib/permissions"

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { email, full_name, role, role_scope, recruited_by } = body

    console.log("🟢 SERVER: Create user request:")
    console.log("  email:", email)
    console.log("  full_name:", full_name)
    console.log("  role:", role)
    console.log("  role_scope:", role_scope)

    // Validate required fields
    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get viewer profile
    const serverSupabase = await createServerClient()
    const { data: { user: viewer } } = await serverSupabase.auth.getUser()
    
    if (!viewer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { data: viewerProfile } = await serverSupabase
      .from("profiles")
      .select("*")
      .eq("id", viewer.id)
      .single()
    
    if (!viewerProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    
    // Permission check
    if (!canAddUser(viewerProfile)) {
      return NextResponse.json(
        { error: "Tidak punya permission untuk add user" },
        { status: 403 }
      )
    }
    
    // Validate role
    const allowedRoles = getAllowedRolesForAdd(viewerProfile)
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Tidak bisa create role: ${role}` },
        { status: 403 }
      )
    }
    
    // Validate scope
    const allowedScopes = getAllowedScopesForAdd(viewerProfile, role)
    if (role_scope && !allowedScopes.includes(role_scope)) {
      return NextResponse.json(
        { error: `Tidak bisa assign scope: ${role_scope}` },
        { status: 403 }
      )
    }
    
    // Initialize admin client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    )
    
    // Check if user exists
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, role, role_scope, email, full_name")
      .eq("email", email)
      .maybeSingle()
    
    // Password generated SERVER-SIDE, bukan dari body
    const tempPassword = getDefaultPassword()
    
    // PATH A: User exists → Upgrade
    if (existingProfile) {
      if (existingProfile.role === "super_admin") {
        return NextResponse.json(
          { error: "Cannot modify super_admin user" },
          { status: 403 }
        )
      }
      
      if (
        existingProfile.role === role && 
        existingProfile.role_scope === role_scope && 
        role !== "buyer"
      ) {
        return NextResponse.json(
          { error: `User sudah memiliki role: ${role}/${role_scope}` },
          { status: 400 }
        )
      }
      
      // Update profile
      const { error: updateError } = await adminClient
        .from("profiles")
        .update({
          full_name,
          role,
          role_scope,
          recruited_by,
          is_active: true,
          must_change_password: false,
        })
        .eq("id", existingProfile.id)
      
      if (updateError) {
        return NextResponse.json(
          { error: `Failed to upgrade profile: ${updateError.message}` },
          { status: 500 }
        )
      }
      
      // Reset password
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(
        existingProfile.id,
        { password: tempPassword }
      )
      
      if (passwordError) {
        return NextResponse.json(
          { error: `Failed to reset password: ${passwordError.message}` },
          { status: 500 }
        )
      }
      
      // Log activity
      await adminClient.from("activity_log").insert({
        user_id: viewer.id,
        action: "upgrade",
        entity_type: "user",
        entity_id: existingProfile.id,
        description: `Upgraded ${existingProfile.full_name || email} from ${existingProfile.role} to ${role}/${role_scope || "none"}`,
      })
      
      return NextResponse.json({
        success: true,
        upgraded: true,
        previous_role: existingProfile.role,
        email,
        password: tempPassword,
        user_id: existingProfile.id,
      })
    }
    
    // PATH B: New user → Create
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })
    
    if (createError || !newUser.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create user" },
        { status: 500 }
      )
    }
    
    // Create profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: newUser.user.id,
        email,
        full_name,
        role,
        role_scope,
        recruited_by,
        is_active: true,
        must_change_password: false,
      }, {
        onConflict: 'id',
      })
    
    if (profileError) {
      // Rollback
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 500 }
      )
    }
    
    // Log activity
    await adminClient.from("activity_log").insert({
      user_id: viewer.id,
      action: "create",
      entity_type: "user",
      entity_id: newUser.user.id,
      description: `Created user: ${full_name} (${email}) as ${role}/${role_scope || "none"}`,
    })
    
    return NextResponse.json({
      success: true,
      upgraded: false,
      email,
      password: tempPassword,
      user_id: newUser.user.id,
    })
    
  } catch (error: any) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}