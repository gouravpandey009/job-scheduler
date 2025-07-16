"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobForm } from "./job-form"
import { X, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobDetailsProps {
  job: any
  onClose: () => void
  onUpdate: () => void
}

export function JobDetails({ job, onClose, onUpdate }: JobDetailsProps) {
  const { toast } = useToast()
  const [jobHistory, setJobHistory] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchJobHistory()
  }, [job.id])

  const fetchJobHistory = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/history`)
      const data = await response.json()
      setJobHistory(data)
    } catch (error) {
      console.error("Failed to fetch job history:", error)
    }
  }

  const handleRunNow = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/run`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Job Triggered",
          description: "Job has been queued for immediate execution.",
        })
        onUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger job execution.",
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

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Job</h3>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <JobForm
          job={job}
          onUpdate={() => {
            setIsEditing(false)
            onUpdate()
          }}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {job.name}
              <Badge className={getPriorityColor(job.priority)}>{job.priority}</Badge>
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
            </CardTitle>
            <CardDescription>{job.description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Schedule:</strong> {job.schedule}
              </div>
              <div>
                <strong>Command:</strong> {job.command}
              </div>
              <div>
                <strong>Max Retries:</strong> {job.maxRetries}
              </div>
              <div>
                <strong>Created:</strong> {new Date(job.createdAt).toLocaleString()}
              </div>
              {job.lastRun && (
                <div>
                  <strong>Last Run:</strong> {new Date(job.lastRun).toLocaleString()}
                </div>
              )}
              {job.nextRun && (
                <div>
                  <strong>Next Run:</strong> {new Date(job.nextRun).toLocaleString()}
                </div>
              )}
            </div>

            {job.dependencies.length > 0 && (
              <div>
                <strong>Dependencies:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.dependencies.map((dep: string) => (
                    <Badge key={dep} variant="outline">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            {jobHistory.length === 0 ? (
              <p className="text-muted-foreground">No execution history available.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {jobHistory.map((run: any) => (
                  <div key={run.id} className="border rounded p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                      <span>{new Date(run.startTime).toLocaleString()}</span>
                    </div>
                    {run.error && <div className="text-red-600 mt-1">{run.error}</div>}
                    {run.duration && <div className="text-muted-foreground">Duration: {run.duration}ms</div>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-2">
            <Button onClick={handleRunNow} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Run Now
            </Button>
            <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
              Edit Job
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
