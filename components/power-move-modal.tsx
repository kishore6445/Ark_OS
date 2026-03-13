"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import ConfirmationDialog from "@/components/confirmation-dialog"

interface PowerMoveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: PowerMoveFormData) => void | Promise<void>
  victoryTargets: Array<{ id: string; title: string; owner?: string; ownerId?: string; department?: string }>
}

export interface PowerMoveFormData {
  title: string
  frequency: string
  targetPerCycle: number
  owner: string
  ownerId?: string
  linkedVictoryTargets: string[]
  autoCreateTasks: boolean
  selectedDays: string[]
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type UserOption = {
  id: string
  name: string
  email: string
  role?: string
}

export function PowerMoveModal({ open, onOpenChange, onSave, victoryTargets }: PowerMoveModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [users, setUsers] = useState<UserOption[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }
    console.log("Validating field:", field, value)
    switch (field) {
      case "title":
        if (!value || value.trim().length === 0) {
          newErrors.title = "Title is required"
        } else if (value.length < 3) {
          newErrors.title = "Title must be at least 3 characters"
        } else {
          delete newErrors.title
        }
        break
      case "targetPerCycle":
        if (!value || value <= 0) {
          newErrors.targetPerCycle = "Target must be greater than 0"
        } else {
          delete newErrors.targetPerCycle
        }
        break
      case "owner":
        if (!value) {
          newErrors.owner = "Owner is required"
        } else {
          delete newErrors.owner
        }
        break
      case "linkedVictoryTargets":
       // debugger;
        if (availableVictoryTargets.length > 0 && value.length === 0) {
          newErrors.linkedVictoryTargets = "Please link at least one Victory Target"
        } else {
          delete newErrors.linkedVictoryTargets
        }
        break
    }

    setErrors(newErrors)
  }

