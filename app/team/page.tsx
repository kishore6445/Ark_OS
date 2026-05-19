"use client"

import { AppShell } from "@/components/app-shell"
import { DepartmentPage, type DepartmentConfig } from "@/components/department-page"
import { DepartmentPageSkeleton } from "@/components/skeleton-loader"
import { Users } from "lucide-react"
import { useBrandDepartment } from "@/lib/use-brand-department"
import { useDepartmentPowerMoves } from "@/lib/use-department-power-moves"
import { useDepartmentVictoryTargets } from "@/lib/use-department-victory-targets"

export default function TeamPage() {
  const departmentData = useBrandDepartment("team")
  const {
    victoryTargets: departmentVictoryTargets,
    isLoading: victoryTargetsLoading,
    error: victoryTargetsError,
  } = useDepartmentVictoryTargets("T")
  const {
    powerMoves: departmentPowerMoves,
    isLoading: powerMovesLoading,
    error: powerMovesError,
  } = useDepartmentPowerMoves("T")

  if (powerMovesLoading || victoryTargetsLoading) {
    return (
      <AppShell>
        <DepartmentPageSkeleton />
      </AppShell>
    )
  }

  const config: DepartmentConfig = {
    name: "Team Tools & SOPs",
    icon: Users,
    wig: "Complete 100% SOP documentation for all core processes by Dec 31, 2026",
    status: "on-track",
    coreObjective: {
      title: "Operational Efficiency",
      description: "Build systems that scale, reduce friction, enable teams to execute consistently",
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
        title: "Complete onboarding process documentation",
        owner: "Ravi T.",
        dueDay: "Tuesday",
        completed: true,
      },
      {
        id: "c2",
        title: "Conduct quarterly team performance reviews",
        owner: "Lisa W.",
        dueDay: "Friday",
        completed: false,
      },
      {
        id: "c3",
        title: "Update client handoff procedures",
        owner: "Ravi T.",
        dueDay: "Thursday",
        completed: false,
        frequency: "monthly",
      },
      {
        id: "c4",
        title: "Document new project management workflow",
        owner: "Lisa W.",
        dueDay: "Wednesday",
        completed: true,
      },
    ],
    tasks: [
      {
        id: "t1",
        task: "Create video tutorial for client onboarding",
        owner: "Ravi T.",
        due: "Dec 21",
        status: "in-progress",
        linkedPowerMove: "SOP Creation Sessions",
      },
      {
        id: "t2",
        task: "Schedule Q1 training calendar",
        owner: "Lisa W.",
        due: "Dec 20",
        status: "done",
        linkedPowerMove: "Training Workshops",
      },
      {
        id: "t3",
        task: "Update employee handbook with new policies",
        owner: "Ravi T.",
        due: "Dec 28",
        status: "todo",
      },
    ],
  }

  return (
    <AppShell>
      <DepartmentPage config={config} departmentKey="team" />
    </AppShell>
  )
}
