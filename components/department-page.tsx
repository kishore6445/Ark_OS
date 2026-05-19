"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppMode } from "@/hooks/use-app-mode"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { UnifiedWIGSession } from "@/components/unified-wig-session"
import type { BPRMetric } from "@/components/bpr-scorecard"
import { VictoryTargetsScoreboard } from "@/components/victory-targets-scoreboard"
import { useToast } from "@/hooks/use-toast"
import { PageTransition } from "@/components/page-transition"
import { DepartmentExecutionHero } from "@/components/department-execution-hero"
import { Plus, CheckCircle2 } from "lucide-react"
import { VictoryTargetModal } from "@/components/victory-target-modal"
import { PowerMoveModal, type PowerMoveFormData } from "@/components/power-move-modal"
import { CreateTaskModal } from "@/components/create-task-modal"
import { CreateCommitmentModal } from "@/components/create-commitment-modal"
import { PowerMovesTable } from "@/components/power-moves-table"
import { Checkbox } from "@/components/ui/checkbox"
import { WeeklyReviewSession } from "@/components/weekly-review-session"
import { calculateDepartmentScore } from "@/lib/score-calculations"
import { cn } from "@/lib/utils"
import { getCurrentQuarter } from "@/lib/brand-structure"
import type { QuarterOption } from "@/components/quarter-selector"
import { useBrand } from "@/lib/brand-context"

export interface VictoryTarget {
  id: string
  title: string
  target: number
  achieved: number
  unit?: string
  status: "on-track" | "at-risk"
  description?: string
  owner: string
  ownerId?: string
}

export interface PowerMove {
  id: string
  name: string
  frequency: string
  targetPerCycle: number
  progress: number
  owner: string
  linkedVictoryTarget?: string
  activityCompleted?: boolean // Did we DO the activity this cycle?
  weeklyTarget?: number // e.g., "10 client calls per week"
  weeklyActual?: number // e.g., "7 calls completed so far"
}

export interface Commitment {
  id: string
  title: string
  owner: string
  dueDay: string
  completed: boolean
  frequency?: string
  linkedPowerMove?: string
  linkedVictoryTarget?: string
}

export interface Task {
  id: string
  task: string
  owner: string
  due: string
  status: "todo" | "in-progress" | "done"
  linkedPowerMove?: string
  linkedVictoryTarget?: string
}

export interface WeeklyReview {
  id: string
  date: string
  wins: string
  misses: string
  blockers: string
  commitments: string
}

export interface DepartmentConfig {
  name: string
  icon: React.ComponentType<{ className?: string }>
  wig: string
  status: "on-track" | "at-risk"
  victoryTargets: VictoryTarget[]
  powerMoves: PowerMove[]
  commitments: Commitment[]
  tasks: Task[]
  weeklyReviews?: WeeklyReview[]
  coreObjective?: {
    title: string
    description: string
  }
  users?: Array<{ name: string; role: string }>
}

interface DepartmentPageProps {
  config: DepartmentConfig
  departmentKey?: string
}

