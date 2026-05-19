"use client"

import { AppShell } from "@/components/app-shell"
import { DepartmentPage, type DepartmentConfig } from "@/components/department-page"
import { DepartmentPageSkeleton } from "@/components/skeleton-loader"
import { Crown } from "lucide-react"
import { useBrandDepartment } from "@/lib/use-brand-department"
import { useDepartmentPowerMoves } from "@/lib/use-department-power-moves"
import { useDepartmentVictoryTargets } from "@/lib/use-department-victory-targets"

export default function LeadershipPage() {
  const departmentData = useBrandDepartment("leadership")
  const {
    victoryTargets: departmentVictoryTargets,
    isLoading: victoryTargetsLoading,
    error: victoryTargetsError,
  } = useDepartmentVictoryTargets("Y")
  const {
    powerMoves: departmentPowerMoves,
    isLoading: powerMovesLoading,
    error: powerMovesError,
  } = useDepartmentPowerMoves("Y")

  if (powerMovesLoading || victoryTargetsLoading) {
    return (
      <AppShell>
        <DepartmentPageSkeleton />
      </AppShell>
    )
  }

  const config: DepartmentConfig = {
    name: "You (Leadership & Management)",
    icon: Crown,
    wig: "Complete 8 key leadership rituals per week (1-on-1s, reviews, planning) consistently",
    status: "on-track",
    coreObjective: {
      title: "Strategy Management, Functional Management Systems & People Management Systems",
      description: "Set direction, remove friction, develop leaders, sustain execution",
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
        title: "Conduct 1-on-1 meetings with all department heads",
        owner: "CEO",
        dueDay: "Monday-Wednesday",
        completed: true,
        frequency: "weekly",
      },
      {
        id: "c2",
        title: "Review and approve Q1 strategic initiatives",
        owner: "Leadership",
        dueDay: "Thursday",
        completed: false,
      },
      {
        id: "c3",
        title: "Host company-wide WIG progress review",
        owner: "CEO",
        dueDay: "Friday",
        completed: false,
        frequency: "weekly",
      },
      {
        id: "c4",
        title: "Complete leadership development reading",
        owner: "CEO",
        dueDay: "Sunday",
        completed: true,
      },
    ],
    tasks: [
      {
        id: "t1",
        task: "Prepare Q1 2026 strategic roadmap presentation",
        owner: "CEO",
        due: "Dec 27",
        status: "in-progress",
        linkedPowerMove: "Strategic Planning Sessions",
      },
      {
        id: "t2",
        task: "Review department WIG progress reports",
        owner: "Leadership",
        due: "Dec 20",
        status: "done",
        linkedPowerMove: "Weekly WIG Review Sessions",
      },
      {
        id: "t3",
        task: "Schedule Q1 leadership team retreat",
        owner: "CEO",
        due: "Dec 22",
        status: "todo",
      },
    ],
  }

  return (
    <AppShell>
      <DepartmentPage config={config} departmentKey="leadership" />
    </AppShell>
  )
}
