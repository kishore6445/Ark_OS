"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { DepartmentChip } from "@/components/department-chip"
import { AddEditPowerMoveModal } from "@/components/admin/add-edit-power-move-modal"
import { supabase } from "@/lib/supabase/browserclient"

type PowerMove = {
  id: string
  brandId: string
  department: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
  name: string
  frequency: "daily" | "weekly" | "monthly"
  weeklyTarget: number
  owner: string
  ownerId?: string
  linkedVictoryTargetId?: string
  linkedVictoryTargetTitle: string
}

type CompanyBrand = {
  id: string
  brand_name: string
  brand_slug: string
}

export function PowerMoveManagement() {
  const [powerMoves, setPowerMoves] = useState<PowerMove[]>([])
  const [companyBrands, setCompanyBrands] = useState<CompanyBrand[]>([])
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPowerMove, setEditingPowerMove] = useState<PowerMove | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    loadPowerMoves()
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

  const loadPowerMoves = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/admin/power-moves", { cache: "no-store" })
      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result?.error || "Unable to load power moves.")
        setPowerMoves([])
        return
      }

      if (Array.isArray(result.powerMoves)) {
        setPowerMoves(result.powerMoves)
      } else {
        setPowerMoves([])
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load power moves.")
      setPowerMoves([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPowerMoves = powerMoves.filter((pm) => {
    const matchesDept = deptFilter === "all" || pm.department === deptFilter
    const matchesBrand = brandFilter === "all" || pm.brandId === brandFilter
    return matchesDept && matchesBrand
  })

  const handleSavePowerMove = async (data: Partial<PowerMove>) => {
    setErrorMessage(null)
    try {
      if (editingPowerMove) {
        const response = await fetch("/api/admin/power-moves", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPowerMove.id,
            brandId: data.brandId || editingPowerMove.brandId,
            department: data.department || editingPowerMove.department,
            name: data.name || editingPowerMove.name,
            frequency: data.frequency || editingPowerMove.frequency,
            weeklyTarget: data.weeklyTarget ?? editingPowerMove.weeklyTarget,
            owner: data.owner ?? editingPowerMove.owner,
            ownerId: data.ownerId ?? editingPowerMove.ownerId,
            linkedVictoryTargetId: data.linkedVictoryTargetId ?? editingPowerMove.linkedVictoryTargetId,
          }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          setErrorMessage(result?.error || "Unable to update power move.")
          return
        }

        setEditingPowerMove(null)
      } else {
        const response = await fetch("/api/admin/power-moves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId: data.brandId,
            department: data.department,
            name: data.name,
            frequency: data.frequency,
            weeklyTarget: data.weeklyTarget,
            owner: data.owner,
            ownerId: data.ownerId,
            linkedVictoryTargetId: data.linkedVictoryTargetId,
          }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          setErrorMessage(result?.error || "Unable to create power move.")
          return
        }
      }

      setIsModalOpen(false)
      await loadPowerMoves()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save power move.")
    }
  }

  const handleDeletePowerMove = async (id: string) => {
    setErrorMessage(null)
    try {
      const response = await fetch("/api/admin/power-moves", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        setErrorMessage(result?.error || "Unable to delete power move.")
        return
      }

      await loadPowerMoves()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete power move.")
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Power Move Management</h1>
          <p className="text-gray-600">Configure Daily Power Moves (Lead Measures) and link them to Victory Targets.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Power Move
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
              <TableHead>Power Move</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Weekly Target</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Drives Victory Target</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                  Loading power moves...
                </TableCell>
              </TableRow>
            ) : filteredPowerMoves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">
                  No power moves yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredPowerMoves.map((pm) => (
                <TableRow key={pm.id}>
                  <TableCell>
                    <DepartmentChip code={pm.department} />
                  </TableCell>
                  <TableCell className="font-medium">{pm.name}</TableCell>
                  <TableCell className="text-gray-600">{pm.frequency}</TableCell>
                  <TableCell className="text-gray-900 font-semibold">{pm.weeklyTarget}</TableCell>
                  <TableCell className="text-gray-600">{pm.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {pm.linkedVictoryTargetTitle || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPowerMove(pm)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePowerMove(pm.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddEditPowerMoveModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingPowerMove(null)
        }}
        powerMove={editingPowerMove}
        brands={companyBrands}
        onSave={handleSavePowerMove}
      />
    </>
  )
}
