import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role credentials")
}

export function createSupabaseServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

type ParsedAuthToken = {
  accessToken: string | null
  refreshToken: string | null
}

function parseSupabaseCookieValue(rawValue: string): ParsedAuthToken {
  const decodedValue = decodeURIComponent(rawValue)

  try {
    const parsed = JSON.parse(decodedValue)

    if (Array.isArray(parsed)) {
      return {
        accessToken: typeof parsed[0] === "string" ? parsed[0] : null,
        refreshToken: typeof parsed[1] === "string" ? parsed[1] : null,
      }
    }

    if (parsed && typeof parsed === "object") {
      const accessToken =
        typeof (parsed as { access_token?: unknown }).access_token === "string"
          ? ((parsed as { access_token: string }).access_token as string)
          : null
      const refreshToken =
        typeof (parsed as { refresh_token?: unknown }).refresh_token === "string"
          ? ((parsed as { refresh_token: string }).refresh_token as string)
          : null

      return { accessToken, refreshToken }
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }

  return { accessToken: null, refreshToken: null }
}

export async function getSupabaseAccessTokenFromCookies() {
  const cookieStore = await cookies()

  const appAccessToken = cookieStore.get("app_access_token")?.value
  if (appAccessToken) {
    return appAccessToken
  }

  const allCookies = cookieStore.getAll()

  const authCookie = allCookies.find((cookie) => cookie.name.endsWith("-auth-token"))
  if (!authCookie?.value) {
    return null
  }

  const { accessToken } = parseSupabaseCookieValue(authCookie.value)
  return accessToken
}
