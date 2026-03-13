import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type SignInPayload = {
  email?: unknown
  password?: unknown
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase auth is not configured." }, { status: 500 })
  }

  let payload: SignInPayload

  try {
    payload = (await request.json()) as SignInPayload
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 })
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : ""
  const password = typeof payload.password === "string" ? payload.password : ""

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        (typeof result?.error_description === "string" && result.error_description) ||
        (typeof result?.msg === "string" && result.msg) ||
        (typeof result?.error === "string" && result.error) ||
        "Unable to sign in."

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    // return the entire result so client can replicate session
    const accessToken =
      (typeof result?.access_token === "string" && result.access_token) ||
      (typeof result?.session?.access_token === "string" && result.session.access_token) ||
      null

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token from auth response." }, { status: 502 })
    }

    // Send both the raw result and explicit access token for backwards compat
    return NextResponse.json(
      { accessToken, session: result.session || result },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Authentication request timed out. Please check connectivity and try again." },
        { status: 504 },
      )
    }

    const causeCode =
      typeof error === "object" &&
      error !== null &&
      "cause" in error &&
      typeof (error as { cause?: { code?: unknown } }).cause?.code === "string"
        ? ((error as { cause: { code: string } }).cause.code as string)
        : null

       // debugger;

        console.error("Error during authentication request:", error);
    if (causeCode === "UND_ERR_CONNECT_TIMEOUT") {
      return NextResponse.json(
        {
          error:
            "Cannot reach Supabase from this server (connection timeout to project host). Check firewall/VPN/network policy and try again.",
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      { error: "Unable to reach authentication service. Please try again shortly." },
      { status: 503 },
    )
  } finally {
    clearTimeout(timeoutId)
  }
}