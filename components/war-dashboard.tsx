"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect, useMemo } from "react"
// ... existing imports ...
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedProgress } from "@/components/animated-progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import { PowerMoveBPRCard } from "@/components/power-move-bpr-card"
import { TeamPerformanceScorecard } from "@/components/team-performance-scorecard"
import { SocialAccountability } from "@/components/social-accountability"
import { Megaphone, FileText, TrendingUp, Users, Cog, FlaskConical, Crown, Target } from "lucide-react"
import Link from "next/link"
import { useBrand } from "@/lib/brand-context"
import { DepartmentCardSkeleton, CompanyWIGSkeleton } from "@/components/skeleton-loader"
import { calculateCompanyScore } from "@/lib/score-calculations"
import { QuarterSelector } from "@/components/quarter-selector"
import type { QuarterOption } from "@/components/quarter-selector"

const departmentDataByQuarter: Record<
  QuarterOption,
  Array<{
    id: string
    name: string
    icon: typeof Megaphone
    target: number | string
    achieved: number | string
    gap: number | string
    progress: number
    href: string
  }>
> = {
  Annual: [
    {
      id: "marketing",
      name: "Marketing",
      icon: Megaphone,
      target: 15,
      achieved: 6,
      gap: 9,
      progress: 40,
      href: "/marketing",
    },
    {
      id: "accounts",
      name: "Accounts",
      icon: FileText,
      target: "10L",
      achieved: "4.4L",
      gap: "5.6L",
      progress: 44,
      href: "/accounts",
    },
    { id: "sales", name: "Sales", icon: TrendingUp, target: 30, achieved: 13, gap: 17, progress: 43, href: "/sales" },
    { id: "team", name: "Team", icon: Users, target: 100, achieved: 55, gap: 45, progress: 55, href: "/team" },
    {
      id: "execution",
      name: "Execution",
      icon: Cog,
      target: 20,
      achieved: 11,
      gap: 9,
      progress: 55,
      href: "/execution",
    },
    { id: "rnd", name: "R&D/Risk", icon: FlaskConical, target: 12, achieved: 5, gap: 7, progress: 42, href: "/rnd" },
    {
      id: "leadership",
      name: "Leadership",
      icon: Crown,
      target: 8,
      achieved: 5,
      gap: 3,
      progress: 63,
      href: "/leadership",
    },
  ],
  Q1: [
    {
      id: "marketing",
      name: "Marketing",
      icon: Megaphone,
      target: 4,
      achieved: 4,
      gap: 0,
      progress: 100,
      href: "/marketing",
    },
    {
      id: "accounts",
      name: "Accounts",
      icon: FileText,
      target: "2.5L",
      achieved: "2.5L",
      gap: "0",
      progress: 100,
      href: "/accounts",
    },
    { id: "sales", name: "Sales", icon: TrendingUp, target: 8, achieved: 8, gap: 0, progress: 100, href: "/sales" },
    { id: "team", name: "Team", icon: Users, target: 25, achieved: 25, gap: 0, progress: 100, href: "/team" },
    {
      id: "execution",
      name: "Execution",
      icon: Cog,
      target: 5,
      achieved: 5,
      gap: 0,
      progress: 100,
      href: "/execution",
    },
    { id: "rnd", name: "R&D/Risk", icon: FlaskConical, target: 3, achieved: 3, gap: 0, progress: 100, href: "/rnd" },
    {
      id: "leadership",
      name: "Leadership",
      icon: Crown,
      target: 2,
      achieved: 2,
      gap: 0,
      progress: 100,
      href: "/leadership",
    },
  ],
  Q2: [
    {
      id: "marketing",
      name: "Marketing",
      icon: Megaphone,
      target: 4,
      achieved: 2,
      gap: 2,
      progress: 50,
      href: "/marketing",
    },
    {
      id: "accounts",
      name: "Accounts",
      icon: FileText,
      target: "2.5L",
      achieved: "1.9L",
      gap: "0.6L",
      progress: 76,
      href: "/accounts",
    },
    { id: "sales", name: "Sales", icon: TrendingUp, target: 8, achieved: 5, gap: 3, progress: 63, href: "/sales" },
    { id: "team", name: "Team", icon: Users, target: 25, achieved: 20, gap: 5, progress: 80, href: "/team" },
    { id: "execution", name: "Execution", icon: Cog, target: 5, achieved: 4, gap: 1, progress: 80, href: "/execution" },
    { id: "rnd", name: "R&D/Risk", icon: FlaskConical, target: 3, achieved: 2, gap: 1, progress: 67, href: "/rnd" },
    {
      id: "leadership",
      name: "Leadership",
      icon: Crown,
      target: 2,
      achieved: 2,
      gap: 0,
      progress: 100,
      href: "/leadership",
    },
  ],
  Q3: [
    {
      id: "marketing",
      name: "Marketing",
      icon: Megaphone,
      target: 4,
      achieved: 0,
      gap: 4,
      progress: 0,
      href: "/marketing",
    },
    {
      id: "accounts",
      name: "Accounts",
      icon: FileText,
      target: "2.5L",
      achieved: "0",
      gap: "2.5L",
      progress: 0,
      href: "/accounts",
    },
    { id: "sales", name: "Sales", icon: TrendingUp, target: 8, achieved: 0, gap: 8, progress: 0, href: "/sales" },
    { id: "team", name: "Team", icon: Users, target: 25, achieved: 10, gap: 15, progress: 40, href: "/team" },
    { id: "execution", name: "Execution", icon: Cog, target: 5, achieved: 2, gap: 3, progress: 40, href: "/execution" },
    { id: "rnd", name: "R&D/Risk", icon: FlaskConical, target: 3, achieved: 0, gap: 3, progress: 0, href: "/rnd" },
    {
      id: "leadership",
      name: "Leadership",
      icon: Crown,
      target: 2,
      achieved: 1,
      gap: 1,
      progress: 50,
      href: "/leadership",
    },
  ],
  Q4: [
    {
      id: "marketing",
      name: "Marketing",
      icon: Megaphone,
      target: 3,
      achieved: 0,
      gap: 3,
      progress: 0,
      href: "/marketing",
    },
    {
      id: "accounts",
      name: "Accounts",
      icon: FileText,
      target: "2.5L",
      achieved: "0",
      gap: "2.5L",
      progress: 0,
      href: "/accounts",
    },
    { id: "sales", name: "Sales", icon: TrendingUp, target: 6, achieved: 0, gap: 6, progress: 0, href: "/sales" },
    { id: "team", name: "Team", icon: Users, target: 25, achieved: 0, gap: 25, progress: 0, href: "/team" },
    { id: "execution", name: "Execution", icon: Cog, target: 5, achieved: 0, gap: 5, progress: 0, href: "/execution" },
    { id: "rnd", name: "R&D/Risk", icon: FlaskConical, target: 3, achieved: 0, gap: 3, progress: 0, href: "/rnd" },
    {
      id: "leadership",
      name: "Leadership",
      icon: Crown,
      target: 2,
      achieved: 0,
      gap: 2,
      progress: 0,
      href: "/leadership",
    },
  ],
}

