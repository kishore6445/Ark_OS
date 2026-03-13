import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""

    if (!token) {
      return NextResponse.json({ error: "Missing access token." }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })

    response.cookies.set({
      name: "app_access_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
