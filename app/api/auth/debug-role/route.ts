import { NextResponse } from "next/server"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"

export async function GET() {
  try {
    const accessToken = await getSupabaseAccessTokenFromCookies()

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          reason: "NO_ACCESS_TOKEN_COOKIE",
        },
        { status: 401 },
      )
    }

    const supabase = createSupabaseServerClient()
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

    if (authUserError || !authUserData?.user) {
      return NextResponse.json(
        {
          ok: false,
          reason: "INVALID_ACCESS_TOKEN",
          authError: authUserError?.message || null,
        },
        { status: 401 },
      )
    }

    const authUser = authUserData.user

    const { data: profileById, error: profileByIdError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", authUser.id)
      .maybeSingle()

    let profileByEmail = null
    let profileByEmailError: string | null = null

    if (!profileById && authUser.email) {
      const byEmail = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", authUser.email)
        .maybeSingle()

      profileByEmail = byEmail.data
      profileByEmailError = byEmail.error?.message || null
    }

    const resolvedProfile = profileById || profileByEmail
    const normalizedRole = typeof resolvedProfile?.role === "string" ? resolvedProfile.role.trim().toLowerCase() : ""
    const isSuperAdmin =
      normalizedRole === "super_admin" || normalizedRole === "super admin" || normalizedRole === "superadmin"

    return NextResponse.json(
      {
        ok: true,
        tokenPresent: true,
        authUser: {
          id: authUser.id,
          email: authUser.email || null,
        },
        profileById: profileById || null,
        profileByIdError: profileByIdError?.message || null,
        profileByEmail: profileByEmail || null,
        profileByEmailError,
        resolvedProfile: resolvedProfile || null,
        normalizedRole,
        isSuperAdmin,
        expectedRedirect: isSuperAdmin ? "/superadmin" : "/dashboard",
      },
      { status: 200 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ ok: false, reason: "UNEXPECTED_ERROR", error: message }, { status: 500 })
  }
}
