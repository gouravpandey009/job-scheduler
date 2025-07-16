"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobForm } from "@/components/job-form"
import { JobList } from "@/components/job-list"
import { SystemStatus } from "@/components/system-status"
import { JobDetails } from "@/components/job-details"
import { Calendar, Clock, Server, Activity } from "lucide-react"

export default function JobSchedulerDashboard() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [systemStats, setSystemStats] = useState({
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    activeWorkers: 3,
  })

  useEffect(() => {
    fetchJobs()
    fetchSystemStats()
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchJobs()
      fetchSystemStats()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs")
      const data = await response.json()
      setJobs(data)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const response = await fetch("/api/system/stats")
      const data = await response.json()
      setSystemStats(data)
    } catch (error) {
      console.error("Failed to fetch system stats:", error)
    }
  }

  const handleJobCreated = () => {
    fetchJobs()
    fetchSystemStats()
  }

  const handleJobUpdated = () => {
    fetchJobs()
    fetchSystemStats()
    setSelectedJob(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Distributed Job Scheduler</h1>
          <p className="text-muted-foreground">Manage and monitor your scheduled jobs across distributed workers</p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStats.runningJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{systemStats.completedJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{systemStats.failedJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeWorkers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="create">Create Job</TabsTrigger>
            <TabsTrigger value="system">System Status</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <JobList jobs={jobs} onJobSelect={setSelectedJob} onJobUpdate={handleJobUpdated} />
              </div>
              <div>
                {selectedJob ? (
                  <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} onUpdate={handleJobUpdated} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                      <CardDescription>Select a job from the list to view details</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <JobForm onJobCreated={handleJobCreated} />
          </TabsContent>

          <TabsContent value="system">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