export function DepartmentPage({ config, departmentKey }: DepartmentPageProps) {
  const { currentBrand } = useBrand()
  const safeConfig = {
    ...config,
    commitments: config.commitments ?? [],
    tasks: config.tasks ?? [],
    powerMoves: config.powerMoves ?? [],
    victoryTargets: config.victoryTargets ?? [],
    weeklyReviews: config.weeklyReviews ?? [],
  }

  const [showVictoryModal, setShowVictoryModal] = useState(false)
  const [showPowerMoveModal, setShowPowerMoveModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showCommitmentModal, setShowCommitmentModal] = useState(false)
  const [displayedCommitments, setDisplayedCommitments] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("execute")
  const [addAnotherVictory, setAddAnotherVictory] = useState(false)
  const [addAnotherCommitment, setAddAnotherCommitment] = useState(false)
  const { mode } = useAppMode()
  const isSetupMode = mode === "setup"
  const currentUser = "Sarah M." // TODO: Get from auth context
  const [powerMoves, setPowerMoves] = useState<PowerMove[]>(safeConfig.powerMoves)
  const [selectedVictoryTarget, setSelectedVictoryTarget] = useState<VictoryTarget | null>(null)
  const [showVictoryDetailModal, setShowVictoryDetailModal] = useState(false)
  const [timePeriod, setTimePeriod] = useState<"this-week" | "next-week">("this-week")
  const [selectedCommitments, setSelectedCommitments] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const [filterByMe, setFilterByMe] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [wigSessionScheduled, setWigSessionScheduled] = useState(false)
  const [showUnifiedWIGSession, setShowUnifiedWIGSession] = useState(false)
  const [showWeeklyReview, setShowWeeklyReview] = useState(false)
  const [showCompletedPowerMoves, setShowCompletedPowerMoves] = useState(false)
  const [showAllVictoryTargets, setShowAllVictoryTargets] = useState(false)

  const [selectedQuarter, setSelectedQuarter] = useState<QuarterOption>(getCurrentQuarter())

  useEffect(() => {
    setPowerMoves(safeConfig.powerMoves)
  }, [safeConfig.powerMoves])

  const [selectedPeriod, setSelectedPeriod] = useState("this-week")
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)

    if (selectedPeriod === "this-month" || selectedPeriod === "last-month") {
      // Navigate by month
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (selectedPeriod === "last-4-weeks") {
      // Navigate by 4 weeks
      newDate.setDate(newDate.getDate() + (direction === "next" ? 28 : -28))
    } else {
      // Navigate by week
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    }

    setCurrentWeekStart(newDate)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)

    // Reset to appropriate start date based on period
    const today = new Date()
    const monday = new Date(today)
    const dayOfWeek = today.getDay()
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    if (period === "last-week") {
      monday.setDate(monday.getDate() - 7)
    } else if (period === "this-month") {
      monday.setDate(1)
    } else if (period === "last-month") {
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      lastMonth.setDate(1)
      setCurrentWeekStart(lastMonth)
      return
    } else if (period === "last-4-weeks") {
      monday.setDate(monday.getDate() - 28)
    }

    setCurrentWeekStart(monday)
  }

  const departmentColors: Record<string, string> = {
    marketing: "#3b82f6",
    accounts: "#8b5cf6",
    sales: "#10b981",
    team: "#f59e0b",
    execution: "#ef4444",
    rnd: "#06b6d4",
    leadership: "#ec4899",
  }

  const calculatedDepartmentScore = useMemo(
    () => calculateDepartmentScore(safeConfig.victoryTargets, powerMoves),
    [safeConfig.victoryTargets, powerMoves],
  )

  const updatedVictoryTargets = calculatedDepartmentScore.updatedTargets ?? []
  const filteredVictoryTargets = filterByMe
    ? updatedVictoryTargets.filter((vt) => vt.owner === currentUser)
    : updatedVictoryTargets

  const safeCommitments = safeConfig.commitments
  const safeTasks = safeConfig.tasks
  const safeVictoryTargets = safeConfig.victoryTargets

  const filteredPowerMoves = filterByMe ? powerMoves.filter((pm) => pm.owner === currentUser) : powerMoves

  const filteredCommitments = safeCommitments.filter((c) => {
    const matchesUser = filterByMe ? c.owner === currentUser : true
    // TODO: Add actual date filtering logic based on c.dueDay
    return matchesUser
  })

  const getLinkedPowerMoves = (victoryTargetId: string) => {
    return filteredPowerMoves.filter((pm) => pm.linkedVictoryTarget === victoryTargetId)
  }

  const getTrendData = (targetId: string): number[] => {
    // Generate 8 weeks of mock progress data
    return [
      45,
      52,
      58,
      62,
      68,
      72,
      78,
      Math.round(
        ((updatedVictoryTargets.find((vt) => vt.id === targetId)?.achieved || 0) /
          (updatedVictoryTargets.find((vt) => vt.id === targetId)?.target || 1)) *
          100,
      ),
    ]
  }

  const teamMembers = config.users && config.users.length > 0 
    ? config.users.map(user => ({
        name: user.name,
        role: user.role,
      }))
    : [
        {
          name: "Sarah M.",
          role: "Marketing Lead",
          commitments: [
            { id: "1", title: "Call 10 potential clients", status: "completed" as const, dueDay: "Mon" },
            { id: "2", title: "Update website copy", status: "in-progress" as const, dueDay: "Wed" },
            { id: "3", title: "Send email campaign", status: "pending" as const, dueDay: "Fri" },
          ],
          weeklyScore: 8.5,
        },
        {
          name: "John D.",
          role: "Content Strategist",
          commitments: [
            { id: "4", title: "Write 3 blog posts", status: "completed" as const, dueDay: "Tue" },
            { id: "5", title: "Create social media calendar", status: "completed" as const, dueDay: "Thu" },
          ],
          weeklyScore: 9.0,
        },
      ]

  const teamMembersWithCommitments = teamMembers.map((member) => ({
    ...member,
    commitments: safeCommitments
      .filter((c) => c.owner === member.name)
      .map((c) => ({
        id: c.id,
        title: c.title,
        owner: c.owner,
        week: "This Week",
        completed: c.completed,
      })),
  }))

  const suggestions = updatedVictoryTargets
    .filter((vt) => vt.status === "at-risk")
    .map((vt) => ({
      id: `suggestion-${vt.id}`,
      victoryTargetName: vt.title,
      suggestedPowerMove: `Increase outreach activities for ${vt.title}`,
      reason: "Current progress is below target. Increasing lead measure activity may help close the gap.",
      frequency: "Weekly",
      targetPerCycle: 15,
    }))

  const handleAddSuggestion = (suggestion: any) => {
    toast({
      title: "Power Move Added",
      description: `"${suggestion.suggestedPowerMove}" has been added to your Power Moves`,
    })
  }

  const departmentCodeMap: Record<string, "M" | "A" | "S" | "T" | "E" | "R" | "Y"> = {
    marketing: "M",
    accounts: "A",
    sales: "S",
    team: "T",
    execution: "E",
    rnd: "R",
    leadership: "Y",
  }

  const departmentCode = departmentKey ? departmentCodeMap[departmentKey] : undefined

  const handleSavePowerMove = async (data: PowerMoveFormData) => {
    if (!departmentCode) {
      throw new Error("Unable to determine department for this Power Move.")
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/power-moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: currentBrand,
          department: departmentCode,
          name: data.title,
          frequency: data.frequency,
          weeklyTarget: data.targetPerCycle,
          owner: data.owner,
          ownerId: data.ownerId,
          linkedVictoryTargetId: data.linkedVictoryTargets[0] ?? undefined,
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result?.error || "Unable to create power move.")
      }

      const linkedTargetTitle = safeVictoryTargets.find((vt) => vt.id === data.linkedVictoryTargets[0])?.title || ""

      setPowerMoves((prev) => [
        {
          id: result?.id || `temp-${Date.now()}`,
          name: data.title,
          frequency: data.frequency,
          targetPerCycle: data.targetPerCycle,
          progress: 0,
          owner: data.owner,
          linkedVictoryTarget: linkedTargetTitle,
          weeklyTarget: data.targetPerCycle,
          weeklyActual: 0,
          activityCompleted: false,
        },
        ...prev,
      ])
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const bprMetrics: BPRMetric[] = updatedVictoryTargets.map((vt) => {
    const progress = Math.round((vt.achieved / vt.target) * 100)
    let status: "green" | "yellow" | "red" = "green"

    if (progress < 40) status = "red"
    else if (progress < 70) status = "yellow"
    else status = "green"

    return {
      label: vt.title,
      target: vt.target,
      actual: vt.achieved,
      unit: vt.unit || "",
      status,
    }
  })

  const overdueCount = safeCommitments.filter((c) => !c.completed && new Date(c.dueDay) < new Date()).length
  const atRiskCount = updatedVictoryTargets.filter((vt) => vt.status === "at-risk").length

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const todaysCommitments = safeCommitments.filter((c) => !c.completed && (c.dueDay === today || c.dueDay === "Today"))

  const hasUrgentItems = todaysCommitments.length > 0 || atRiskCount > 0
  const hasTeamData = filteredPowerMoves.length > 0 || teamMembers.length > 0
  const hasTasks = safeTasks.length > 0

  const activePowerMoves = useMemo(
    () => filteredPowerMoves.filter((pm) => pm.progress < pm.targetPerCycle),
    [filteredPowerMoves],
  )

  const completedPowerMoves = useMemo(
    () => filteredPowerMoves.filter((pm) => pm.progress >= pm.targetPerCycle),
    [filteredPowerMoves],
  )

  return (
    <PageTransition>
      {showUnifiedWIGSession && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => setShowUnifiedWIGSession(false)} className="mb-4">
              Close
            </Button>
            <UnifiedWIGSession
              departmentName={config.name}
              previousWeekCommitments={safeCommitments}
              powerMoves={filteredPowerMoves}
            />
          </div>
        </div>
      )}

      {showWeeklyReview && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Button variant="ghost" onClick={() => setShowWeeklyReview(false)} className="mb-4">
              ← Back to Dashboard
            </Button>
            <WeeklyReviewSession
              departmentName={config.name}
              powerMoves={filteredPowerMoves}
              tasks={safeTasks}
              commitments={safeCommitments}
            />
          </div>
        </div>
      )}

      <KeyboardShortcuts onQuickAdd={() => setShowVictoryModal(true)} />

      <DepartmentExecutionHero
        departmentName={config.name}
        victoryTargets={filteredVictoryTargets}
        powerMoves={filteredPowerMoves}
        calculatedScore={calculatedDepartmentScore}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        currentWeekStart={currentWeekStart}
        onNavigate={handleNavigate}
        onWeeklyReview={() => setShowWeeklyReview(true)}
        onAddPowerMove={() => setShowPowerMoveModal(true)}
        onAddTask={() => setShowTaskModal(true)}
        onAddCommitment={() => setShowCommitmentModal(true)}
        selectedQuarter={selectedQuarter}
        onQuarterChange={setSelectedQuarter}
        coreObjective={config.coreObjective}
      />

      {/* COMPANY GOAL CONTEXT STRIP (MOVED TO BOTTOM) - Thin, non-interactive, reduced emphasis */}
      <div className='max-w-7xl mx-auto px-4 py-2 text-xs font-semibold text-stone-500 border-t border-stone-200 mt-8'>
        <p>
          <span className='font-semibold text-stone-600'>Company Goal (Context):</span> Warrior Systems: 30 clients | Story Marketing: 10 clients{' '}
          <span className='text-stone-400 mx-2'>•</span> {config.name} contributes via execution discipline
        </p>
      </div>

      <VictoryTargetModal
        open={showVictoryModal}
        onOpenChange={setShowVictoryModal}
        onSuccess={() => setShowVictoryModal(false)}
        addAnother={addAnotherVictory}
        setAddAnother={setAddAnotherVictory}
      />
      <PowerMoveModal
        open={showPowerMoveModal}
        onOpenChange={setShowPowerMoveModal}
        onSave={handleSavePowerMove}
        victoryTargets={updatedVictoryTargets}
      />
      <CreateTaskModal
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
        onSave={() => setShowTaskModal(false)}
        teamMembers={teamMembers}
      />
      <CreateCommitmentModal
        open={showCommitmentModal}
        onOpenChange={setShowCommitmentModal}
        onSave={() => setShowCommitmentModal(false)}
        powerMoves={filteredPowerMoves}
        victoryTargets={filteredVictoryTargets}
        teamMembers={teamMembers}
      />
    </PageTransition>
  )
}
