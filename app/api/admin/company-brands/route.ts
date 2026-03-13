import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase service role credentials")
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * GET /api/admin/company-brands
 * Fetch all brands for the current user's company
 * Accessible by company_admin and super_admin only
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
    const cookieToken = await getSupabaseAccessTokenFromCookies()
    const token = headerToken || cookieToken || ""

    if (!token) {
      return NextResponse.json({ error: "Missing access token." }, { status: 401 })
    }

    const supabase = getAdminClient()

    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 })
    }

    const userId = userData.user.id

    // Get user profile to check role and company_id
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, role, company_id")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: profileError?.message || "User profile not found." }, { status: 404 })
    }

    // Only company_admin and super_admin can access this endpoint
    if (!["company_admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get user's company_id
    const companyId = profile.company_id
    if (!companyId) {
      return NextResponse.json({ error: "User is not associated with a company." }, { status: 400 })
    }

    // Fetch brands for the company
    const { data: companyBrands, error: brandsError } = await supabase
      .from("company_brands")
      .select("id, company_id, brand_name, brand_slug, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })

    if (brandsError) {
      return NextResponse.json({ error: brandsError.message }, { status: 400 })
    }

    return NextResponse.json({
      company_id: companyId,
      brands: companyBrands || [],
      count: companyBrands?.length || 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