  const handleSave = async (saveAndAddAnother = false) => {
    const newErrors: Record<string, string> = {}

    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = "Title is required"
    }
    if (!formData.owner) {
      newErrors.owner = "Owner is required"
    }
    if (formData.targetPerCycle <= 0) {
      newErrors.targetPerCycle = "Target must be greater than 0"
    }
    if (availableVictoryTargets.length > 0 && formData.linkedVictoryTargets.length === 0) {
      newErrors.linkedVictoryTargets = "Please link at least one Victory Target"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await onSave(formData)

      toast({
        title: "Success!",
        description: `${formData.title} has been created successfully`,
      })

      if (saveAndAddAnother) {
        setFormData({
          title: "",
          frequency: "weekly",
          targetPerCycle: 0,
          owner: "",
          linkedVictoryTargets: [],
          autoCreateTasks: false,
          selectedDays: [],
        })
        setErrors({})
      } else {
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Power Move. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      selectedDays: formData.selectedDays.includes(day)
        ? formData.selectedDays.filter((d) => d !== day)
        : [...formData.selectedDays, day],
    })
  }

  const [formData, setFormData] = useState<PowerMoveFormData>({
    title: "",
    frequency: "weekly",
    targetPerCycle: 0,
    owner: "",
    ownerId: undefined,
    linkedVictoryTargets: [],
    autoCreateTasks: false,
    selectedDays: [],
  })

  useEffect(() => {
    const hasAnyChange =
      formData.title !== "" ||
      formData.targetPerCycle > 0 ||
      formData.owner !== "" ||
      formData.linkedVictoryTargets.length > 0
    setHasChanges(hasAnyChange)
  }, [formData])

  useEffect(() => {
    if (open && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const normalizeName = (value?: string) => value?.trim().toLowerCase() || ""

  const ownerFilteredTargets = victoryTargets.filter((target) => {
   // debugger;
    if (!formData.owner && !formData.ownerId) return false
    if (formData.ownerId && target.ownerId) {
      return target.ownerId === formData.ownerId
    }
    if (!formData.owner || !target.owner) return false
    return normalizeName(target.owner) === normalizeName(formData.owner)
  })

  const availableVictoryTargets = ownerFilteredTargets

  useEffect(() => {
    if (!formData.linkedVictoryTargets[0]) return
    const stillValid = availableVictoryTargets.some((target) => target.id === formData.linkedVictoryTargets[0])
    if (!stillValid) {
      setFormData((prev) => ({ ...prev, linkedVictoryTargets: [] }))
    }
  }, [availableVictoryTargets, formData.linkedVictoryTargets])

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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges && !isLoading) {
      setShowUnsavedWarning(true)
    } else {
      onOpenChange(newOpen)
    }
  }

  const confirmClose = () => {
    setShowUnsavedWarning(false)
    setHasChanges(false)
    onOpenChange(false)
  }

  const progressCycleCount = Math.max(0, Math.floor(formData.targetPerCycle || 0))
  const progressCycleVisible = Math.min(progressCycleCount, 30)
  const progressCycleOverflow = Math.max(0, progressCycleCount - progressCycleVisible)

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Power Move (Lead Measure)</DialogTitle>
            <DialogDescription>Create a new power move that drives your victory targets</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                ref={titleInputRef}
                id="title"
                placeholder="e.g., Webinars Conducted"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  validateField("title", e.target.value)
                }}
                onBlur={() => validateField("title", formData.title)}
                className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetPerCycle">Target Per Cycle *</Label>
                <Input
                  id="targetPerCycle"
                  type="number"
                  placeholder="0"
                  value={formData.targetPerCycle || ""}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setFormData({ ...formData, targetPerCycle: value })
                    validateField("targetPerCycle", value)
                  }}
                  onBlur={() => validateField("targetPerCycle", formData.targetPerCycle)}
                  className={errors.targetPerCycle ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.targetPerCycle && <p className="text-sm text-red-600">{errors.targetPerCycle}</p>}
                <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Progress</span>
                    {progressCycleCount > 0 && (
                      <span className="text-xs text-stone-500">Cycles: {progressCycleCount}</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {progressCycleCount === 0 ? (
                      <span className="text-xs text-stone-400">Enter a target to preview progress.</span>
                    ) : (
                      <>
                        {Array.from({ length: progressCycleVisible }).map((_, index) => (
                          <span key={index} className="text-lg font-semibold leading-none text-stone-400">
                            -
                          </span>
                        ))}
                        {progressCycleOverflow > 0 && (
                          <span className="text-xs text-stone-500">+{progressCycleOverflow} more</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner *</Label>
              <Select
                value={formData.ownerId ?? formData.owner}
                onValueChange={(value) => {
                  const selected = users.find((user) => user.id === value || user.name === value)
                  const nextOwner = selected?.name ?? value
                  const nextOwnerId = selected?.id
                  setFormData({
                    ...formData,
                    owner: nextOwner,
                    ownerId: nextOwnerId,
                    linkedVictoryTargets: [],
                  })
                  validateField("owner", nextOwner)
                }}
              >
                <SelectTrigger id="owner" className={errors.owner ? "border-red-500 focus-visible:ring-red-500" : ""}>
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
              {errors.owner && <p className="text-sm text-red-600">{errors.owner}</p>}
              {usersError ? <p className="text-sm text-rose-600">{usersError}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Link to Victory Targets *</Label>
              <Select
                value={formData.linkedVictoryTargets[0] || ""}
                onValueChange={(value) => {
                  const nextTargets = value ? [value] : []
                  setFormData({ ...formData, linkedVictoryTargets: nextTargets })
                  validateField("linkedVictoryTargets", nextTargets)
                }}
                disabled={!formData.owner || availableVictoryTargets.length === 0}
              >
                <SelectTrigger
                  className={errors.linkedVictoryTargets ? "border-red-500 focus-visible:ring-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !formData.owner
                        ? "Select owner first"
                        : availableVictoryTargets.length === 0
                          ? "No victory targets for this owner"
                          : "Select victory target"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableVictoryTargets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.owner ? (
                ownerFilteredTargets.length > 0 ? (
                  <p className="text-xs text-stone-500">
                    Available for {formData.owner}: {ownerFilteredTargets.map((target) => target.title).join(", ")}
                  </p>
                ) : (
                  <p className="text-xs text-stone-500">No victory targets found for {formData.owner}.</p>
                )
              ) : (
                <p className="text-xs text-stone-500">Choose an owner to load their victory targets.</p>
              )}
              {errors.linkedVictoryTargets && (
                <p className="text-sm text-red-600">{errors.linkedVictoryTargets}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoCreateTasks"
                  checked={formData.autoCreateTasks}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoCreateTasks: checked as boolean })}
                />
                <label htmlFor="autoCreateTasks" className="text-sm font-medium cursor-pointer">
                  Auto-create recurring tasks
                </label>
              </div>
            </div>

            {formData.autoCreateTasks && formData.frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={formData.selectedDays.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">
                        {day.substring(0, 3)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(true)} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save & Add Another
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        onConfirm={confirmClose}
        variant="destructive"
      />
    </>
  )
}
