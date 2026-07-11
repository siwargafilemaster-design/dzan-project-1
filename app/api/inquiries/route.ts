import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { getSettingsByKeys, buildWhatsAppUrl } from "@/lib/settings"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      product_id,
      product_slug, 
      product_name, 
      phone,
      quantity,
      message 
    } = body
    
    // Validate required
    if (!product_slug || !product_name || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
const serverSupabase = await createServerClient()
const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

console.log("🔵 API Inquiry Debug:")
console.log("  user:", user ? { id: user.id, email: user.email } : null)
console.log("  userError:", userError)

if (!user) {
  console.error("❌ No user in session")
  return NextResponse.json(
    { error: "Please login to submit inquiry" },
    { status: 401 }
  )
}

// Fetch profile via serverSupabase (dengan user session)
const { data: profile, error: profileError } = await serverSupabase
  .from("profiles")
  .select("full_name, email, phone")
  .eq("id", user.id)
  .maybeSingle()

console.log("🔵 Profile fetch result:")
console.log("  profile:", profile)
console.log("  profileError:", profileError)

if (!profile) {
  console.error("❌ Profile not found for user:", user.id)
  console.error("   Error details:", profileError)
  
  return NextResponse.json(
    { error: "Profile not found", debug: profileError?.message },
    { status: 404 }
  )
}
    
    // Init admin client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Insert inquiry with user_id
    const { data: inquiry, error: insertError } = await adminClient
      .from("inquiries")
      .insert({
        user_id: user.id,                    // ← from session
        product_id: product_id || null,
        product_slug,
        product_name,
        buyer_name: profile.full_name,       // ← from profile
        buyer_email: profile.email,          // ← from profile
        phone: phone || (profile as any).phone || null,
        quantity: quantity || null,
        message,
        status: "new",
      })
      .select()
      .single()
    
if (insertError) {
  console.error("❌ Insert inquiry error:", insertError)
  console.error("   Details:", {
    message: insertError.message,
    code: insertError.code,
    hint: insertError.hint,
    details: insertError.details,
  })
  return NextResponse.json(
    { 
      error: "Failed to save inquiry",
      debug: insertError.message  // ← tambah info di response
    },
    { status: 500 }
  )
}
    
    // Optionally update phone di profile kalau berbeda
    if (phone && phone !== (profile as any).phone) {
      await adminClient
        .from("profiles")
        .update({ phone })
        .eq("id", user.id)
    }
    
    // Build WhatsApp URL
    const settings = await getSettingsByKeys([
      "whatsapp_sales",
      "inquiry_wa_template",
    ])
    
    const waNumber = settings.whatsapp_sales || "+6282226585576"
    const waTemplate = settings.inquiry_wa_template || 
      "Halo DZAN, saya {name} tertarik dengan {product}. {message}"
    
    let waMessage = waTemplate
      .replace("{name}", profile.full_name || "Buyer")
      .replace("{product}", product_name)
      .replace("{message}", message)
      .replace("{email}", profile.email || "")
    
    if (quantity) {
      waMessage += `\n\n📦 Quantity: ${quantity} pieces`
    }
    if (phone) {
      waMessage += `\n📞 Phone: ${phone}`
    }
    
    const whatsappUrl = buildWhatsAppUrl(waNumber, waMessage)
    
    return NextResponse.json({
      success: true,
      inquiry_id: inquiry.id,
      whatsapp_url: whatsappUrl,
    })
    
  } catch (error: any) {
    console.error("Inquiry API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}