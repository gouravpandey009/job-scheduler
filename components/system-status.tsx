"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Server, Activity, Clock, AlertTriangle } from "lucide-react"

export function SystemStatus() {
  const [workers, setWorkers] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 0,
    totalExecutions: 0,
    successRate: 0,
    avgExecutionTime: 0,
  })

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      const [workersResponse, metricsResponse] = await Promise.all([
        fetch("/api/system/workers"),
        fetch("/api/system/metrics"),
      ])

      const workersData = await workersResponse.json()
      const metricsData = await metricsResponse.json()

      setWorkers(workersData)
      setSystemMetrics(metricsData)
    } catch (error) {
      console.error("Failed to fetch system status:", error)
    }
  }

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(systemMetrics.uptime / 3600)}h {Math.floor((systemMetrics.uptime % 3600) / 60)}m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalExecutions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.successRate}%</div>
            <Progress value={systemMetrics.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.avgExecutionTime}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Worker Nodes
          </CardTitle>
          <CardDescription>Status and performance of distributed worker machines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workers.map((worker: any) => (
              <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{worker.name}</div>
                    <div className="text-sm text-muted-foreground">{worker.host}</div>
                  </div>
                  <Badge className={getWorkerStatusColor(worker.status)}>{worker.status}</Badge>
                </div>

                <div className="text-right text-sm">
                  <div>CPU: {worker.cpuUsage}%</div>
                  <div>Memory: {worker.memoryUsage}%</div>
                  <div>
                    Jobs: {worker.activeJobs}/{worker.maxJobs}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Worker-2 is experiencing high CPU usage (85%)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm">System is operating normally</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
