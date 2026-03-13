import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function resolveRedirectFromRole(role: unknown) {
  const normalizedRole =
    typeof role === "string" ? role.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") : ""
  const isSuperAdmin = normalizedRole === "super_admin" || normalizedRole === "superadmin"
  const isCompanyAdmin = normalizedRole === "company_admin" || normalizedRole === "companyadmin"

  if (isSuperAdmin) {
    return "/superadmin"
  }

  if (isCompanyAdmin) {
    return "/dashboard"
  }

  return "/dashboard"
}

function shouldRedirectToSetPassword(status: unknown) {
  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : ""
  return normalizedStatus === "invited"
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""

    if (!token) {
      return NextResponse.json({ error: "Missing access token." }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(token)

    if (authUserError || !authUserData?.user) {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 })
    }

    const authUser = authUserData.user

    const { data: profileById } = await supabase
      .from("users")
      .select("role, email, status")
      .eq("id", authUser.id)
      .maybeSingle()

    let resolvedProfile = profileById

    if (!resolvedProfile && authUser.email) {
      const { data: profileByEmail } = await supabase
        .from("users")
        .select("role, email, status")
        .eq("email", authUser.email)
        .maybeSingle()

      resolvedProfile = profileByEmail
    }

    console.log("[Post-Login] User profile:", resolvedProfile)
    console.log("[Post-Login] User role:", resolvedProfile?.role)

    if (shouldRedirectToSetPassword(resolvedProfile?.status)) {
      return NextResponse.json({ redirectTo: "/set-password", role: resolvedProfile?.role }, { status: 200 })
    }

    const redirectTo = resolveRedirectFromRole(resolvedProfile?.role)
    console.log("[Post-Login] Resolved redirect:", redirectTo)

    return NextResponse.json({ redirectTo, role: resolvedProfile?.role }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