const companyWIGData: Record<QuarterOption, { target: number; achieved: number; label: string }> = {
  Annual: { target: 30, achieved: 13, label: "Full Year 2026" },
  Q1: { target: 8, achieved: 8, label: "Q1 2026 (Jan-Mar)" },
  Q2: { target: 8, achieved: 5, label: "Q2 2026 (Apr-Jun)" },
  Q3: { target: 7, achieved: 0, label: "Q3 2026 (Jul-Sep)" },
  Q4: { target: 7, achieved: 0, label: "Q4 2026 (Oct-Dec)" },
}

export function WarDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterOption>("Annual")
  const [selectedPeriod, setSelectedPeriod] = useState<"Annual" | "Q1" | "Q2" | "Q3" | "Q4">("Annual")
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("marketing")
  const [powerMoves, setPowerMoves] = useState<
    Array<{
      id: string
      brandId: string
      department: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
      name: string
      frequency: "daily" | "weekly" | "monthly"
      weeklyTarget: number
      owner: string
      linkedVictoryTargetTitle?: string
    }>
  >([])
  const [powerMovesError, setPowerMovesError] = useState<string | null>(null)
  const { currentBrand, brandConfig } = useBrand()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isActive = true

    const loadPowerMoves = async () => {
      setPowerMovesError(null)
      try {
        const response = await fetch("/api/admin/power-moves", { cache: "no-store" })
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load power moves.")
        }

        if (!isActive) return

        if (Array.isArray(result.powerMoves)) {
          setPowerMoves(result.powerMoves)
        } else {
          setPowerMoves([])
        }
      } catch (error) {
        if (!isActive) return
        setPowerMoves([])
        setPowerMovesError(error instanceof Error ? error.message : "Unable to load power moves.")
      }
    }

    loadPowerMoves()

    return () => {
      isActive = false
    }
  }, [])

  const departmentData = departmentDataByQuarter[selectedQuarter] || departmentDataByQuarter["Annual"]
  const companyWIG = companyWIGData[selectedQuarter] || companyWIGData["Annual"]

  const departmentCodeMap: Record<string, "M" | "A" | "S" | "T" | "E" | "R" | "Y"> = {
    marketing: "M",
    accounts: "A",
    sales: "S",
    team: "T",
    execution: "E",
    rnd: "R",
    leadership: "Y",
  }

  const selectedDepartmentCode = departmentCodeMap[selectedDepartmentId] || "M"
  const selectedDepartmentName =
    departmentData.find((dept) => dept.id === selectedDepartmentId)?.name || "Marketing"

  const filteredPowerMoves = useMemo(() => {
    return powerMoves.filter((pm) => pm.department === selectedDepartmentCode && pm.brandId === currentBrand)
  }, [powerMoves, selectedDepartmentCode, currentBrand])

  const companyScore = calculateCompanyScore(
    departmentData.map((dept) => ({
      score: dept.progress,
      targetsCount: 3,
    })),
  )

  const overallProgress = companyScore.averageScore

  const getCompanyStatus = (score: number) => {
    if (score >= 70) return { label: "On Track", color: "bg-emerald-600" }
    if (score >= 50) return { label: "Caution", color: "bg-amber-500" }
    return { label: "Needs Help", color: "bg-red-600" }
  }

  const companyStatus = getCompanyStatus(overallProgress)

  const getDeptStatus = (progress: number) => {
    if (progress >= 70) return { status: "on-track", color: "bg-emerald-600", textColor: "text-emerald-600" }
    if (progress >= 50) return { status: "caution", color: "bg-amber-500", textColor: "text-amber-500" }
    return { status: "needs-help", color: "bg-red-600", textColor: "text-red-600" }
  }

  const totalDepts = departmentData.length
  const greenDepts = departmentData.filter((d) => d.progress >= 70).length
  const yellowDepts = departmentData.filter((d) => d.progress >= 50 && d.progress < 70).length
  const redDepts = departmentData.filter((d) => d.progress < 50).length

  const teamMemberPerformance = [
    {
      id: "1",
      name: "Sarah M.",
      role: "Marketing Lead",
      weeklyCompletion: 92,
      previousWeekCompletion: 85,
      trend: "up" as const,
    },
    {
      id: "2",
      name: "John D.",
      role: "Content Strategist",
      weeklyCompletion: 88,
      previousWeekCompletion: 90,
      trend: "down" as const,
    },
    {
      id: "3",
      name: "Priya K.",
      role: "Finance Manager",
      weeklyCompletion: 85,
      previousWeekCompletion: 85,
      trend: "same" as const,
    },
    {
      id: "4",
      name: "Amit P.",
      role: "Sales Lead",
      weeklyCompletion: 78,
      previousWeekCompletion: 72,
      trend: "up" as const,
    },
    {
      id: "5",
      name: "Ravi T.",
      role: "Ops Manager",
      weeklyCompletion: 65,
      previousWeekCompletion: 70,
      trend: "down" as const,
    },
  ]

  const getHeroGradient = (score: number) => {
    if (score >= 70) return "from-emerald-50 via-emerald-100/50 to-white border-emerald-500"
    if (score >= 50) return "from-amber-50 via-amber-100/50 to-white border-amber-500"
    return "from-rose-50 via-rose-100/50 to-white border-rose-500"
  }

  const getScoreCircleColor = (score: number) => {
    if (score >= 70) return "bg-emerald-600 text-white"
    if (score >= 50) return "bg-amber-500 text-white"
    return "bg-rose-600 text-white"
  }

  const getExecutionVerdict = (score: number) => {
    if (score >= 70) return "Company execution is holding the standard."
    if (score >= 50) return "Company execution needs attention."
    return "Company execution requires immediate focus."
  }

  // Helper function to get victory targets aggregated by period
  const getVictoryTargetsByPeriod = (period: "Annual" | "Q1" | "Q2" | "Q3" | "Q4") => {
    return departmentData.map((dept) => {
      if (period === "Annual") {
        return dept
      }
      
      // For quarterly, recalculate based on quarter data structure
      // This would map to departmentDataByQuarter[period]
      return departmentData
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        <CompanyWIGSkeleton />
        <div>
          <div className="h-8 w-64 bg-muted rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <DepartmentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main id="main-content" className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-12">
      <section className="space-y-4" aria-label="Company performance overview">
        <div className="flex items-center justify-end">
          <QuarterSelector selectedQuarter={selectedQuarter} onQuarterChange={setSelectedQuarter} />
        </div>

        <div
          className={`relative overflow-hidden rounded-xl border-l-4 bg-gradient-to-br ${getHeroGradient(overallProgress)}`}
        >
          <div className="p-6 lg:p-8">
            {/* Top row: Company info + Score */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-stone-700" />
                  <span className="text-xs uppercase tracking-wider text-stone-800 font-black">
                    Company War Goal
                  </span>
                  <span className="text-xs bg-stone-200 text-stone-800 px-2 py-0.5 rounded font-bold">
                    {companyWIG.label}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-stone-900 tracking-tight">{brandConfig.name}</h1>
                <p className="text-lg text-stone-800 font-semibold">
                  Add {companyWIG.target} Clients {selectedQuarter === "Annual" ? "this year" : `in ${selectedQuarter}`}
                </p>
              </div>

              <div className="text-center">
                <div className="text-xs uppercase tracking-wider text-stone-800 mb-2 font-black">
                  {selectedQuarter === "Annual" ? "Annual" : selectedQuarter} Score
                </div>
                <div className="flex items-baseline gap-2 justify-center">
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center text-5xl font-black ${getScoreCircleColor(overallProgress)}`}
                    aria-label={`Company score: ${overallProgress}%`}
                  >
                    {overallProgress}
                  </div>
                  <span className="text-3xl font-light text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {companyWIG.achieved} of {companyWIG.target} clients
                </p>
              </div>
            </div>

            {/* Execution verdict sentence */}
            <div className="border-t border-stone-200 pt-6">
              <p className="text-2xl lg:text-3xl font-black text-center text-stone-900">
                {getExecutionVerdict(overallProgress)}
              </p>
              <p className="text-sm font-semibold text-stone-700 text-center mt-2">
                {greenDepts} of {totalDepts} departments on track for{" "}
                {selectedQuarter === "Annual" ? "the year" : selectedQuarter}
              </p>
            </div>
          </div>
        </div>

        {/* ... existing code for department status strip ... */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-stone-100 rounded-lg border border-stone-200">
          <div className="space-y-1">
            <h2 className="text-base font-black text-stone-900">All Departments Status</h2>
            <p className="text-sm font-semibold text-stone-700">
              {greenDepts} on track | {yellowDepts} caution | {redDepts} needs help
            </p>
          </div>
          <div className="flex items-center gap-3">
            {departmentData.map((dept) => {
              const Icon = dept.icon
              const deptStatus = getDeptStatus(dept.progress)
              return (
                <Link
                  key={dept.id}
                  href={dept.href}
                  onClick={() => setSelectedDepartmentId(dept.id)}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white transition-colors"
                  aria-label={`${dept.name}: ${dept.progress}%`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${deptStatus.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] font-medium text-center text-muted-foreground">{dept.name}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* POWER MOVES - Department-specific Lead Measures */}
      <section aria-labelledby="lead-measures-heading">
        <h2 id="lead-measures-heading" className="text-2xl font-black text-stone-900 mb-2">
          Power Moves (Lead Measures)
        </h2>
        <p className="text-sm font-semibold text-stone-600 mb-6">
          {selectedDepartmentName}: lead measures tied to this department
        </p>
        {powerMovesError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {powerMovesError}
          </div>
        ) : filteredPowerMoves.length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-white px-4 py-6 text-sm text-stone-600">
            No power moves found for {selectedDepartmentName}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPowerMoves.map((pm) => (
              <PowerMoveBPRCard
                key={pm.id}
                name={pm.name}
                weeklyTarget={pm.weeklyTarget}
                weeklyActual={0}
                linkedVictoryTarget={pm.linkedVictoryTargetTitle || ""}
                owner={pm.owner}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="department-heading">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="department-heading" className="text-3xl font-black text-stone-900">
              Department Victory Targets
            </h2>
            <p className="text-base font-semibold text-stone-700 mt-2">
              {selectedPeriod === "Annual" ? "Full Year" : selectedPeriod}: {greenDepts} on track | {yellowDepts}{" "}
              caution | {redDepts} needs help
            </p>
          </div>
        </div>

        {/* Time Period Tabs - NEW */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {(["Annual", "Q1", "Q2", "Q3", "Q4"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors",
                selectedPeriod === period
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              )}
              aria-pressed={selectedPeriod === period}
            >
              {period}
            </button>
          ))}
        </div>

        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list">
            {departmentDataByQuarter[selectedPeriod === "Annual" ? "Annual" : selectedPeriod].map((dept) => {
              const Icon = dept.icon
              const deptStatus = getDeptStatus(dept.progress)
              const statusLabel = dept.progress >= 70 ? "On Track" : dept.progress >= 50 ? "Caution" : "Needs Help"

              return (
                <Link
                  key={dept.id}
                  href={dept.href}
                  onClick={() => setSelectedDepartmentId(dept.id)}
                  aria-label={`View ${dept.name} department. Progress: ${dept.progress}%. Status: ${statusLabel}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                  role="listitem"
                >
                  <Card className="h-full min-h-[180px] relative group transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:scale-[1.02] cursor-pointer active:scale-[0.98]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                            aria-hidden="true"
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-base font-semibold">{dept.name}</CardTitle>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${deptStatus.color} text-white`}>
                          {statusLabel}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {selectedQuarter === "Annual" ? "Target" : `${selectedQuarter} Target`}
                          </p>
                          <p className="text-lg font-bold">{dept.target}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Achieved</p>
                          <p className="text-lg font-bold">{dept.achieved}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Gap</p>
                          <p className="text-lg font-bold text-muted-foreground">{dept.gap}</p>
                        </div>
                      </div>
                      <div>
                        <AnimatedProgress
                          value={dept.progress}
                          className="h-3"
                          aria-label={`${dept.name} progress: ${dept.progress}%`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </TooltipProvider>
      </section>

      {/* ... existing code for remaining sections ... */}
      <section aria-labelledby="social-accountability-heading" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamPerformanceScorecard />
        </div>
        <div>
          <SocialAccountability teamMembers={teamMemberPerformance} currentUserId="1" />
        </div>
      </section>
    </main>
  )
}
