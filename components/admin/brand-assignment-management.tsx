"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AssignUserToBrandModal } from "./assign-user-to-brand-modal"
import { useUser } from "@/lib/user-context"
import { supabase } from "@/lib/supabase/browserclient"

type BrandId = string

type BrandAssignment = {
  id: string
  userId: string
  userName: string
  userEmail: string
  brandId: BrandId
  brandName: string
  departments: Array<{
    code: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
    name: string
    permission: "admin" | "member" | "view"
  }>
  createdAt: string
}

type UserOption = {
  id: string
  name: string
  email: string
  departments: Array<{
    code: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
    permission: "admin" | "member" | "view"
  }>
}

export function BrandAssignmentManagement() {
  const { currentUser } = useUser()
  const [assignments, setAssignments] = useState<BrandAssignment[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [companyBrands, setCompanyBrands] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingBrands, setIsLoadingBrands] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<BrandAssignment | null>(null)

  const loadCompanyBrands = async () => {
    setIsLoadingBrands(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token
      const headers: Record<string, string> = {}
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
      }
      const response = await fetch("/api/admin/company-brands", { cache: "no-store", headers })
      const raw = await response.text()
      const result = raw ? JSON.parse(raw) : {}
      console.log("[BrandAssignmentManagement] API response:", { status: response.status, data: result })
      if (response.ok && Array.isArray(result.brands)) {
        setCompanyBrands(result.brands)
        console.log("[BrandAssignmentManagement] Company brands loaded:", result.brands)
      } else {
        console.error("[BrandAssignmentManagement] Failed to fetch brands:", result.error)
        setCompanyBrands([])
      }
    } catch (error) {
      console.error("[BrandAssignmentManagement] Failed to load company brands:", error)
      setCompanyBrands([])
    } finally {
      setIsLoadingBrands(false)
    }
  }

  const loadAssignments = async () => {
    const response = await fetch("/api/admin/brand-assignments", { cache: "no-store" })
         

    const result = await response.json()

    console.log("Assigments fetched", result.assignments);
    if (response.ok && Array.isArray(result.assignments)) {
      setAssignments(result.assignments)
    }
  }

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
        setUsers(
          result.users.map(
            (user: {
              id: string
              name: string
              email: string
              departments?: Array<{
                code: UserOption["departments"][number]["code"]
                permission: UserOption["departments"][number]["permission"]
              }>
            }) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              departments: user.departments || [],
            }),
          ),
        )
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

  useEffect(() => {
    loadAssignments()
    loadUsers()
    // Load company brands regardless of currentUser state
    // The API will authenticate based on session cookies/headers
    loadCompanyBrands()
  }, [])

  useEffect(() => {
    if (isAssignModalOpen && users.length === 0 && !isLoadingUsers) {
      loadUsers()
    }
  }, [isAssignModalOpen, isLoadingUsers, users.length])

  const userDeptMap = new Map(users.map((user) => [user.id, user.departments]))
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.brandName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = brandFilter === "all" || assignment.brandId === brandFilter
    return matchesSearch && matchesBrand
  })

  const handleDeleteAssignment = async (id: string) => {
    if (confirm("Are you sure you want to remove this user from this brand?")) {
      const response = await fetch(`/api/admin/brand-assignments?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        setAssignments((prev) => prev.filter((assignment) => assignment.id !== id))
      } else {
        loadAssignments()
      }
    }
  }

  const handleSaveAssignment = async (assignmentData: Partial<BrandAssignment>) => {
    //;
    console.log("Saving assignment data:", assignmentData);
    if (editingAssignment) {
      const response = await fetch("/api/admin/brand-assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAssignment.id,
          ...assignmentData,
        }),
      })
      if (response.ok) {
        const result = await response.json()
        if (result.assignment) {
          setAssignments((prev) =>
            prev.map((assignment) =>
              assignment.id === editingAssignment.id
                ? {
                    ...assignment,
                    ...result.assignment,
                    departments: assignmentData.departments || assignment.departments,
                  }
                : assignment,
            ),
          )
        } else {
          loadAssignments()
        }
      } else {
        loadAssignments()
      }
      setEditingAssignment(null)
    } else {
      const response = await fetch("/api/admin/brand-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData),
      })
      console.log("Response is"+response)
      if (response.ok) {
        const result = await response.json()
        if (result.assignment) {
          setAssignments((prev) => [
            {
              ...result.assignment,
              departments: assignmentData.departments || [],
            },
            ...prev,
          ])
        } else {
          loadAssignments()
        }
      } else {
        debugger;
        const errorBody = await response.json().catch(() => null)
        console.error("[BrandAssignmentManagement] Failed to save assignment:", errorBody)
        loadAssignments()
      }
    }
    setIsAssignModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand & Department Assignment</h1>
          <p className="text-gray-600">Assign users to specific brands and departments within those brands.</p>
        </div>
        <Button onClick={() => setIsAssignModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          Assign User to Brand
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by user or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {companyBrands.map((brand: any) => (
              <SelectItem key={brand.id} value={brand.brand_slug}>
                {brand.brand_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {usersError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {usersError}
        </div>
      ) : null}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Departments</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-gray-500">
                  No brand assignments yet_test
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((assignment) => {
                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.userName}</div>
                        <div className="text-sm text-gray-600">{assignment.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {assignment.brandName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(assignment.departments.length > 0
                          ? assignment.departments
                          : (userDeptMap.get(assignment.userId) || []).map((dept) => ({
                              code: dept.code,
                              name: dept.code,
                              permission: dept.permission,
                            })))
                          .map((dept) => (
                          <Badge
                            key={dept.code}
                            variant={
                              dept.permission === "admin"
                                ? "default"
                                : dept.permission === "member"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {dept.name} ({dept.permission})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{assignment.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingAssignment(assignment)
                            setIsAssignModalOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(assignment.id)}>
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

      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Multi-Brand Assignment_123</h3>
        <p className="text-sm text-blue-800">
          Users like Finance can be assigned to multiple brands. For example, Michael Chen is assigned to
          Accounts/Finance for all three brands (Warrior Systems, Story Marketing, and Meta Gurukul).
        </p>
      </div> */}

      <AssignUserToBrandModal
        open={isAssignModalOpen}
        onOpenChange={(open) => {
          setIsAssignModalOpen(open)
          if (!open) setEditingAssignment(null)
        }}
        users={users}
        brands={companyBrands}
        assignment={editingAssignment}
        onSave={handleSaveAssignment}
      />
    </div>
  )
}
