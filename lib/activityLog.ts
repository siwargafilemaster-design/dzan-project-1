import { createClient } from "@/lib/supabase-server"

// Type definitions untuk TypeScript safety
type ActivityAction = "create" | "update" | "delete" | "upload"

type ActivityEntityType = 
  | "product" 
  | "artisan" 
  | "media" 
  | "photo" 
  | "bts" 
  | "inquiry" 
  | "qr"
  | "team"
  | "settings"

interface LogActivityParams {
  action: ActivityAction
  entityType: ActivityEntityType
  entityId?: string
  entityName?: string
  description: string
  before?: Record<string, any>
  after?: Record<string, any>
}

/**
 * Auto-log activity ke tabel activity_log
 * 
 * Pakai di setiap CRUD operation di /admin/* pages
 * Jangan block operation kalau log gagal (silent fail + console.error)
 * 
 * Contoh:
 * await logActivity({
 *   action: "update",
 *   entityType: "product",
 *   entityId: productId,
 *   entityName: "Batik Kawung Lawu",
 *   description: "Update harga: Rp 15.000 → Rp 20.000",
 *   before: { price: 15000 },
 *   after: { price: 20000 }
 * })
 */
export const logActivity = async (params: LogActivityParams) => {
  try {
    const supabase = await createClient()
    
    // Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error("⚠️ logActivity: User tidak ditemukan, log dilewati")
      return
    }
    
    // Ambil snapshot data actor (untuk historical accuracy)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, role_scope")
      .eq("id", user.id)
      .single()
    
    if (!profile) {
      console.error("⚠️ logActivity: Profile tidak ditemukan, log dilewati")
      return
    }
    
    // Insert ke activity_log
    const { error } = await supabase
      .from("activity_log")
      .insert({
        actor_id: user.id,
        actor_name: profile.full_name,
        actor_role: profile.role_scope || profile.role, // fallback ke role kalau scope null
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        entity_name: params.entityName || null,
        description: params.description,
        before_value: params.before || null,
        after_value: params.after || null,
      })
    
    if (error) {
      console.error("⚠️ logActivity: Insert gagal —", error.message)
    }
    
  } catch (error: any) {
    // Silent fail — jangan block parent operation
    console.error("⚠️ logActivity: Unexpected error —", error?.message || error)
  }
}