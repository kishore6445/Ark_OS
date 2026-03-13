"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type VictoryTarget = {
  id: string
  brandId?: string
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

type VictoryTargetFormData = {
  brandId: string
  department: VictoryTarget["department"]
  title: string
  target: number
  achieved: number
  unit: string
  deadline: string
  owner: string
  ownerId?: string
  status: VictoryTarget["status"]
}

type UserOption = {
  id: string
  name: string
  email: string
  role?: string
  departments?: Array<{ code: VictoryTarget["department"]; permission: "admin" | "member" | "view" }>
}

type CompanyBrand = {
  id: string
  brand_name: string
  brand_slug: string
}

interface AddEditVictoryTargetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: VictoryTarget | null
  brands: CompanyBrand[]
  onSave: (data: Partial<VictoryTarget>) => void
}

export function AddEditVictoryTargetModal({
  open,
  onOpenChange,
  target,
  brands,
  onSave,
}: AddEditVictoryTargetModalProps) {
  const getDefaultBrandId = () => brands[0]?.brand_slug || ""

  const [formData, setFormData] = useState<VictoryTargetFormData>({
    brandId: getDefaultBrandId(),
    department: "M",
    title: "",
    target: 0,
    achieved: 0,
    unit: "clients",
    deadline: "",
    owner: "",
    ownerId: undefined,
    status: "on-track",
  })
  const [users, setUsers] = useState<UserOption[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    if (target) {
      setFormData({
        brandId: target.brandId || getDefaultBrandId(),
        department: target.department,
        title: target.title,
        target: target.target,
        achieved: target.achieved,
        unit: target.unit,
        deadline: target.deadline,
        owner: target.owner,
        ownerId: target.ownerId,
        status: target.status,
      })
    } else {
      setFormData({
        brandId: getDefaultBrandId(),
        department: "M",
        title: "",
        target: 0,
        achieved: 0,
        unit: "clients",
        deadline: "",
        owner: "",
        ownerId: undefined,
        status: "on-track",
      })
    }
  }, [target, open, brands])

  useEffect(() => {
    if (!formData.brandId && brands.length > 0) {
      setFormData((prev) => ({ ...prev, brandId: brands[0].brand_slug }))
    }
  }, [brands, formData.brandId])

  useEffect(() => {
    if (!open) return

    const loadUsers = async () => {
      setIsLoadingUsers(true)
      setUsersError(null)
      try {
        const response = await fetch("/api/admin/users", { cache: "no-store" })
        const result = await response.json()
        if (!response.ok) {
          setUsersError(result?.error || "Unable to load users.")
          setUsers([])
          return
        }

        if (Array.isArray(result.users)) {
          setUsers(result.users)
        } else {
          setUsers([])
        }
      } catch (error) {
        setUsersError(error instanceof Error ? error.message : "Unable to load users.")
        setUsers([])
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [open])

  const selectedOwner = users.find((user) => user.id === formData.ownerId)
  const ownerDepartments = selectedOwner?.departments || []
  const availableDepartments = ownerDepartments.length > 0 ? ownerDepartments.map((dept) => dept.code) : null

  useEffect(() => {
    if (!availableDepartments || availableDepartments.length === 0) return
    if (!availableDepartments.includes(formData.department)) {
      setFormData((prev) => ({ ...prev, department: availableDepartments[0] }))
    }
  }, [availableDepartments, formData.department])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{target ? "Edit Victory Target" : "Add Victory Target"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select value={formData.brandId} onValueChange={(value) => setFormData({ ...formData, brandId: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brands.length === 0 ? (
                  <SelectItem value="no-brands" disabled>
                    No brands available
                  </SelectItem>
                ) : (
                  brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.brand_slug}>
                      {brand.brand_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Select which brand this Victory Target belongs to</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value: any) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(availableDepartments || ["M", "A", "S", "T", "E", "R", "Y"]).map((code) => (
                    <SelectItem key={code} value={code}>
                      {code === "M"
                        ? "Marketing"
                        : code === "A"
                          ? "Accounts/Finance"
                          : code === "S"
                            ? "Sales"
                            : code === "T"
                              ? "Team Tools & SOPs"
                              : code === "E"
                                ? "Execution/Ops"
                                : code === "R"
                                  ? "R&D/Risk"
                                  : "Leadership"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select
                value={formData.ownerId || ""}
                onValueChange={(value) => {
                  const selectedUser = users.find((user) => user.id === value)
                  setFormData({
                    ...formData,
                    ownerId: value,
                    owner: selectedUser?.name || "",
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select owner"} />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((user) => !user.role?.toLowerCase().includes("admin"))
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {usersError ? <p className="text-sm text-rose-600">{usersError}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Victory Target Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Qualified Conversations Touched"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Number</Label>
              <Input
                id="target"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                placeholder="1500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="clients"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achieved">Current Achievement_test</Label>
            <Input
              id="achieved"
              type="number"
              value={formData.achieved}
              onChange={(e) => setFormData({ ...formData, achieved: Number(e.target.value) })}
              placeholder="420"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                placeholder="Dec 31, 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {target ? "Update" : "Create"} Victory Target
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
