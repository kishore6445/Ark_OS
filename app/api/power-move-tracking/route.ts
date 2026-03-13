import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type TrackPayload = {
  powerMoveId: string
  period: "today" | "this-week" | "this-month" | "this-quarter"
  target: number
  actual: number
  completedById?: string | null
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

function toDateString(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getPeriodDate(period: TrackPayload["period"]) {
  const now = new Date()
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  if (period === "today") {
    return toDateString(utcDate)
  }

  if (period === "this-week") {
    const day = utcDate.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const startOfWeek = new Date(utcDate)
    startOfWeek.setUTCDate(utcDate.getUTCDate() + diff)
    return toDateString(startOfWeek)
  }

  if (period === "this-month") {
    const startOfMonth = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), 1))
    return toDateString(startOfMonth)
  }

  const quarterStartMonth = Math.floor(utcDate.getUTCMonth() / 3) * 3
  const startOfQuarter = new Date(Date.UTC(utcDate.getUTCFullYear(), quarterStartMonth, 1))
  return toDateString(startOfQuarter)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TrackPayload>
    const powerMoveId = body.powerMoveId
    const period = body.period
    const target = body.target
    const actual = body.actual

    if (!powerMoveId || !period || typeof target !== "number" || typeof actual !== "number") {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const periodDate = getPeriodDate(period)
    const supabase = getAdminClient()

    const { error } = await supabase
      .from("power_move_tracking")
      .upsert(
        {
          power_move_id: powerMoveId,
          period_date: periodDate,
          target,
          actual,
          is_completed: actual >= target,
          completed_by_id: body.completedById ?? null,
        },
        { onConflict: "power_move_id,period_date" },
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to track power move." },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") as TrackPayload["period"] | null
    const powerMoveIds = searchParams.get("powerMoveIds")

    if (!period || !powerMoveIds) {
      return NextResponse.json({ error: "Missing period or powerMoveIds." }, { status: 400 })
    }

    const ids = powerMoveIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    if (ids.length === 0) {
      return NextResponse.json({ tracking: [] })
    }

    const periodDate = getPeriodDate(period)
    const supabase = getAdminClient()

    const { data, error } = await supabase
      .from("power_move_tracking")
      .select("power_move_id, actual, target")
      .eq("period_date", periodDate)
      .in("power_move_id", ids)

      if(data){
        //debugger;
        console.log('data:', data);
      }  

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tracking: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load power move tracking." },
      { status: 500 },
    )
  }
}