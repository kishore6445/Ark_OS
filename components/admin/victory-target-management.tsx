"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { DepartmentChip } from "@/components/department-chip"
import { AddEditVictoryTargetModal } from "@/components/admin/add-edit-victory-target-modal"
import { supabase } from "@/lib/supabase/browserclient"

type VictoryTarget = {
  id: string
  brandId: string
  department: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
  title: string
  target: number
  achieved: number
  unit: string
  deadline: string
  owner: string
  ownerId?: string
  status: "on-track" | "at-risk" | "critical"
}

type CompanyBrand = {
  id: string
  brand_name: string
  brand_slug: string
}

const DEPARTMENT_NAMES = {
  M: "Marketing",
  A: "Accounts/Finance",
  S: "Sales",
  T: "Team Tools & SOPs",
  E: "Execution/Ops",
  R: "R&D/Risk",
  Y: "Leadership",
}

export function VictoryTargetManagement() {
  const [targets, setTargets] = useState<VictoryTarget[]>([])
  const [companyBrands, setCompanyBrands] = useState<CompanyBrand[]>([])
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<VictoryTarget | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadTargets()
    loadCompanyBrands()
  }, [])

  const loadCompanyBrands = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token
      const headers: Record<string, string> = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }

      const response = await fetch("/api/admin/company-brands", { cache: "no-store", headers })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || !Array.isArray(result?.brands)) {
        setCompanyBrands([])
        return
      }

      setCompanyBrands(result.brands)
    } catch {
      setCompanyBrands([])
    }
  }

  const loadTargets = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/admin/victory-targets", { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) {
        setErrorMessage(result?.error || "Unable to load victory targets.")
        setTargets([])
        return
      }

      if (Array.isArray(result.targets)) {
        setTargets(result.targets)
      } else {
        setTargets([])
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load victory targets.")
      setTargets([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTargets = targets.filter((t) => {
    const matchesDept = deptFilter === "all" || t.department === deptFilter
    const matchesBrand = brandFilter === "all" || t.brandId === brandFilter
    return matchesDept && matchesBrand
  })

  const handleSaveTarget = async (data: Partial<VictoryTarget>) => {
    setErrorMessage(null)
    try {
      if (editingTarget) {
        const response = await fetch("/api/admin/victory-targets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingTarget.id,
            brandId: data.brandId || editingTarget.brandId,
            department: data.department || editingTarget.department,
            title: data.title || editingTarget.title,
            target: data.target ?? editingTarget.target,
            achieved: data.achieved ?? editingTarget.achieved,
            owner: data.owner ?? editingTarget.owner,
            ownerId: data.ownerId ?? editingTarget.ownerId,
            unit: data.unit || editingTarget.unit,
          }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          setErrorMessage(result?.error || "Unable to update victory target.")
          return
        }

        setEditingTarget(null)
      } else {
        const response = await fetch("/api/admin/victory-targets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId: data.brandId,
            department: data.department,
            title: data.title,
            target: data.target,
            achieved: data.achieved,
            owner: data.owner,
            ownerId: data.ownerId,
            unit: data.unit,
          }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          setErrorMessage(result?.error || "Unable to create victory target.")
          return
        }
      }

      setIsModalOpen(false)
      await loadTargets()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save victory target.")
    }
  }

  const handleDeleteTarget = (id: string) => {
    setTargets(targets.filter((t) => t.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "at-risk":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  return (
    <>
      {errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Victory Target Configuration</h1>
          <p className="text-gray-600">
            Set targets and deadlines for each department's Victory Targets (Lag Measures).
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Victory Target_test
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {companyBrands.map((brand) => (
              <SelectItem key={brand.id} value={brand.brand_slug}>
                {brand.brand_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="M">Marketing</SelectItem>
            <SelectItem value="A">Accounts/Finance</SelectItem>
            <SelectItem value="S">Sales</SelectItem>
            <SelectItem value="T">Team Tools & SOPs</SelectItem>
            <SelectItem value="E">Execution/Ops</SelectItem>
            <SelectItem value="R">R&D/Risk</SelectItem>
            <SelectItem value="Y">Leadership</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Victory Target</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Achieved</TableHead>
              <TableHead>Gap</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-sm text-gray-500">
                  Loading victory targets...
                </TableCell>
              </TableRow>
            ) : filteredTargets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-sm text-gray-500">
                  No victory targets yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredTargets.map((target) => {
              const gap = target.target - target.achieved
              const progress = Math.round((target.achieved / target.target) * 100)
              return (
                <TableRow key={target.id}>
                  <TableCell>
                    <DepartmentChip code={target.department} />
                  </TableCell>
                  <TableCell className="font-medium">{target.title}</TableCell>
                  <TableCell className="text-gray-900 font-semibold">{target.target.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-900 font-semibold">{target.achieved.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600 font-semibold">{gap.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{target.deadline}</TableCell>
                  <TableCell className="text-gray-600">{target.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(target.status)}>
                      {target.status === "on-track" ? "On Track" : target.status === "at-risk" ? "At Risk" : "Critical"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTarget(target)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTarget(target.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddEditVictoryTargetModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingTarget(null)
        }}
        target={editingTarget}
        brands={companyBrands}
        onSave={handleSaveTarget}
      />
    </>
  )
}
