// lib/permissions.ts

export type UserRole = "super_admin" | "admin" | "freelancer" | "buyer"
export type UserScope = "all" | "sales" | "creative" | "product" | null

export interface UserProfile {
  id: string
  full_name: string | null
  email: string
  role: UserRole
  role_scope: UserScope
  is_active: boolean
  recruited_by: string | null
  must_change_password?: boolean
}

/**
 * Cek apakah user bisa add user baru
 */
export function canAddUser(viewer: UserProfile): boolean {
  if (viewer.role === "super_admin") return true
  if (viewer.role === "admin") return true
  return false
}

/**
 * Cek apakah user bisa edit target user
 */
export function canEditUser(
  viewer: UserProfile, 
  target: UserProfile
): boolean {
  // Self-edit always allowed
  if (viewer.id === target.id) return true
  
  // Super admin can edit anyone (except buyer)
  if (viewer.role === "super_admin") {
    return target.role !== "buyer"
  }
  
  // Admin can edit only their recruits
  if (viewer.role === "admin") {
    return target.recruited_by === viewer.id
  }
  
  return false
}

/**
 * Cek apakah user bisa deactivate target
 */
export function canDeactivateUser(
  viewer: UserProfile, 
  target: UserProfile
): boolean {
  // Cannot deactivate self
  if (viewer.id === target.id) return false
  
  // Super admin can deactivate anyone (except other super_admin)
  if (viewer.role === "super_admin") {
    return target.role !== "super_admin"
  }
  
  // Admin can deactivate only their recruits
  if (viewer.role === "admin") {
    return target.recruited_by === viewer.id
  }
  
  return false
}

/**
 * Get allowed roles to assign saat add user
 */
export function getAllowedRolesForAdd(viewer: UserProfile): UserRole[] {
  if (viewer.role === "super_admin") {
    // Super admin can create admin or freelancer
    return ["admin", "freelancer"]
  }
  
  if (viewer.role === "admin") {
    // Admin can only create freelancer
    return ["freelancer"]
  }
  
  return []
}

/**
 * Get allowed scopes saat add user
 */
export function getAllowedScopesForAdd(
  viewer: UserProfile, 
  targetRole: UserRole
): UserScope[] {
  // super_admin
  if (viewer.role === "super_admin") {
    if (targetRole === "admin") {
      return ["sales", "creative", "product"]
    }
    if (targetRole === "freelancer") {
      return ["sales", "creative", "product"]
    }
  }
  
  // admin can only add freelancer in own scope
  if (viewer.role === "admin") {
    return viewer.role_scope ? [viewer.role_scope] : []
  }
  
  return []
}

/**
 * Generate temp password (8 chars alphanumeric)
 */
export function getDefaultPassword(): string {
  return "DzanTeam2026!"
}

/**
 * Get display label for role
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  freelancer: "Freelancer",
  buyer: "Buyer",
}

/**
 * Get display label for scope
 */
export const SCOPE_LABELS: Record<string, string> = {
  all: "Founder",
  sales: "Sales",
  creative: "Creative",
  product: "Product & Artisan",
}