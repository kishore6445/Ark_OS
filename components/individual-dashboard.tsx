"use client"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronDown, Flame, CheckCircle2, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/user-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Image from "next/image"

type TimePeriod = "today" | "this-week" | "this-month" | "this-quarter"

type IndividualDashboardProps = {
  isAdmin: boolean
  currentUserName?: string
  currentUserId?: string
}

export function IndividualDashboard({
  isAdmin,
  currentUserName = "",
  currentUserId = "",
}: IndividualDashboardProps) {
  const { currentUser, isLoading: isUserLoading } = useUser()
  const [tasks, setTasks] = useState([])
  const [commitments, setCommitments] = useState([])
  const [powerMoves, setPowerMoves] = useState<any[]>([])
  const [victoryTargets, setVictoryTargets] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isTrackingLoading, setIsTrackingLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today")

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const toggleCommitment = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, completed: !c.completed, status: !c.completed ? "Completed" : "In Progress" } : c,
      ),
    )
  }

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        setIsLoadingData(true)
        const [pmResponse, vtResponse] = await Promise.all([
          fetch("/api/admin/power-moves", { cache: "no-store" }),
          fetch("/api/admin/victory-targets", { cache: "no-store" }),
        ])

        const pmResult = await pmResponse.json().catch(() => ({}))
        const vtResult = await vtResponse.json().catch(() => ({}))

        if (!isActive) return

        setPowerMoves(Array.isArray(pmResult.powerMoves) ? pmResult.powerMoves : [])
        setVictoryTargets(Array.isArray(vtResult.targets) ? vtResult.targets : [])
      } catch {
        if (!isActive) return
        setPowerMoves([])
        setVictoryTargets([])
      } finally {
        if (isActive) setIsLoadingData(false)
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [])

  const getPowerMoveOwnerId = (powerMove: any) => powerMove.owner_id ?? powerMove.ownerId ?? ""
  const getPowerMoveOwnerName = (powerMove: any) => powerMove.owner ?? powerMove.ownerName ?? ""

  const getVictoryTargetOwnerId = (target: any) => target.owner_id ?? target.ownerId ?? ""
  const getVictoryTargetOwnerName = (target: any) => target.owner ?? target.ownerName ?? ""

  const effectiveUserId = currentUser?.id || currentUserId
  const effectiveUserName = currentUser?.name || currentUserName

  const displayName = currentUser?.name || currentUserName || "—"
  const displayRole = currentUser?.role || (isAdmin ? "Admin" : "Member")
  const displayBrands = currentUser?.assignments
    ? new Set(currentUser.assignments.map((assignment) => assignment.brand)).size
    : 0
  const displayAvatar = currentUser?.avatar || ""
  const displayStreak = 0

  const myPowerMoves = isAdmin
    ? powerMoves
    : effectiveUserId || effectiveUserName
      ? powerMoves.filter((pm: any) => {
          if (effectiveUserId) {
            return getPowerMoveOwnerId(pm) === effectiveUserId
          }
          return getPowerMoveOwnerName(pm) === effectiveUserName
        })
      : []

  const myVictoryTargets = isAdmin
    ? victoryTargets
    : effectiveUserId || effectiveUserName
      ? victoryTargets.filter((vt: any) => {
          if (effectiveUserId) {
            return getVictoryTargetOwnerId(vt) === effectiveUserId
          }
          return getVictoryTargetOwnerName(vt) === effectiveUserName
        })
      : []

  const getTargetActualForPeriod = (pm: any, period: TimePeriod) => {
    switch (period) {
      case "today":
        return {
          target: pm.dailyTarget ?? pm.weeklyTarget ?? 0,
          actual: pm.dailyActual ?? 0,
        }
      case "this-week":
        return { target: pm.weeklyTarget ?? 0, actual: pm.weeklyActual ?? 0 }
      case "this-month":
        return { target: pm.monthlyTarget ?? 0, actual: pm.monthlyActual ?? 0 }
      case "this-quarter":
        return { target: pm.quarterlyTarget ?? 0, actual: pm.quarterlyActual ?? 0 }
    }
    return { target: 0, actual: 0 }
  }

  const getActualFieldForPeriod = (pm: any, period: TimePeriod) => {
    switch (period) {
      case "today":
        return "dailyActual"
      case "this-week":
        return "weeklyActual"
      case "this-month":
        return "monthlyActual"
      case "this-quarter":
        return "quarterlyActual"
    }
    return "weeklyActual"
  }

  const getTargetFieldForPeriod = (period: TimePeriod) => {
    switch (period) {
      case "today":
        return "dailyTarget"
      case "this-week":
        return "weeklyTarget"
      case "this-month":
        return "monthlyTarget"
      case "this-quarter":
        return "quarterlyTarget"
    }
    return "weeklyTarget"
  }

  const powerMoveIds = useMemo(
    () => powerMoves.map((pm) => pm.id).filter(Boolean).join(","),
    [powerMoves],
  )

  useEffect(() => {
    if (!powerMoveIds) {
      setIsTrackingLoading(false)
      return
    }

    const controller = new AbortController()
    let isActive = true

    setIsTrackingLoading(true)

    const loadTracking = async () => {
      try {
        const response = await fetch(
          `/api/power-move-tracking?period=${encodeURIComponent(selectedPeriod)}&powerMoveIds=${encodeURIComponent(
            powerMoveIds,
          )}`,
          { signal: controller.signal },
        )
        const result = await response.json().catch(() => ({}))

        if (!response.ok || !Array.isArray(result.tracking)) return

        const trackingMap = new Map<string, { actual: number; target: number }>(
          result.tracking.map((row: any) => [row.power_move_id, row]),
        )

        setPowerMoves((prev) =>
          prev.map((pm) => {
            const tracked = trackingMap.get(pm.id)
            if (!tracked) return pm
            const actualField = getActualFieldForPeriod(pm, selectedPeriod)
            const targetField = getTargetFieldForPeriod(selectedPeriod)
            return {
              ...pm,
              [actualField]: tracked.actual,
              [targetField]: tracked.target ?? pm[targetField],
            }
          }),
        )
      } catch {
        // Ignore tracking failures
      } finally {
        if (isActive) setIsTrackingLoading(false)
      }
    }

    loadTracking()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [selectedPeriod, powerMoveIds])

  const periodData = myPowerMoves.reduce(
    (acc, pm) => {
      const { target, actual } = getTargetActualForPeriod(pm, selectedPeriod)
      if (!target) return acc
      const safeActual = Math.max(actual || 0, 0)
      return {
        completed: acc.completed + Math.min(safeActual, target),
        total: acc.total + target,
        target: acc.target + target,
      }
    },
    { completed: 0, total: 0, target: 0 },
  )

  const executionPercentage = periodData.total > 0 ? Math.round((periodData.completed / periodData.total) * 100) : 0

  const handleCompletePowerMove = async (id: string) => {
    let trackingPayload: { powerMoveId: string; period: TimePeriod; target: number; actual: number; completedById?: string } | null = null

    setPowerMoves((prev) =>
      prev.map((pm) => {
        if (pm.id !== id) return pm
        const { target, actual } = getTargetActualForPeriod(pm, selectedPeriod)
        const actualField = getActualFieldForPeriod(pm, selectedPeriod)
        const nextActual = Math.min((actual || 0) + 1, target)
        trackingPayload = {
          powerMoveId: pm.id,
          period: selectedPeriod,
          target,
          actual: nextActual,
          completedById: effectiveUserId || undefined,
        }
        return { ...pm, [actualField]: nextActual }
      }),
    )

    if (!trackingPayload || trackingPayload.target <= 0) return

    try {
      await fetch("/api/power-move-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackingPayload),
      })

      if (trackingPayload.period === "today") {
        await fetch("/api/power-move-tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...trackingPayload,
            period: "this-week",
          }),
        })
      }
    } catch {
      // Ignore tracking failures to avoid blocking UI
    }
  }

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "today":
        return "Today"
      case "this-week":
        return "This Week"
      case "this-month":
        return "This Month"
      case "this-quarter":
        return "This Quarter"
    }
  }

  const getExecutionStatus = () => {
    if (executionPercentage >= 70) return "on-track"
    if (executionPercentage >= 50) return "at-risk"
    return "needs-momentum"
  }

  const executionStatus = getExecutionStatus()

  // Calculate today's power moves
  const todayPowerMoves = myPowerMoves.filter((pm) => {
    const { target } = getTargetActualForPeriod(pm, "today")
    return target > 0
  })
  const todayCompletedCount = todayPowerMoves.filter((pm) => {
    const { actual, target } = getTargetActualForPeriod(pm, "today")
    return actual >= target
  }).length

  if (isLoadingData || isUserLoading || isTrackingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <p className="text-sm text-stone-500">Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <section className='px-4 sm:px-6 lg:px-8 pb-8 space-y-8' aria-labelledby='personal-dashboard-heading'>
      {/* HERO SECTION - Premium 3-Column Execution Cockpit */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
        
        {/* LEFT COLUMN - USER IDENTITY */}
        <div className='flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200/60 hover:shadow-md transition-shadow'>
          {/* Large Avatar */}
          <div className='relative mb-6'>
            <div className='h-24 w-24 rounded-full overflow-hidden border-3 border-stone-200 shadow-md bg-stone-100'>
              <Image
                src={displayAvatar || '/placeholder.svg'}
                alt={displayName}
                width={96}
                height={96}
                className='h-full w-full object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-stone-100')
                }}
              />
            </div>
            {displayStreak > 0 && (
              <div className='absolute -bottom-2 -right-2 bg-orange-500 text-white text-sm font-black rounded-full h-8 w-8 flex items-center justify-center shadow-lg border-2 border-white'>
                <Flame className='h-4 w-4' />
              </div>
            )}
          </div>
          
          {/* User Info */}
          <h2 className='text-2xl font-black text-stone-900 tracking-tight'>{displayName}</h2>
          <p className='text-sm font-semibold text-stone-600 mt-2'>
            {displayRole}
          </p>
          <p className='text-xs text-stone-500 mt-1'>
            {displayBrands} {displayBrands === 1 ? 'Brand' : 'Brands'}
          </p>
          
          {/* Streak Badge */}
          {displayStreak > 0 && (
            <div className='mt-4 px-4 py-2 bg-orange-50 rounded-full'>
              <p className='text-xs font-bold text-orange-700'>
                🔥 {displayStreak} Day Execution Streak
              </p>
              <p className='text-xs text-orange-600 mt-1'>Keep the momentum going</p>
            </div>
          )}
        </div>

        {/* CENTER COLUMN - EXECUTION SCORE (HERO) */}
        <div className={cn(
          'flex flex-col items-center justify-center p-8 rounded-2xl shadow-md border-2 transition-all',
          executionStatus === 'on-track' 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300'
            : executionStatus === 'at-risk'
            ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300'
            : 'bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-300'
        )}>
          <p className='text-xs font-bold uppercase tracking-widest text-stone-600 mb-4'>
            {getPeriodLabel(selectedPeriod)} Score
          </p>
          
          {/* Giant Circular Score */}
          <div className='relative w-40 h-40 flex items-center justify-center mb-6'>
            <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke='currentColor'
                strokeWidth='3'
                className='text-stone-200'
              />
              <circle
                cx='50'
                cy='50'
                r='45'
                fill='none'
                stroke={executionStatus === 'on-track' ? '#22C55E' : executionStatus === 'at-risk' ? '#F59E0B' : '#EF4444'}
                strokeWidth='3'
                strokeDasharray={`${2.83 * 45 * (executionPercentage / 100)} ${2.83 * 45}`}
                strokeLinecap='round'
                className='transition-all duration-700'
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <div className='text-5xl font-black' style={{
                color: executionStatus === 'on-track' ? '#22C55E' : executionStatus === 'at-risk' ? '#F59E0B' : '#EF4444'
              }}>
                {executionPercentage}
              </div>
              <div className='text-sm font-semibold text-stone-500'>/100</div>
            </div>
          </div>

          {/* Status Label */}
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold',
            executionStatus === 'on-track' 
              ? 'bg-emerald-200 text-emerald-900'
              : executionStatus === 'at-risk'
              ? 'bg-amber-200 text-amber-900'
              : 'bg-rose-200 text-rose-900'
          )}>
            {executionStatus === 'on-track' ? <CheckCircle2 className='h-4 w-4' /> : <AlertCircle className='h-4 w-4' />}
            {executionStatus === 'on-track' ? 'ON TRACK' : executionStatus === 'at-risk' ? 'NEEDS MOMENTUM' : 'AT RISK'}
          </div>

          {/* Detail Stats */}
          <div className='mt-6 pt-6 border-t-2 border-stone-200/40 w-full text-center'>
            <div className='text-3xl font-black text-stone-900 tabular-nums'>
              {periodData.completed} <span className='text-stone-400'>/</span> {periodData.total}
            </div>
            <p className='text-xs font-semibold text-stone-600 mt-2 uppercase tracking-wide'>
              Power Move Actions Complete
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN - TODAY'S FOCUS */}
        <div className='p-8 bg-white rounded-2xl shadow-sm border border-stone-200/60'>
          <div className='flex items-center gap-2 mb-6'>
            <h3 className='text-base font-black text-stone-900 uppercase tracking-wide'>Today&apos;s Focus</h3>
            <span className='text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full'>
              {todayPowerMoves.length - todayCompletedCount}/{todayPowerMoves.length}
            </span>
          </div>
          
          {/* Top 3 Power Moves */}
          <div className='space-y-3'>
            {todayPowerMoves.slice(0, 3).length === 0 ? (
              <p className='text-xs text-stone-500 text-center py-4'>No power moves for today</p>
            ) : (
              todayPowerMoves.slice(0, 3).map((pm, index) => {
                const { target, actual } = getTargetActualForPeriod(pm, 'today')
                const isCompleted = actual >= target
                return (
                  <div
                    key={pm.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-all',
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                    )}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleCompletePowerMove(pm.id)}
                      className='mt-1'
                      disabled={isCompleted}
                    />
                    <div className='flex-1 min-w-0'>
                      <p className={cn(
                        'text-sm font-semibold text-stone-900 truncate',
                        isCompleted && 'line-through text-stone-500'
                      )}>
                        {pm.name}
                      </p>
                      <p className='text-xs text-stone-500 mt-0.5'>{actual}/{target} completed</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          {todayPowerMoves.length > 3 && (
            <p className='text-xs text-stone-500 text-center pt-2 font-semibold'>
              +{todayPowerMoves.length - 3} more today
            </p>
          )}
        </div>
      </div>

      {/* TIME PERIOD SELECTOR */}
      <div className='flex justify-between items-center px-6 py-4 bg-white rounded-xl border border-stone-200/60 shadow-sm'>
        <p className='text-sm font-semibold text-stone-600 uppercase tracking-wide'>Time Period</p>
        <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as TimePeriod)}>
          <SelectTrigger className='w-40 bg-stone-50 border-stone-200'>
            <Calendar className='h-4 w-4 mr-2 text-stone-500' />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='today'>Today</SelectItem>
            <SelectItem value='this-week'>This Week</SelectItem>
            <SelectItem value='this-month'>This Month</SelectItem>
            <SelectItem value='this-quarter'>This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* POWER MOVES SECTION - Modern Cards */}
      <div className='bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden'>
        <div className='px-6 py-5 border-b border-stone-200/60 bg-stone-50'>
          <div className='flex items-center gap-3'>
            <div className='w-3 h-3 rounded-full bg-emerald-500' />
            <div>
              <p className='text-sm font-black uppercase tracking-[0.1em] text-stone-900'>Power Moves</p>
              <p className='text-xs text-stone-500 mt-0.5'>Lead Measures - Recurring Actions</p>
            </div>
          </div>
        </div>

        <div className='divide-y divide-stone-200/60'>
          {myPowerMoves.length === 0 ? (
            <p className='px-6 py-8 text-center text-sm text-stone-500'>No power moves yet for this period.</p>
          ) : (
            myPowerMoves.map((pm, index) => {
              const { target, actual } = getTargetActualForPeriod(pm, selectedPeriod)
              const percentage = target > 0 ? Math.round((actual / target) * 100) : 0
              const isCompleted = actual >= target
              const isPrimary = index < 2

              return (
                <div
                  key={pm.id}
                  className='px-6 py-4 hover:bg-stone-50/50 transition-colors'
                >
                  <div className='flex items-center justify-between gap-4 mb-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <h4 className='text-sm font-bold text-stone-900 truncate'>{pm.name}</h4>
                        {isPrimary && (
                          <span className='inline-flex text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 whitespace-nowrap'>
                            Primary
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-stone-500 mt-1'>{pm.brand}</p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <div className='text-right'>
                        <p className='text-sm font-bold text-stone-900'>{actual}/{target}</p>
                        <p className='text-xs text-stone-500'>{pm.frequency}</p>
                      </div>
                      <Button
                        size='sm'
                        onClick={() => handleCompletePowerMove(pm.id)}
                        disabled={isCompleted}
                        className={cn(
                          'text-xs font-bold',
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        )}
                      >
                        {isCompleted ? '✓ Done' : 'Complete'}
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='mt-3'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-xs font-semibold text-stone-600'>Progress</span>
                      <span className={cn(
                        'text-xs font-bold px-2 py-1 rounded-full',
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : percentage > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-stone-200 text-stone-700'
                      )}>
                        {isCompleted ? 'Completed' : percentage > 0 ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                    <div className='h-2 bg-stone-200 rounded-full overflow-hidden'>
                      <div
                        className={cn(
                          'h-full transition-all duration-500',
                          isCompleted ? 'bg-emerald-600' : percentage > 0 ? 'bg-amber-500' : 'bg-stone-300'
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* TASKS AND COMMITMENTS - Collapsible Sections */}
      <div className='space-y-4'>
        {/* Tasks Section */}
        <Collapsible defaultOpen className='bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden'>
          <div className='px-6 py-4 border-b border-stone-200/60 bg-stone-50'>
            <CollapsibleTrigger className='w-full flex items-center justify-between hover:opacity-75 transition-opacity'>
              <div className='flex items-center gap-3'>
                <div className='w-3 h-3 rounded-full bg-amber-500' />
                <div className='text-left'>
                  <p className='text-sm font-black uppercase tracking-[0.1em] text-stone-900'>Tasks</p>
                  <p className='text-xs text-stone-500 mt-0.5'>One-Time Activities</p>
                </div>
              </div>
              <ChevronDown className='h-4 w-4 text-stone-500' />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className='divide-y divide-stone-200/60'>
            {tasks.length === 0 ? (
              <p className='px-6 py-4 text-sm text-stone-500'>No tasks for this period</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className='px-6 py-4 flex items-center gap-3 hover:bg-stone-50/50'>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className='h-5 w-5'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className={cn(
                      'text-sm font-semibold text-stone-900',
                      task.completed && 'line-through text-stone-400'
                    )}>
                      {task.title}
                    </p>
                  </div>
                  {task.brand && (
                    <Badge variant='outline' className='text-xs font-semibold whitespace-nowrap'>
                      {task.brand}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Commitments Section */}
        <Collapsible defaultOpen className='bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden'>
          <div className='px-6 py-4 border-b border-stone-200/60 bg-stone-50'>
            <CollapsibleTrigger className='w-full flex items-center justify-between hover:opacity-75 transition-opacity'>
              <div className='flex items-center gap-3'>
                <div className='w-3 h-3 rounded-full bg-rose-500' />
                <div className='text-left'>
                  <p className='text-sm font-black uppercase tracking-[0.1em] text-stone-900'>Commitments</p>
                  <p className='text-xs text-stone-500 mt-0.5'>Team Promises</p>
                </div>
              </div>
              <ChevronDown className='h-4 w-4 text-stone-500' />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className='divide-y divide-stone-200/60'>
            {commitments.length === 0 ? (
              <p className='px-6 py-4 text-sm text-stone-500'>No commitments for this period</p>
            ) : (
              commitments.map((commitment) => (
                <div key={commitment.id} className='px-6 py-4 flex items-center gap-3 hover:bg-stone-50/50'>
                  <Checkbox
                    checked={commitment.completed}
                    onCheckedChange={() => toggleCommitment(commitment.id)}
                    className='h-5 w-5'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className={cn(
                      'text-sm font-semibold text-stone-900',
                      commitment.completed && 'line-through text-stone-400'
                    )}>
                      {commitment.title}
                    </p>
                  </div>
                  {commitment.brand && (
                    <Badge variant='outline' className='text-xs font-semibold whitespace-nowrap'>
                      {commitment.brand}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  )
}
