"use client"

import type React from "react"

import { useState } from "react"
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

interface QuickCommitmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamMembers?: Array<{ name: string; role: string }>
}

export function QuickCommitmentModal({ open, onOpenChange, teamMembers = [] }: QuickCommitmentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    owner: "",
    day: "",
    leadMeasure: "",
    brandLane: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Commitment submitted:", formData)
    // Reset form and close modal
    setFormData({
      title: "",
      owner: "",
      day: "",
      leadMeasure: "",
      brandLane: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Quick Add Commitment</DialogTitle>
            <DialogDescription>
              Create a new commitment for this week. All fields are required to ensure accountability.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Commitment Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Commitment Title</Label>
              <Input
                id="title"
                placeholder="e.g., Complete Q4 financial review"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Owner */}
            <div className="grid gap-2">
              <Label htmlFor="owner">Owner</Label>
              <Select value={formData.owner} onValueChange={(value) => setFormData({ ...formData, owner: value })}>
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <SelectItem key={member.name} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="sarah-m">Sarah M.</SelectItem>
                      <SelectItem value="john-d">John D.</SelectItem>
                      <SelectItem value="emily-r">Emily R.</SelectItem>
                      <SelectItem value="amit-p">Amit P.</SelectItem>
                      <SelectItem value="neha-m">Neha M.</SelectItem>
                      <SelectItem value="priya-k">Priya K.</SelectItem>
                      <SelectItem value="rahul-s">Rahul S.</SelectItem>
                      <SelectItem value="ravi-t">Ravi T.</SelectItem>
                      <SelectItem value="lisa-w">Lisa W.</SelectItem>
                      <SelectItem value="mike-r">Mike R.</SelectItem>
                      <SelectItem value="james-l">James L.</SelectItem>
                      <SelectItem value="anna-k">Anna K.</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Due Day */}
            <div className="grid gap-2">
              <Label htmlFor="day">Due Day</Label>
              <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Related Lead Measure */}
            <div className="grid gap-2">
              <Label htmlFor="leadMeasure">Related Lead Measure</Label>
              <Select
                value={formData.leadMeasure}
                onValueChange={(value) => setFormData({ ...formData, leadMeasure: value })}
              >
                <SelectTrigger id="leadMeasure">
                  <SelectValue placeholder="Select lead measure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads-generated">New Leads Generated</SelectItem>
                  <SelectItem value="client-meetings">Client Meetings Held</SelectItem>
                  <SelectItem value="revenue-target">Monthly Revenue</SelectItem>
                  <SelectItem value="sops-documented">SOPs Documented</SelectItem>
                  <SelectItem value="commitments-met">Weekly Commitments Met</SelectItem>
                  <SelectItem value="experiments-launched">Experiments Launched</SelectItem>
                  <SelectItem value="leadership-rituals">Leadership Rituals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand Lane */}
            <div className="grid gap-2">
              <Label htmlFor="brandLane">Brand Lane</Label>
              <Select
                value={formData.brandLane}
                onValueChange={(value) => setFormData({ ...formData, brandLane: value })}
              >
                <SelectTrigger id="brandLane">
                  <SelectValue placeholder="Select brand lane" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="story-marketing">Story Marketing</SelectItem>
                  <SelectItem value="warrior-systems">Warrior Systems</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Commitment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
