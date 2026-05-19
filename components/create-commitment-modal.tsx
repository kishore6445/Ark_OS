"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface CreateCommitmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  powerMoves?: Array<{ id: string; name: string }>
  victoryTargets?: Array<{ id: string; title: string }>
  teamMembers?: Array<{ name: string; role: string }>
  onSave?: () => void
}

export function CreateCommitmentModal({
  open,
  onOpenChange,
  powerMoves = [],
  victoryTargets = [],
  teamMembers = [],
  onSave,
}: CreateCommitmentModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [owner, setOwner] = useState("")
  const [dueDay, setDueDay] = useState("")
  const [frequency, setFrequency] = useState("one-time")
  const [linkedPowerMove, setLinkedPowerMove] = useState("")
  const [linkedVictoryTarget, setLinkedVictoryTarget] = useState("")
  const [notes, setNotes] = useState("")

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }

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
      case "owner":
        if (!value || value.trim().length === 0) {
          newErrors.owner = "Owner is required"
        } else {
          delete newErrors.owner
        }
        break
      case "dueDay":
        if (!value) {
          newErrors.dueDay = "Due day is required"
        } else {
          delete newErrors.dueDay
        }
        break
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!title || title.trim().length === 0) {
      newErrors.title = "Title is required"
    }
    if (!owner || owner.trim().length === 0) {
      newErrors.owner = "Owner is required"
    }
    if (!dueDay) {
      newErrors.dueDay = "Due day is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast({
        title: "Success!",
        description: `Commitment "${title}" has been created`,
      })

      setTitle("")
      setOwner("")
      setDueDay("")
      setFrequency("one-time")
      setLinkedPowerMove("")
      setLinkedVictoryTarget("")
      setNotes("")
      setErrors({})
      setHasChanges(false)
      onOpenChange(false)
      onSave?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create commitment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const hasAnyChange = title !== "" || owner !== "" || dueDay !== "" || notes !== ""
    setHasChanges(hasAnyChange)
  }, [title, owner, dueDay, notes])

  useEffect(() => {
    if (open && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Commitment</DialogTitle>
            <DialogDescription>Add a new commitment to track team accountability</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                ref={titleInputRef}
                id="title"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  validateField("title", e.target.value)
                }}
                onBlur={() => validateField("title", title)}
                className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner">Owner *</Label>
              {teamMembers.length > 0 ? (
                <Select value={owner} onValueChange={(value) => {
                  setOwner(value)
                  validateField("owner", value)
                }}>
                  <SelectTrigger id="owner" className={errors.owner ? "border-red-500 focus-visible:ring-red-500" : ""}>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.name} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="owner"
                  placeholder="Who's responsible?"
                  value={owner}
                  onChange={(e) => {
                    setOwner(e.target.value)
                    validateField("owner", e.target.value)
                  }}
                  onBlur={() => validateField("owner", owner)}
                  className={errors.owner ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
              )}
              {errors.owner && <p className="text-sm text-red-600">{errors.owner}</p>}
            </div>

              <div className="space-y-2">
                <Label htmlFor="due-day">Due Day *</Label>
                <Select
                  value={dueDay}
                  onValueChange={(v) => {
                    setDueDay(v)
                    validateField("dueDay", v)
                  }}
                >
                  <SelectTrigger
                    id="due-day"
                    className={errors.dueDay ? "border-red-500 focus-visible:ring-red-500" : ""}
                  >
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                {errors.dueDay && <p className="text-sm text-red-600">{errors.dueDay}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="power-move">Link Power Move (Optional)</Label>
              <Select value={linkedPowerMove} onValueChange={setLinkedPowerMove}>
                <SelectTrigger id="power-move">
                  <SelectValue placeholder="Select power move" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {powerMoves.map((move) => (
                    <SelectItem key={move.id} value={move.id}>
                      {move.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="victory-target">Link Victory Target (Optional)</Label>
              <Select value={linkedVictoryTarget} onValueChange={setLinkedVictoryTarget}>
                <SelectTrigger id="victory-target">
                  <SelectValue placeholder="Select victory target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {victoryTargets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional context or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length}/500</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Commitment
              </Button>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
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
