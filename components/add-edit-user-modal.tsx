"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DepartmentChip } from "./department-chip"
import { AlertCircle, Camera, Upload, X, User } from "lucide-react"
import { Loader2 } from "lucide-react"

type DepartmentCode = "M" | "A" | "S" | "T" | "E" | "R" | "Y"
type Permission = "admin" | "member" | "view"

interface DepartmentAccess {
  code: DepartmentCode
  permission: Permission
}

interface UserDetail {
  id: string
  name: string
  email: string
  role: "super_admin" | "company_admin" | "member" | "viewer"
  status: "active" | "invited" | "disabled"
  company_id?: string | null
  departments: DepartmentAccess[]
  photo?: string
}

interface AddEditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDetail | null
  onSave: (user: Partial<UserDetail>) => void
}

const DEPARTMENTS = [
  { code: "M" as const, name: "Marketing" },
  { code: "A" as const, name: "Accounts/Finance", restricted: true },
  { code: "S" as const, name: "Sales" },
  { code: "T" as const, name: "Team Tools & SOPs" },
  { code: "E" as const, name: "Execution/Ops" },
  { code: "R" as const, name: "R&D/Risk" },
  { code: "Y" as const, name: "Leadership", restricted: true },
]

export function AddEditUserModal({ open, onOpenChange, user, onSave }: AddEditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserDetail["role"]>("member")
  const [status, setStatus] = useState<UserDetail["status"]>("invited")
  const [selectedDepts, setSelectedDepts] = useState<Map<DepartmentCode, Permission>>(new Map())
  const [restrictedConfirmed, setRestrictedConfirmed] = useState(false)
  const [saveAndAddAnother, setSaveAndAddAnother] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setRole(user.role)
      setStatus(user.status)
      const deptMap = new Map<DepartmentCode, Permission>()
      user.departments.forEach((d) => deptMap.set(d.code, d.permission))
      setSelectedDepts(deptMap)
      setRestrictedConfirmed(user.departments.some((d) => d.code === "A" || d.code === "Y"))
      setPhoto(user.photo || null)
    } else {
      resetForm()
    }
  }, [user, open])

  useEffect(() => {
    if (role === "super_admin") {
      const allDepts = new Map<DepartmentCode, Permission>()
      DEPARTMENTS.forEach((d) => allDepts.set(d.code, "admin"))
      setSelectedDepts(allDepts)
      setRestrictedConfirmed(true)
    }
  }, [role])

  const resetForm = () => {
    setName("")
    setEmail("")
    setRole("member")
    setStatus("invited")
    setSelectedDepts(new Map())
    setRestrictedConfirmed(false)
    setSaveAndAddAnother(false)
    setErrors({})
    setPhoto(null)
  }

  const hasRestrictedAccess = selectedDepts.has("A") || selectedDepts.has("Y")

  const canSave =
    name &&
    email &&
    selectedDepts.size > 0 &&
    (!hasRestrictedAccess || restrictedConfirmed) &&
    Object.keys(errors).length === 0

  const handleDeptToggle = (code: DepartmentCode) => {
    const newDepts = new Map(selectedDepts)
    if (newDepts.has(code)) {
      newDepts.delete(code)
    } else {
      newDepts.set(code, "member")
    }
    setSelectedDepts(newDepts)
  }

  const handlePermissionChange = (code: DepartmentCode, permission: Permission) => {
    const newDepts = new Map(selectedDepts)
    newDepts.set(code, permission)
    setSelectedDepts(newDepts)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      return "Email is required"
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return null
  }

  const validateName = (name: string) => {
    if (!name || name.trim().length === 0) {
      return "Name is required"
    }
    if (name.length < 2) {
      return "Name must be at least 2 characters"
    }
    return null
  }

  const handlePhotoUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: "Image must be less than 5MB" })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
        const { photo: _, ...rest } = errors
        setErrors(rest)
      }
      reader.readAsDataURL(file)
    } else {
      setErrors({ ...errors, photo: "Please upload a valid image file" })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePhotoUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    const nameError = validateName(name)
    if (nameError) newErrors.name = nameError

    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    if (selectedDepts.size === 0) {
      newErrors.departments = "Please select at least one department"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const departments: DepartmentAccess[] = Array.from(selectedDepts.entries()).map(([code, permission]) => ({
        code,
        permission,
      }))

      onSave({
        name,
        email,
        role,
        status,
        departments,
        photo: photo || undefined,
      })

      if (saveAndAddAnother) {
        resetForm()
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      // Error handling would go here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information and department access."
              : "Add a new user to the system and assign department permissions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <p className="text-sm text-muted-foreground">
              Upload a photo to enhance identity-based accountability (James Clear philosophy)
            </p>
            <div className="flex items-start gap-6">
              <div className="relative">
                {photo ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                    <img src={photo || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file)
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {isDragging ? (
                      <Camera className="w-8 h-8 text-blue-500" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                    <div className="text-sm">
                      <span className="text-blue-600 font-medium">Click to upload</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  const error = validateName(e.target.value)
                  if (error) {
                    setErrors({ ...errors, name: error })
                  } else {
                    const { name: _, ...rest } = errors
                    setErrors(rest)
                  }
                }}
                placeholder="John Doe"
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  const error = validateEmail(e.target.value)
                  if (error) {
                    setErrors({ ...errors, email: error })
                  } else {
                    const { email: _, ...rest } = errors
                    setErrors(rest)
                  }
                }}
                placeholder="john@arkmedis.com"
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserDetail["role"])}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="member">Team Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as UserDetail["status"])}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasRestrictedAccess && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-sm text-amber-900 font-medium">
                    Accounts/Finance (A) and Leadership (Y) are restricted. Grant only when necessary.
                  </p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="restricted-confirm"
                      checked={restrictedConfirmed}
                      onCheckedChange={(checked) => setRestrictedConfirmed(checked as boolean)}
                      disabled={role === "super_admin"}
                    />
                    <Label htmlFor="restricted-confirm" className="text-sm font-normal cursor-pointer">
                      I confirm this user needs access to sensitive data.
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Department Access *</Label>
            {role === "super_admin" && (
              <p className="text-sm text-gray-600">Super Admins automatically have Admin access to all departments.</p>
            )}
            <div className="space-y-3">
              {DEPARTMENTS.map((dept) => {
                const isSelected = selectedDepts.has(dept.code)
                const permission = selectedDepts.get(dept.code) || "member"
                const isDisabled = role === "super_admin"

                return (
                  <div key={dept.code} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleDeptToggle(dept.code)}
                      disabled={isDisabled}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <DepartmentChip code={dept.code} size="md" />
                      <div className="flex-1">
                        <div className="font-medium">{dept.name}</div>
                        {dept.restricted && <div className="text-xs text-amber-600">Restricted Access</div>}
                      </div>
                    </div>
                    {isSelected && (
                      <Select
                        value={permission}
                        onValueChange={(v) => handlePermissionChange(dept.code, v as Permission)}
                        disabled={isDisabled}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="view">View</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )
              })}
            </div>
            {errors.departments && <p className="text-sm text-red-600">{errors.departments}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {!user && (
            <div className="flex items-center gap-2 mr-auto">
              <Checkbox
                id="save-add-another"
                checked={saveAndAddAnother}
                onCheckedChange={(checked) => setSaveAndAddAnother(checked as boolean)}
              />
              <Label htmlFor="save-add-another" className="text-sm font-normal cursor-pointer">
                Save & Add Another
              </Label>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? "Update User" : "Add User_test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
