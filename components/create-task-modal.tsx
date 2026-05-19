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

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
  teamMembers?: Array<{ name: string; role: string }>
}

export function CreateTaskModal({ open, onOpenChange, onSave, teamMembers = [] }: CreateTaskModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [taskTitle, setTaskTitle] = useState("")
  const [owner, setOwner] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("medium")
  const [notes, setNotes] = useState("")

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }

    switch (field) {
      case "taskTitle":
        if (!value || value.trim().length === 0) {
          newErrors.taskTitle = "Task title is required"
        } else if (value.length < 3) {
          newErrors.taskTitle = "Task title must be at least 3 characters"
        } else {
          delete newErrors.taskTitle
        }
        break
      case "owner":
        if (!value || value.trim().length === 0) {
          newErrors.owner = "Owner is required"
        } else {
          delete newErrors.owner
        }
        break
      case "dueDate":
        if (!value) {
          newErrors.dueDate = "Due date is required"
        } else {
          delete newErrors.dueDate
        }
        break
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!taskTitle || taskTitle.trim().length === 0) {
      newErrors.taskTitle = "Task title is required"
    }
    if (!owner || owner.trim().length === 0) {
      newErrors.owner = "Owner is required"
    }
    if (!dueDate) {
      newErrors.dueDate = "Due date is required"
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
        description: `Task "${taskTitle}" has been created`,
      })

      setTaskTitle("")
      setOwner("")
      setDueDate("")
      setPriority("medium")
      setNotes("")
      setErrors({})
      onOpenChange(false)
      onSave?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new one-time task to complete</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title *</Label>
            <Input
              ref={titleInputRef}
              id="task-title"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value)
                validateField("taskTitle", e.target.value)
              }}
              onBlur={() => validateField("taskTitle", taskTitle)}
              className={errors.taskTitle ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.taskTitle && <p className="text-sm text-red-600">{errors.taskTitle}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-owner">Owner *</Label>
              {teamMembers.length > 0 ? (
                <Select value={owner} onValueChange={(value) => {
                  setOwner(value)
                  validateField("owner", value)
                }}>
                  <SelectTrigger id="task-owner" className={errors.owner ? "border-red-500 focus-visible:ring-red-500" : ""}>
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
                  id="task-owner"
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
              <Label htmlFor="task-due-date">Due Date *</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  validateField("dueDate", e.target.value)
                }}
                onBlur={() => validateField("dueDate", dueDate)}
                className={errors.dueDate ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="task-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes (Optional)</Label>
            <Textarea
              id="task-notes"
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
              Create Task
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
