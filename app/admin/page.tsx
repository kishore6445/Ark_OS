"use client"

import { useEffect, useState } from "react"
import { PageTransition } from "@/components/page-transition"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Upload, MoreVertical, Edit, Ban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddEditUserModal } from "@/components/add-edit-user-modal"
import { DepartmentChip } from "@/components/department-chip"
import { VictoryTargetManagement } from "@/components/admin/victory-target-management"
import { PowerMoveManagement } from "@/components/admin/power-move-management"
import { AchievementTracking } from "@/components/admin/achievement-tracking"
import { BrandAssignmentManagement } from "@/components/admin/brand-assignment-management"
import { CompanyPerformanceAdmin } from "@/components/admin/company-performance-admin"
import { useUser } from "@/lib/user-context"

type User = {
  id: string
  name: string
  email: string
  role: "super_admin" | "company_admin" | "member" | "viewer"
  status: "active" | "invited" | "disabled"
  company_id?: string | null
  departments: Array<{
    code: "M" | "A" | "S" | "T" | "E" | "R" | "Y"
    permission: "admin" | "member" | "view"
  }>
  lastUpdated: string
}

const DEPARTMENT_MAP = {
  M: "Marketing",
  A: "Accounts/Finance",
  S: "Sales",
  T: "Team Tools & SOPs",
  E: "Execution/Ops",
  R: "R&D/Risk",
  Y: "Leadership",
}

const AUDIT_LOG: Array<{
  id: string
  timestamp: string
  admin: string
  action: string
  targetUser: string
  details: string
}> = []

export default function AdminPage() {
  const { currentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        const result = await response.json()

        if (!response.ok) {
          if (isActive) setSaveError(result?.error || "Unable to load users.")
          return
        }

        if (isActive) setUsers(Array.isArray(result.users) ? result.users : [])
      } catch (error) {
        if (isActive) setSaveError(error instanceof Error ? error.message : "Unable to load users.")
      }
    }

    loadUsers()

    return () => {
      isActive = false
    }
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesDept = deptFilter === "all" || user.departments.some((d) => d.code === deptFilter)
    return matchesSearch && matchesRole && matchesDept
  })

  const handleSaveUser = async (userData: Partial<User>) => {
    setSaveError(null)
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)))
      setEditingUser(null)
    } else {
      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            company_id: userData.company_id ?? currentUser?.company_id ?? null,
            departments: userData.departments,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          setSaveError(result?.error || "Unable to create user.")
          return
        }

        const newUser: User = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          company_id: result.user.company_id ?? null,
          departments: result.departments || userData.departments || [],
          lastUpdated: new Date().toISOString().split("T")[0],
        }

        setUsers([...users, newUser])
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to create user.")
        return
      }
    }
    setIsAddUserOpen(false)
  }

  const handleDisableUser = (userId: string) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: u.status === "disabled" ? "active" : "disabled" } : u)),
    )
  }

  return (
    <PageTransition>
      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="users">Users_test</TabsTrigger>
              <TabsTrigger value="brand-assignment">Brand Assignment</TabsTrigger>
              <TabsTrigger value="company-performance">Company Performance</TabsTrigger>
              <TabsTrigger value="victory-targets">Victory Targets</TabsTrigger>
              <TabsTrigger value="power-moves">Power Moves</TabsTrigger>
              <TabsTrigger value="achievements">Achievement Tracking</TabsTrigger>
              <TabsTrigger value="permissions">Departments & Permissions</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management_123</h1>
                  <p className="text-gray-600">Add users and control department access.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </Button>
                  <Button onClick={() => setIsAddUserOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="w-4 h-4" />
                    Add User
                  </Button>
                </div>
              </div>

              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                    <SelectItem value="member">Team Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Departments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "super_admin"
                                ? "default"
                                : user.role === "company_admin"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {user.role === "super_admin"
                              ? "Super Admin"
                              : user.role === "company_admin"
                                ? "Company Admin"
                                : user.role === "member"
                                  ? "Member"
                                  : "Viewer"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.departments.map((dept) => (
                              <DepartmentChip key={dept.code} code={dept.code} permission={dept.permission} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : user.status === "invited" ? "secondary" : "outline"
                            }
                            className={
                              user.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : user.status === "invited"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                            }
                          >
                            {user.status === "active" ? "Active" : user.status === "invited" ? "Invited" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{user.lastUpdated}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingUser(user)
                                  setIsAddUserOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDisableUser(user.id)}>
                                <Ban className="w-4 h-4 mr-2" />
                                {user.status === "disabled" ? "Enable" : "Disable"} User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="brand-assignment" className="space-y-6">
              <BrandAssignmentManagement />
            </TabsContent>

            <TabsContent value="company-performance" className="space-y-6">
              <CompanyPerformanceAdmin />
            </TabsContent>

            <TabsContent value="victory-targets" className="space-y-6">
              <VictoryTargetManagement />
            </TabsContent>

            <TabsContent value="power-moves" className="space-y-6">
              <PowerMoveManagement />
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <AchievementTracking />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments & Permissions</h1>
                <p className="text-gray-600 mb-6">
                  Department Admins can create/edit Victory Targets and Power Moves. Members can only update commitments
                  and tasks. Viewers are read-only.
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Department</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Object.entries(DEPARTMENT_MAP) as Array<[keyof typeof DEPARTMENT_MAP, string]>).map(
                      ([code, name]) => (
                        <TableRow key={code}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <DepartmentChip code={code} />
                              <span>{name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            Create/edit Victory Targets, Power Moves, commitments, tasks
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">Update commitments and tasks only</TableCell>
                          <TableCell className="text-sm text-gray-600">Read-only access to all data</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Restricted Departments</h3>
                <p className="text-sm text-amber-800">
                  <strong>Accounts/Finance (A)</strong> and <strong>Leadership (Y)</strong> contain sensitive data. Only
                  grant access when necessary and ensure proper approval.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Log</h1>
                <p className="text-gray-600">Track all user management activities and permission changes.</p>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AUDIT_LOG.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-gray-500">
                          No audit activity yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      AUDIT_LOG.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-gray-600">{log.timestamp}</TableCell>
                          <TableCell className="font-medium">{log.admin}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{log.targetUser}</TableCell>
                          <TableCell className="text-gray-600">{log.details}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <AddEditUserModal
          open={isAddUserOpen}
          onOpenChange={(open) => {
            setIsAddUserOpen(open)
            if (!open) setEditingUser(null)
          }}
          user={editingUser}
          onSave={handleSaveUser}
        />
      </div>
    </PageTransition>
  )
}
