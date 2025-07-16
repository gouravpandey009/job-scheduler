import { CronJob } from "./cron-job"
import { WorkerManager } from "./worker-manager"

export interface Job {
  id: string
  name: string
  schedule: string
  command: string
  priority: "High" | "Medium" | "Low"
  maxRetries: number
  dependencies: string[]
  description: string
  status: "active" | "paused" | "running" | "completed" | "failed"
  createdAt: Date
  lastRun?: Date
  nextRun?: Date
  retryCount: number
}

export interface JobExecution {
  id: string
  jobId: string
  status: "running" | "completed" | "failed"
  startTime: Date
  endTime?: Date
  duration?: number
  error?: string
  workerId?: string
}

export class JobScheduler {
  private static instance: JobScheduler
  private jobs: Map<string, Job> = new Map()
  private jobHistory: Map<string, JobExecution[]> = new Map()
  private cronJobs: Map<string, CronJob> = new Map()
  private workerManager: WorkerManager
  private executionQueue: Job[] = []
  private isProcessing = false

  private constructor() {
    this.workerManager = WorkerManager.getInstance()
    this.startScheduler()
  }

  public static getInstance(): JobScheduler {
    if (!JobScheduler.instance) {
      JobScheduler.instance = new JobScheduler()
    }
    return JobScheduler.instance
  }

  public createJob(jobData: Partial<Job>): Job {
    const job: Job = {
      id: this.generateId(),
      name: jobData.name || "",
      schedule: jobData.schedule || "",
      command: jobData.command || "",
      priority: jobData.priority || "Medium",
      maxRetries: jobData.maxRetries || 3,
      dependencies: jobData.dependencies || [],
      description: jobData.description || "",
      status: "active",
      createdAt: new Date(),
      retryCount: 0,
    }

    this.jobs.set(job.id, job)
    this.jobHistory.set(job.id, [])
    this.scheduleJob(job)

    return job
  }

  public updateJob(id: string, jobData: Partial<Job>): Job | null {
    const existingJob = this.jobs.get(id)
    if (!existingJob) return null

    const updatedJob: Job = {
      ...existingJob,
      ...jobData,
      id: existingJob.id,
      createdAt: existingJob.createdAt,
    }

    this.jobs.set(id, updatedJob)

    // Reschedule if schedule changed
    if (jobData.schedule && jobData.schedule !== existingJob.schedule) {
      this.unscheduleJob(id)
      this.scheduleJob(updatedJob)
    }

    return updatedJob
  }

  public deleteJob(id: string): boolean {
    const job = this.jobs.get(id)
    if (!job) return false

    this.unscheduleJob(id)
    this.jobs.delete(id)
    this.jobHistory.delete(id)

    return true
  }

