"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobFormProps {
  onJobCreated: () => void
  job?: any
  onUpdate?: () => void
}

export function JobForm({ onJobCreated, job, onUpdate }: JobFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: job?.name || "",
    schedule: job?.schedule || "",
    command: job?.command || "",
    priority: job?.priority || "Medium",
    maxRetries: job?.maxRetries || 3,
    dependencies: job?.dependencies || [],
    description: job?.description || "",
  })
  const [newDependency, setNewDependency] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs"
      const method = job ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: job ? "Job Updated" : "Job Created",
          description: job ? "Job has been updated successfully." : "New job has been created successfully.",
        })

        if (job && onUpdate) {
          onUpdate()
        } else {
          onJobCreated()
          // Reset form
          setFormData({
            name: "",
            schedule: "",
            command: "",
            priority: "Medium",
            maxRetries: 3,
            dependencies: [],
            description: "",
          })
        }
      } else {
        throw new Error("Failed to save job")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addDependency = () => {
    if (newDependency && !formData.dependencies.includes(newDependency)) {
      setFormData({
        ...formData,
        dependencies: [...formData.dependencies, newDependency],
      })
      setNewDependency("")
    }
  }

  const removeDependency = (dep: string) => {
    setFormData({
      ...formData,
      dependencies: formData.dependencies.filter((d) => d !== dep),
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{job ? "Edit Job" : "Create New Job"}</CardTitle>
        <CardDescription>
          {job ? "Update the job configuration" : "Define a new scheduled job with dependencies and retry policies"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Daily Backup"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="e.g., 0 3 * * * (daily at 3 AM)"
              required
            />
            <p className="text-sm text-muted-foreground">
              Examples: "*/5 * * * *" (every 5 minutes), "0 0 * * 0" (weekly on Sunday)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="command">Command/Method</Label>
            <Input
              id="command"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              placeholder="e.g., /scripts/backup.sh or processData()"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this job does..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxRetries">Max Retries</Label>
            <Input
              id="maxRetries"
              type="number"
              min="0"
              max="10"
              value={formData.maxRetries}
              onChange={(e) => setFormData({ ...formData, maxRetries: Number.parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Dependencies</Label>
            <div className="flex gap-2">
              <Input
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                placeholder="Job name that must complete first"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDependency())}
              />
              <Button type="button" onClick={addDependency} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.dependencies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.dependencies.map((dep) => (
                  <Badge key={dep} variant="secondary" className="flex items-center gap-1">
                    {dep}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeDependency(dep)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : job ? "Update Job" : "Create Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
