/**
 * Strip :3000 port from Codespace URLs.
 * Codespace public forwarding doesn't include port.
 */
const stripCodespacePort = (url: URL): URL => {
  if (url.hostname.endsWith(".app.github.dev") && url.port === "3000") {
    url.port = ""
  }
  return url
}

/**
 * Get application base URL for redirects, emails, and cross-page navigation.
 * 
 * Priority:
 * 1. Explicit NEXT_PUBLIC_APP_URL (production/staging deployments)
 * 2. Vercel auto-URL (preview deployments)
 * 3. Request URL (server context — route handlers, server components)
 * 4. Browser origin (client context)
 * 5. localhost fallback (SSR in dev)
 * 
 * Auto-strips :3000 from Codespace URLs (public URL doesn't use port).
 */
export const getBaseUrl = (requestUrl?: string | URL): string => {
  // 1. Explicit env var (production, staging)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  
  // 2. Vercel deployment URL (auto-set by Vercel)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  
  // 3. Request URL (server context — pass explicitly)
  if (requestUrl) {
    const url = typeof requestUrl === "string" 
      ? new URL(requestUrl) 
      : requestUrl
    
    return stripCodespacePort(url).origin
  }
  
  // 4. Browser origin (client context)
  if (typeof window !== "undefined") {
    const url = new URL(window.location.origin)
    return stripCodespacePort(url).origin
  }
  
  // 5. Fallback (SSR in dev without request context)
  return "http://localhost:3000"
}
