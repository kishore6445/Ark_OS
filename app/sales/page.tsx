"use client"

import { AppShell } from "@/components/app-shell"
import { DepartmentPage, type DepartmentConfig } from "@/components/department-page"
import { DepartmentPageSkeleton } from "@/components/skeleton-loader"
import { TrendingUp } from "lucide-react"
import { useBrandDepartment } from "@/lib/use-brand-department"
import { useDepartmentPowerMoves } from "@/lib/use-department-power-moves"
import { useDepartmentVictoryTargets } from "@/lib/use-department-victory-targets"

export default function SalesPage() {
  const departmentData = useBrandDepartment("sales")
  const {
    victoryTargets: departmentVictoryTargets,
    isLoading: victoryTargetsLoading,
    error: victoryTargetsError,
  } = useDepartmentVictoryTargets("S")
  const {
    powerMoves: departmentPowerMoves,
    isLoading: powerMovesLoading,
    error: powerMovesError,
  } = useDepartmentPowerMoves("S")

  if (powerMovesLoading || victoryTargetsLoading) {
    return (
      <AppShell>
        <DepartmentPageSkeleton />
      </AppShell>
    )
  }

  const config: DepartmentConfig = {
    name: "Sales",
    icon: TrendingUp,
    wig: "Close 30 new client contracts (15 Story Marketing + 15 Warrior Systems) by Dec 31, 2026",
    status: "on-track",
    coreObjective: {
      title: "Revenue Conversion_test",
      description: "Convert qualified demand into paying customers with predictable velocity",
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
        title: "Follow up with 10 warm leads from last week",
        owner: "Amit P.",
        dueDay: "Monday",
        completed: true,
        frequency: "weekly",
      },
      {
        id: "c2",
        title: "Send proposals to 5 qualified prospects",
        owner: "Neha M.",
        dueDay: "Wednesday",
        completed: true,
      },
      {
        id: "c3",
        title: "Conduct discovery calls with new inbound leads",
        owner: "Amit P.",
        dueDay: "Thursday",
        completed: false,
        frequency: "weekly",
      },
      {
        id: "c4",
        title: "Close 2 pending deals in negotiation phase",
        owner: "Neha M.",
        dueDay: "Friday",
        completed: false,
      },
    ],
    tasks: [
      {
        id: "t1",
        task: "Prepare custom proposal for TechCorp Industries",
        owner: "Amit P.",
        due: "Dec 20",
        status: "in-progress",
        linkedPowerMove: "Proposal Presentations",
      },
      {
        id: "t2",
        task: "Schedule follow-up meetings with 8 prospects",
        owner: "Neha M.",
        due: "Dec 19",
        status: "done",
        linkedPowerMove: "Follow-up Calls",
      },
      {
        id: "t3",
        task: "Update CRM with all week's interactions",
        owner: "Amit P.",
        due: "Dec 22",
        status: "todo",
      },
    ],
  }

  return (
    <AppShell>
      <DepartmentPage config={config} departmentKey="sales" />
    </AppShell>
  )
}
