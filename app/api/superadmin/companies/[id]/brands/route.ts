import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient, getSupabaseAccessTokenFromCookies } from "@/lib/supabase/server"

type CompanyBrand = {
  id: string
  company_id: string
  brand_name: string
  brand_slug: string
  created_at: string
}

type RequestBody = {
  brand_name: string
  brand_slug: string
}

/**
 * GET /api/superadmin/companies/[id]/brands
 * Fetch all brands assigned to a company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const accessToken = await getSupabaseAccessTokenFromCookies()
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClient()
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

    if (authUserError || !authUserData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super_admin
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUserData.user.id)
      .single()

    if (userRole?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: companyId } = await params

    // Get all brands assigned to this company
    const { data: companyBrands, error } = await supabase
      .from("company_brands")
      .select("id, company_id, brand_name, brand_slug, created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      company_id: companyId,
      brands: companyBrands || [],
      count: companyBrands?.length || 0,
    })
  } catch (err) {
    console.error("[GET /api/superadmin/companies/brands]", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

/**
 * POST /api/superadmin/companies/[id]/brands
 * Add a brand to a company
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const accessToken = await getSupabaseAccessTokenFromCookies()
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClient()
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

    if (authUserError || !authUserData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super_admin
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUserData.user.id)
      .single()

    if (userRole?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: companyId } = await params
    const body: RequestBody = await request.json()

    if (!body.brand_name || !body.brand_slug) {
      return NextResponse.json(
        { error: "brand_name and brand_slug are required" },
        { status: 400 },
      )
    }

    // Insert the new company_brand association
    const { data: newBrand, error: insertError } = await supabase
      .from("company_brands")
      .insert({
        company_id: companyId,
        brand_name: body.brand_name,
        brand_slug: body.brand_slug,
        assigned_by: authUserData.user.id,
      })
      .select()
      .single()

    if (insertError) {
      // Check if it's a unique constraint error
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This brand slug is already assigned to this company" },
          { status: 409 },
        )
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Brand added to company successfully",
        data: newBrand,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error("[POST /api/superadmin/companies/brands]", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/superadmin/companies/[id]/brands/[brandId]
 * Remove a brand from a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const accessToken = await getSupabaseAccessTokenFromCookies()
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createSupabaseServerClient()
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken)

    if (authUserError || !authUserData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is super_admin
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUserData.user.id)
      .single()

    if (userRole?.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: companyId } = await params
    const url = new URL(request.url)
    const companyBrandId = url.searchParams.get("company_brand_id")

    if (!companyBrandId) {
      return NextResponse.json(
        { error: "company_brand_id is required" },
        { status: 400 },
      )
    }

    // Check if the brand being deleted is primary, and if so, reassign primary to another brand
    const { data: brandToDelete } = await supabase
      .from("company_brands")
      .select("is_primary")
      .eq("id", companyBrandId)
      .eq("company_id", companyId)
      .single()

    if (!brandToDelete) {
      return NextResponse.json(
        { error: "Brand assignment not found" },
        { status: 404 },
      )
    }

    // Delete the brand assignment
    const { error: deleteError } = await supabase
      .from("company_brands")
      .delete()
      .eq("id", companyBrandId)
      .eq("company_id", companyId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    // If the deleted brand was primary, reassign primary to another brand
    if (brandToDelete.is_primary) {
      const { data: remainingBrands } = await supabase
        .from("company_brands")
        .select("id")
        .eq("company_id", companyId)
        .limit(1)

      if (remainingBrands && remainingBrands.length > 0) {
        await supabase
          .from("company_brands")
          .update({ is_primary: true })
          .eq("id", remainingBrands[0].id)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Brand removed from company successfully",
    })
  } catch (err) {
    console.error("[DELETE /api/superadmin/companies/brands]", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
