"use client"

import { AppShell } from "@/components/app-shell"
import { DepartmentPage, type DepartmentConfig } from "@/components/department-page"
import { DepartmentPageSkeleton } from "@/components/skeleton-loader"
import { FileText } from "lucide-react"
import { useBrandDepartment } from "@/lib/use-brand-department"
import { useDepartmentPowerMoves } from "@/lib/use-department-power-moves"
import { useDepartmentVictoryTargets } from "@/lib/use-department-victory-targets"

export default function AccountsPage() {
  const departmentData = useBrandDepartment("accounts")
  const {
    victoryTargets: departmentVictoryTargets,
    isLoading: victoryTargetsLoading,
    error: victoryTargetsError,
  } = useDepartmentVictoryTargets("A")
  const {
    powerMoves: departmentPowerMoves,
    isLoading: powerMovesLoading,
    error: powerMovesError,
  } = useDepartmentPowerMoves("A")

  if (powerMovesLoading || victoryTargetsLoading) {
    return (
      <AppShell>
        <DepartmentPageSkeleton />
      </AppShell>
    )
  }

  const config: DepartmentConfig = {
    name: "Accounts / Compliance / Finance",
    icon: FileText,
    wig: "Achieve ₹10L monthly predictable revenue by Dec 31, 2026",
    status: "at-risk",
    coreObjective: {
      title: "Financial Integrity",
      description: "Sustain cash flow, ensure compliance, enable informed financial decisions",
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
        title: "Complete Q4 financial review and projections",
        owner: "Priya K.",
        dueDay: "Monday",
        completed: true,
      },
      {
        id: "c2",
        title: "Process all pending invoices for December",
        owner: "Rahul S.",
        dueDay: "Wednesday",
        completed: false,
        frequency: "weekly",
      },
      {
        id: "c3",
        title: "Review and update compliance documentation",
        owner: "Priya K.",
        dueDay: "Friday",
        completed: false,
      },
      {
        id: "c4",
        title: "Reconcile all bank accounts for November",
        owner: "Rahul S.",
        dueDay: "Tuesday",
        completed: true,
      },
    ],
    tasks: [
      {
        id: "t1",
        task: "Update cash flow projection spreadsheet",
        owner: "Priya K.",
        due: "Dec 20",
        status: "in-progress",
        linkedPowerMove: "Revenue Forecasting Sessions",
      },
      {
        id: "t2",
        task: "Send payment reminders to overdue clients",
        owner: "Rahul S.",
        due: "Dec 19",
        status: "done",
        linkedPowerMove: "Invoice Follow-ups",
      },
      {
        id: "t3",
        task: "Prepare GST filing documentation",
        owner: "Priya K.",
        due: "Dec 25",
        status: "todo",
      },
    ],
  }

  return (
    <AppShell>
      <DepartmentPage config={config} departmentKey="accounts" />
    </AppShell>
  )
}
