import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type AssignmentRow = {
  id: string
  user_id: string
  brand_id: string
  created_at: string | null
  users: { name: string; email: string } | { name: string; email: string }[] | null
}

type UserRow = {
  id: string
  name: string
  email: string
}

type CompanyBrandRow = {
  id: string
  brand_name: string
  brand_slug: string
}

type CreateAssignmentPayload = {
  userId: string
  brandId: string
  brandName?: string
}

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

function normalizeUser(user: AssignmentRow["users"]) {
  return Array.isArray(user) ? user[0] : user
}

function normalizeBrandKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

async function hydrateAssignments(
  supabase: ReturnType<typeof getAdminClient>,
  rows: AssignmentRow[],
) {
  const userIds = new Set<string>()
  const brandIds = new Set<string>()

  rows.forEach((row) => {
    const user = normalizeUser(row.users)
    if (!user?.name || !user?.email) {
      userIds.add(row.user_id)
    }
    brandIds.add(row.brand_id)
  })

  const [userResult, brandResult] = await Promise.all([
    userIds.size > 0
      ? supabase.from("users").select("id, name, email").in("id", Array.from(userIds))
      : Promise.resolve({ data: [] as UserRow[], error: null }),
    brandIds.size > 0
      ? supabase.from("company_brands").select("id, brand_name, brand_slug").in("id", Array.from(brandIds))
      : Promise.resolve({ data: [] as CompanyBrandRow[], error: null }),
  ])

  const userMap = new Map((userResult.data || []).map((user) => [user.id, user]))
  const brandMap = new Map((brandResult.data || []).map((brand) => [brand.id, brand]))

  return rows.map((row) => {
    const joinedUser = normalizeUser(row.users)
    const user = joinedUser?.name && joinedUser?.email ? joinedUser : userMap.get(row.user_id)
    const brand = brandMap.get(row.brand_id)

    return {
      id: row.id,
      userId: row.user_id,
      userName: user?.name || "",
      userEmail: user?.email || "",
      brandId: brand?.brand_slug || "",
      brandName: brand?.brand_name || "",
      departments: [],
      createdAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    }
  })
}

export async function GET() {
  try {
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from("user_brand_access")
      .select("id, user_id, brand_id, created_at, users(name, email)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const assignments = await hydrateAssignments(supabase, (data || []) as AssignmentRow[])
    return NextResponse.json({ assignments }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateAssignmentPayload
    const requestedBrandSlug = (payload?.brandId || "").trim().toLowerCase()
    const requestedBrandName = (payload?.brandName || "").trim().toLowerCase()
    const requestedBrandKey = normalizeBrandKey(requestedBrandSlug || requestedBrandName)

    if (!payload?.userId || !requestedBrandKey) {
      return NextResponse.json({ error: "User and brand are required." }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", payload.userId)
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || "User not found." }, { status: 400 })
    }

    const { data: brandRows, error: brandError } = await supabase
      .from("company_brands")
      .select("id, brand_name, brand_slug")
      .order("brand_name", { ascending: true })

    const brand = (brandRows || []).find(
      (row) =>
        normalizeBrandKey(String(row.brand_slug)) === requestedBrandKey ||
        normalizeBrandKey(String(row.brand_name)) === requestedBrandKey,
    )

    if (brandError || !brand) {
      return NextResponse.json(
        {
          error: brandError?.message || "Brand not found in company_brands table.",
          details: { requestedBrandSlug, requestedBrandName, requestedBrandKey },
        },
        { status: 400 },
      )
    }

    const { data: existing, error: existingError } = await supabase
      .from("user_brand_access")
      .select("id, user_id, brand_id, created_at, users(name, email)")
      .eq("user_id", payload.userId)
      .eq("brand_id", brand.id)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 })
    }

    if (existing) {
      const [assignment] = await hydrateAssignments(supabase, [existing as AssignmentRow])
      return NextResponse.json({ assignment, alreadyExists: true }, { status: 200 })
    }

    debugger
    // Breakpoint before writing to DB so request payload and resolved brand can be inspected.
    const { data, error } = await supabase
      .from("user_brand_access")
      .insert({ user_id: payload.userId, brand_id: brand.id })
      .select("id, user_id, brand_id, created_at, users(name, email)")
      .single()

    // Breakpoint after DB write to inspect Supabase response/error.
    debugger

    if (error || !data) {
      return NextResponse.json(
        {
          error: error?.message || "Unable to assign brand.",
          details: {
            code: error?.code,
            userId: payload.userId,
            resolvedBrandId: brand.id,
            resolvedBrandSlug: brand.brand_slug,
          },
        },
        { status: 400 },
      )
    }

    const [assignment] = await hydrateAssignments(supabase, [data as AssignmentRow])
    return NextResponse.json({ assignment }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { id?: string }

    if (!payload?.id) {
      return NextResponse.json({ error: "Assignment id is required." }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from("user_brand_access")
      .select("id, user_id, brand_id, created_at, users(name, email)")
      .eq("id", payload.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Assignment not found." }, { status: 400 })
    }

    const [assignment] = await hydrateAssignments(supabase, [data as AssignmentRow])
    return NextResponse.json({ assignment }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Assignment id is required." }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { error } = await supabase.from("user_brand_access").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
