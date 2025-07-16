"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Trash2, Eye, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobListProps {
  jobs: any[]
  onJobSelect: (job: any) => void
  onJobUpdate: () => void
}

export function JobList({ jobs, onJobSelect, onJobUpdate }: JobListProps) {
  const { toast } = useToast()

  const handleToggleJob = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active"
      const response = await fetch(`/api/jobs/${jobId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "Job Updated",
          description: `Job ${newStatus === "active" ? "activated" : "paused"} successfully.`,
        })
        onJobUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Job Deleted",
          description: "Job has been deleted successfully.",
        })
        onJobUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job.",
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-gray-100 text-gray-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Jobs Found</CardTitle>
          <CardDescription>Create your first job to get started with the scheduler.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Job List</CardTitle>
          <CardDescription>Manage and monitor all your scheduled jobs</CardDescription>
        </CardHeader>
      </Card>

      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{job.name}</h3>
                  <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Schedule: {job.schedule}</span>
                  </div>
                  <div>Command: {job.command}</div>
                  {job.lastRun && <div>Last run: {new Date(job.lastRun).toLocaleString()}</div>}
                  {job.nextRun && <div>Next run: {new Date(job.nextRun).toLocaleString()}</div>}
                  {job.dependencies.length > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Dependencies: {job.dependencies.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onJobSelect(job)}>
                  <Eye className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleToggleJob(job.id, job.status)}>
                  {job.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleDeleteJob(job.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
