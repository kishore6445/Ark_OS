"use client"

import { AppShell } from "@/components/app-shell"
import { DepartmentPage, type DepartmentConfig } from "@/components/department-page"
import { DepartmentPageSkeleton } from "@/components/skeleton-loader"
import { Cog } from "lucide-react"
import { useBrandDepartment } from "@/lib/use-brand-department"
import { useDepartmentPowerMoves } from "@/lib/use-department-power-moves"
import { useDepartmentVictoryTargets } from "@/lib/use-department-victory-targets"

export default function ExecutionPage() {
  const departmentData = useBrandDepartment("execution")
  const {
    victoryTargets: departmentVictoryTargets,
    isLoading: victoryTargetsLoading,
    error: victoryTargetsError,
  } = useDepartmentVictoryTargets("E")
  const {
    powerMoves: departmentPowerMoves,
    isLoading: powerMovesLoading,
    error: powerMovesError,
  } = useDepartmentPowerMoves("E")

  if (powerMovesLoading || victoryTargetsLoading) {
    return (
      <AppShell>
        <DepartmentPageSkeleton />
      </AppShell>
    )
  }

  const config: DepartmentConfig = {
    name: "Execution & Operations",
    icon: Cog,
    wig: "Maintain 95%+ weekly commitment completion rate across all departments",
    status: "on-track",
    coreObjective: {
      title: "Accountability & Cadence",
      description: "Ensure commitments are tracked, bottlenecks removed, execution is visible",
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
        title: "Complete all department WIG updates by Wednesday",
        owner: "All Leads",
        dueDay: "Wednesday",
        completed: true,
        frequency: "weekly",
      },
      {
        id: "c2",
        title: "Resolve 5 operational bottlenecks identified",
        owner: "Operations",
        dueDay: "Thursday",
        completed: false,
      },
      {
        id: "c3",
        title: "Implement new project management workflow",
        owner: "Mike R.",
        dueDay: "Friday",
        completed: false,
      },
      {
        id: "c4",
        title: "Review and adjust weekly commitment targets",
        owner: "All Leads",
        dueDay: "Monday",
        completed: true,
      },
    ],
    tasks: [
      {
        id: "t1",
        task: "Set up automated reporting dashboard",
        owner: "Mike R.",
        due: "Dec 22",
        status: "in-progress",
        linkedPowerMove: "WIG Review Meetings",
      },
      {
        id: "t2",
        task: "Document resolution steps for top 3 bottlenecks",
        owner: "Operations",
        due: "Dec 20",
        status: "done",
        linkedPowerMove: "Bottleneck Analysis Sessions",
      },
      {
        id: "t3",
        task: "Create weekly execution scorecard template",
        owner: "Mike R.",
        due: "Dec 24",
        status: "todo",
      },
    ],
  }

  return (
    <AppShell>
      <DepartmentPage config={config} departmentKey="execution" />
    </AppShell>
  )
}
