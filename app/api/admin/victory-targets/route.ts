import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type CreatePayload = {
  brandId: string
  department: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
  title: string
  target: number
  achieved?: number
  owner?: string
  ownerId?: string
  ownerName?: string
  unit: string
  description?: string
  year?: number
  isActive?: boolean
}

type UpdatePayload = CreatePayload & { id: string }

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

function normalizeJoined<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeBrandKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("victory_targets")
      .select(
        "id, name, target, achieved, unit, owner_id, owner_name, year, is_active, company_brands(id, brand_slug, brand_name), departments(id, code, name)",
      )
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const targets = (data || []).map((row) => {
      const brand = normalizeJoined(row.company_brands)
      const department = normalizeJoined(row.departments)

      return {
        id: row.id,
        brandId: brand?.brand_slug || "",
        department: department?.code || "M",
        title: row.name,
        target: row.target,
        achieved: row.achieved,
        unit: row.unit,
        owner: row.owner_name || "",
        ownerId: row.owner_id || undefined,
        deadline: "",
        status: "on-track",
      }
    })

    return NextResponse.json({ targets }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreatePayload
    if (!payload?.brandId || !payload?.department || !payload?.title || !payload?.unit) {
      return NextResponse.json({ error: "brandId, department, title, unit required." }, { status: 400 })
    }

    const supabase = getAdminClient()

    const requestedBrandKey = normalizeBrandKey(payload.brandId)
    const { data: companyBrands, error: brandError } = await supabase
      .from("company_brands")
      .select("id, company_id, brand_slug, brand_name")

    const brand = (companyBrands || []).find(
      (row) =>
        normalizeBrandKey(String(row.brand_slug)) === requestedBrandKey ||
        normalizeBrandKey(String(row.brand_name)) === requestedBrandKey,
    )

    if (brandError || !brand) {
      return NextResponse.json({ error: brandError?.message || "Brand not found in company_brands." }, { status: 400 })
    }

    const { data: department, error: deptError } = await supabase
      .from("departments")
      .select("id")
      .eq("code", payload.department)
      .maybeSingle()

    if (deptError || !department) {
      return NextResponse.json({ error: deptError?.message || "Department not found." }, { status: 400 })
    }

    const insertRow = {
      company_id: brand.company_id,
      brand_id: brand.id,
      department_id: department.id,
      name: payload.title,
      target: payload.target,
      achieved: payload.achieved ?? 0,
      unit: payload.unit,
      owner_id: payload.ownerId ?? null,
      owner_name: payload.ownerName ?? payload.owner ?? null,
      description: payload.description ?? null,
      year: payload.year,
      is_active: payload.isActive ?? true,
    }

    const { data, error } = await supabase.from("victory_targets").insert(insertRow).select("id").single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Insert failed." }, { status: 400 })
    }

    return NextResponse.json({ id: data.id }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as UpdatePayload
    if (!payload?.id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 })
    }

    const supabase = getAdminClient()

    const requestedBrandKey = normalizeBrandKey(payload.brandId)
    const { data: companyBrands } = await supabase
      .from("company_brands")
      .select("id, company_id, brand_slug, brand_name")

    const brand = (companyBrands || []).find(
      (row) =>
        normalizeBrandKey(String(row.brand_slug)) === requestedBrandKey ||
        normalizeBrandKey(String(row.brand_name)) === requestedBrandKey,
    )

    const { data: department } = await supabase
      .from("departments")
      .select("id")
      .eq("code", payload.department)
      .maybeSingle()

    const updateRow = {
      company_id: brand?.company_id ?? undefined,
      brand_id: brand?.id ?? undefined,
      department_id: department?.id ?? undefined,
      name: payload.title,
      target: payload.target,
      achieved: payload.achieved ?? 0,
      unit: payload.unit,
      owner_id: payload.ownerId ?? null,
      owner_name: payload.ownerName ?? payload.owner ?? null,
      description: payload.description ?? null,
      year: payload.year,
      is_active: payload.isActive ?? true,
    }

    const { error } = await supabase.from("victory_targets").update(updateRow).eq("id", payload.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
