"use client"

import { AppShell } from "@/components/app-shell"
import { DepartmentPage, type DepartmentConfig } from "@/components/department-page"
import { DepartmentPageSkeleton } from "@/components/skeleton-loader"
import { FlaskConical } from "lucide-react"
import { useBrandDepartment } from "@/lib/use-brand-department"
import { useDepartmentPowerMoves } from "@/lib/use-department-power-moves"
import { useDepartmentVictoryTargets } from "@/lib/use-department-victory-targets"

export default function RndPage() {
  const departmentData = useBrandDepartment("rnd")
  const {
    victoryTargets: departmentVictoryTargets,
    isLoading: victoryTargetsLoading,
    error: victoryTargetsError,
  } = useDepartmentVictoryTargets("R")
  const {
    powerMoves: departmentPowerMoves,
    isLoading: powerMovesLoading,
    error: powerMovesError,
  } = useDepartmentPowerMoves("R")

  if (powerMovesLoading || victoryTargetsLoading) {
    return (
      <AppShell>
        <DepartmentPageSkeleton />
      </AppShell>
    )
  }

  const config: DepartmentConfig = {
    name: "R&D / Risk",
    icon: FlaskConical,
    wig: "Launch and validate 12 strategic experiments by Dec 31, 2026",
    status: "on-track",
    coreObjective: {
      title: "Innovation & Risk Management",
      description: "Test new bets, validate learnings, mitigate threats before they escalate",
    },
    users: departmentData?.teamMembers?.map(tm => ({ name: tm.name, role: tm.role })) ?? [],
    victoryTargets:
      victoryTargetsLoading || victoryTargetsError
        ? []
        : departmentVictoryTargets.map((vt) => ({
            ...vt,
            status: vt.achieved / vt.target >= 0.7 ? "on-track" : ("at-risk" as "on-track" | "at-risk"),
          })),
    powerMoves:
      powerMovesLoading || powerMovesError
        ? []
        : departmentPowerMoves.map((pm) => ({
            id: pm.id,
            name: pm.name,
            frequency: pm.frequency,
            targetPerCycle: pm.currentTarget ?? pm.weeklyTarget,
            progress: pm.currentActual ?? pm.weeklyActual ?? 0,
            owner: pm.owner,
            linkedVictoryTarget: pm.linkedVictoryTargetTitle || "",
            weeklyTarget: pm.weeklyTarget,
            weeklyActual: pm.weeklyActual ?? pm.currentActual ?? 0,
            activityCompleted: false,
          })),
    commitments: [
      {
        id: "c1",
        title: "Test new AI automation for client reporting",
        owner: "Dev Team",
        dueDay: "Tuesday",
        completed: true,
      },
      {
        id: "c2",
        title: "Conduct risk assessment for new service line",
        owner: "James L.",
        dueDay: "Thursday",
        completed: false,
        frequency: "monthly",
      },
      {
        id: "c3",
        title: "Launch pilot program for predictive analytics",
        owner: "Anna K.",
        dueDay: "Friday",
        completed: false,
      },
      {
        id: "c4",
        title: "Review and document experiment results from last week",
        owner: "Anna K.",
        dueDay: "Monday",
        completed: true,
      },
    ],
    tasks: [
      {
        id: "t1",
        task: "Build prototype for AI chatbot integration",
        owner: "Dev Team",
        due: "Dec 23",
        status: "in-progress",
        linkedPowerMove: "Experiment Design Sessions",
      },
      {
        id: "t2",
        task: "Analyze results from last month's A/B tests",
        owner: "Anna K.",
        due: "Dec 20",
        status: "done",
        linkedPowerMove: "Risk Analysis Reviews",
      },
      {
        id: "t3",
        task: "Research new tools for automation opportunities",
        owner: "James L.",
        due: "Dec 26",
        status: "todo",
      },
    ],
  }

  return (
    <AppShell>
      <DepartmentPage config={config} departmentKey="rnd" />
    </AppShell>
  )
}