  public getJob(id: string): Job | null {
    return this.jobs.get(id) || null
  }

  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values())
  }

  public toggleJob(id: string, status: string): Job | null {
    const job = this.jobs.get(id)
    if (!job) return null

    job.status = status as Job["status"]

    if (status === "active") {
      this.scheduleJob(job)
    } else {
      this.unscheduleJob(id)
    }

    return job
  }

  public runJobNow(id: string): boolean {
    const job = this.jobs.get(id)
    if (!job || job.status === "running") return false

    this.queueJobForExecution(job)
    return true
  }

  public getJobHistory(id: string): JobExecution[] {
    return this.jobHistory.get(id) || []
  }

  public getSystemStats() {
    const jobs = Array.from(this.jobs.values())
    return {
      totalJobs: jobs.length,
      runningJobs: jobs.filter((j) => j.status === "running").length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      failedJobs: jobs.filter((j) => j.status === "failed").length,
      activeWorkers: this.workerManager.getActiveWorkerCount(),
    }
  }

  public getSystemMetrics() {
    const allHistory = Array.from(this.jobHistory.values()).flat()
    const completedExecutions = allHistory.filter((e) => e.status === "completed")
    const totalExecutions = allHistory.length

    return {
      uptime: Math.floor((Date.now() - this.getStartTime()) / 1000),
      totalExecutions,
      successRate: totalExecutions > 0 ? Math.round((completedExecutions.length / totalExecutions) * 100) : 0,
      avgExecutionTime:
        completedExecutions.length > 0
          ? Math.round(completedExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / completedExecutions.length)
          : 0,
    }
  }

  private scheduleJob(job: Job) {
    if (job.status !== "active") return

    try {
      const cronJob = new CronJob(job.schedule, () => {
        this.queueJobForExecution(job)
      })

      this.cronJobs.set(job.id, cronJob)
      job.nextRun = cronJob.getNextRunTime()
    } catch (error) {
      console.error(`Failed to schedule job ${job.name}:`, error)
    }
  }

  private unscheduleJob(id: string) {
    const cronJob = this.cronJobs.get(id)
    if (cronJob) {
      cronJob.stop()
      this.cronJobs.delete(id)
    }
  }

  private queueJobForExecution(job: Job) {
    // Check dependencies
    if (!this.areDependenciesMet(job)) {
      console.log(`Dependencies not met for job ${job.name}`)
      return
    }

    this.executionQueue.push(job)
    this.processQueue()
  }

  private areDependenciesMet(job: Job): boolean {
    for (const depName of job.dependencies) {
      const depJob = Array.from(this.jobs.values()).find((j) => j.name === depName)
      if (!depJob || depJob.status !== "completed") {
        return false
      }
    }
    return true
  }

  private async processQueue() {
    if (this.isProcessing || this.executionQueue.length === 0) return

    this.isProcessing = true

    while (this.executionQueue.length > 0) {
      // Sort by priority
      this.executionQueue.sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      const job = this.executionQueue.shift()!
      const worker = this.workerManager.getAvailableWorker()

      if (worker) {
        await this.executeJob(job, worker)
      } else {
        // No available workers, put job back in queue
        this.executionQueue.unshift(job)
        break
      }
    }

    this.isProcessing = false
  }

  private async executeJob(job: Job, worker: any) {
    const execution: JobExecution = {
      id: this.generateId(),
      jobId: job.id,
      status: "running",
      startTime: new Date(),
      workerId: worker.id,
    }

    job.status = "running"
    job.lastRun = new Date()

    const history = this.jobHistory.get(job.id) || []
    history.push(execution)
    this.jobHistory.set(job.id, history)

    try {
      // Simulate job execution
      await this.simulateJobExecution(job, worker)

      execution.status = "completed"
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      job.status = "completed"
      job.retryCount = 0

      console.log(`Job ${job.name} completed successfully`)
    } catch (error) {
      execution.status = "failed"
      execution.endTime = new Date()
      execution.error = error instanceof Error ? error.message : "Unknown error"

      job.retryCount++

      if (job.retryCount < job.maxRetries) {
        job.status = "active"
        // Retry after delay
        setTimeout(() => {
          this.queueJobForExecution(job)
        }, 5000 * job.retryCount) // Exponential backoff
      } else {
        job.status = "failed"
      }

      console.error(`Job ${job.name} failed:`, error)
    } finally {
      this.workerManager.releaseWorker(worker.id)
    }
  }

  private async simulateJobExecution(job: Job, worker: any): Promise<void> {
    // Simulate different execution times and occasional failures
    const executionTime = Math.random() * 3000 + 1000 // 1-4 seconds

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% chance of failure for demonstration
        if (Math.random() < 0.1) {
          reject(new Error(`Simulated failure for job ${job.name}`))
        } else {
          console.log(`Executing command: ${job.command}`)
          resolve()
        }
      }, executionTime)
    })
  }

  private startScheduler() {
    // Process queue every 5 seconds
    setInterval(() => {
      this.processQueue()
    }, 5000)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private getStartTime(): number {
    // Return a fixed start time for demo purposes
    return Date.now() - 3600 * 1000 // 1 hour ago
  }
}
