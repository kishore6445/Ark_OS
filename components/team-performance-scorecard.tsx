"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertTriangle } from "lucide-react"
import { useBrand } from "@/lib/brand-context"

interface TeamMemberPerformance {
  id: string
  name: string
  role: string
  brands: string[]
  weeklyPowerMoveCompletion: number
  weeklyPowerMoveTarget: number
  completionPercentage: number
  plannedPowerMoves: number
  executedPowerMoves: number
  isLeadership: boolean
}

export function TeamPerformanceScorecard() {
  const { currentBrand } = useBrand()

  const activeBrandLabel = currentBrand
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")

  const teamPerformance: TeamMemberPerformance[] = [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Marketing Lead",
      brands: [activeBrandLabel],
      weeklyPowerMoveCompletion: 15,
      weeklyPowerMoveTarget: 18,
      completionPercentage: 83,
      plannedPowerMoves: 18,
      executedPowerMoves: 15,
      isLeadership: false,
    },
    {
      id: "2",
      name: "Mike Johnson",
      role: "Sales Director",
      brands: [activeBrandLabel],
      weeklyPowerMoveCompletion: 12,
      weeklyPowerMoveTarget: 15,
      completionPercentage: 80,
      plannedPowerMoves: 15,
      executedPowerMoves: 12,
      isLeadership: false,
    },
    {
      id: "3",
      name: "Emma Wilson",
      role: "Finance Manager",
      brands: [activeBrandLabel],
      weeklyPowerMoveCompletion: 8,
      weeklyPowerMoveTarget: 12,
      completionPercentage: 67,
      plannedPowerMoves: 12,
      executedPowerMoves: 8,
      isLeadership: false,
    },
    {
      id: "4",
      name: "Priya Kumar",
      role: "Course Creator",
      brands: [activeBrandLabel],
      weeklyPowerMoveCompletion: 2,
      weeklyPowerMoveTarget: 8,
      completionPercentage: 25,
      plannedPowerMoves: 8,
      executedPowerMoves: 2,
      isLeadership: false,
    },
    {
      id: "5",
      name: "John Doe",
      role: "CEO & Founder",
      brands: [activeBrandLabel],
      weeklyPowerMoveCompletion: 10,
      weeklyPowerMoveTarget: 20,
      completionPercentage: 50,
      plannedPowerMoves: 20,
      executedPowerMoves: 10,
      isLeadership: true,
    },
    {
      id: "6",
      name: "Amit Sharma",
      role: "COO",
      brands: [activeBrandLabel],
      weeklyPowerMoveCompletion: 14,
      weeklyPowerMoveTarget: 18,
      completionPercentage: 78,
      plannedPowerMoves: 18,
      executedPowerMoves: 14,
      isLeadership: true,
    },
  ]

  const operators = teamPerformance.filter((m) => !m.isLeadership)
  const leadership = teamPerformance.filter((m) => m.isLeadership)

  const sortedOperators = [...operators].sort((a, b) => b.completionPercentage - a.completionPercentage)

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 70) return "bg-emerald-600"
    if (percentage >= 50) return "bg-amber-500"
    return "bg-rose-600" // Red only for Needs Help
  }

  const hasIntegrityGap = (member: TeamMemberPerformance) => {
    return member.plannedPowerMoves !== member.executedPowerMoves
  }

  const greenCount = operators.filter((m) => m.completionPercentage >= 70).length
  const amberCount = operators.filter((m) => m.completionPercentage >= 50 && m.completionPercentage < 70).length
  const redCount = operators.filter((m) => m.completionPercentage < 50).length

  const renderMemberRow = (member: TeamMemberPerformance, showRanking = true) => {
    const statusColor = getStatusColor(member.completionPercentage)
    const initials = member.name
      .split(" ")
      .map((n) => n[0])
      .join("")
    const integrityGap = hasIntegrityGap(member)

    return (
      <tr key={member.id} className="border-b hover:bg-muted/50 transition-colors">
        <td className="py-4 pr-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold">{member.name}</span>
              {integrityGap && (
                <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Integrity Gap</span>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="py-4 pr-4 text-sm text-muted-foreground">{member.role}</td>
        <td className="py-4 pr-4">
          <div className="flex flex-wrap gap-1">
            {member.brands.map((brand) => (
              <Badge key={brand} variant="secondary" className="text-xs">
                {brand}
              </Badge>
            ))}
          </div>
        </td>
        <td className="py-4 pr-4 text-center">
          <span className="text-2xl font-bold">{member.weeklyPowerMoveCompletion}</span>
          <span className="text-lg text-muted-foreground">/{member.weeklyPowerMoveTarget}</span>
        </td>
        <td className="py-4 text-center">
          {showRanking ? (
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold mx-auto ${statusColor}`}
            >
              {member.completionPercentage}%
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-stone-200 text-stone-700 font-bold mx-auto">
              {member.completionPercentage}%
            </div>
          )}
        </td>
      </tr>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Team Performance</CardTitle>
        <CardDescription>
          {greenCount} on track, {amberCount} caution, {redCount} needs help
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Execution Leaders</h3>
          <p className="text-sm text-muted-foreground mb-4">ICs, Managers, Operators - ranked by execution</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground">Team Member</th>
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground">Role</th>
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground">Brands</th>
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground text-center">Completed</th>
                  <th className="pb-4 font-semibold text-sm text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody>{sortedOperators.map((member) => renderMemberRow(member, true))}</tbody>
            </table>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold mb-2">Leadership Integrity</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Leaders set the standard. They are accountable, not gamified.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground">Leader</th>
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground">Role</th>
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground">Brands</th>
                  <th className="pb-4 pr-4 font-semibold text-sm text-muted-foreground text-center">Completed</th>
                  <th className="pb-4 font-semibold text-sm text-muted-foreground text-center">Accountability</th>
                </tr>
              </thead>
              <tbody>{leadership.map((member) => renderMemberRow(member, false))}</tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
