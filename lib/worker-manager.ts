export interface Worker {
  id: string
  name: string
  host: string
  status: "active" | "busy" | "offline"
  cpuUsage: number
  memoryUsage: number
  activeJobs: number
  maxJobs: number
}

export class WorkerManager {
  private static instance: WorkerManager
  private workers: Map<string, Worker> = new Map()

  private constructor() {
    this.initializeWorkers()
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager()
    }
    return WorkerManager.instance
  }

  public getWorkers(): Worker[] {
    return Array.from(this.workers.values())
  }

  public getAvailableWorker(): Worker | null {
    const availableWorkers = Array.from(this.workers.values())
      .filter((w) => w.status === "active" && w.activeJobs < w.maxJobs)
      .sort((a, b) => a.activeJobs - b.activeJobs)

    if (availableWorkers.length > 0) {
      const worker = availableWorkers[0]
      worker.activeJobs++
      worker.status = worker.activeJobs >= worker.maxJobs ? "busy" : "active"
      return worker
    }

    return null
  }

  public releaseWorker(workerId: string) {
    const worker = this.workers.get(workerId)
    if (worker && worker.activeJobs > 0) {
      worker.activeJobs--
      worker.status = worker.activeJobs === 0 ? "active" : "busy"
    }
  }

  public getActiveWorkerCount(): number {
    return Array.from(this.workers.values()).filter((w) => w.status !== "offline").length
  }

  private initializeWorkers() {
    // Initialize with some mock workers
    const mockWorkers: Worker[] = [
      {
        id: "worker-1",
        name: "Worker Node 1",
        host: "192.168.1.10",
        status: "active",
        cpuUsage: Math.floor(Math.random() * 50) + 20,
        memoryUsage: Math.floor(Math.random() * 40) + 30,
        activeJobs: 0,
        maxJobs: 5,
      },
      {
        id: "worker-2",
        name: "Worker Node 2",
        host: "192.168.1.11",
        status: "active",
        cpuUsage: Math.floor(Math.random() * 60) + 30,
        memoryUsage: Math.floor(Math.random() * 50) + 25,
        activeJobs: 0,
        maxJobs: 3,
      },
      {
        id: "worker-3",
        name: "Worker Node 3",
        host: "192.168.1.12",
        status: "active",
        cpuUsage: Math.floor(Math.random() * 40) + 15,
        memoryUsage: Math.floor(Math.random() * 35) + 20,
        activeJobs: 0,
        maxJobs: 4,
      },
    ]

    mockWorkers.forEach((worker) => {
      this.workers.set(worker.id, worker)
    })

    // Simulate worker metrics updates
    setInterval(() => {
      this.updateWorkerMetrics()
    }, 10000)
  }

  private updateWorkerMetrics() {
    this.workers.forEach((worker) => {
      // Simulate changing metrics
      worker.cpuUsage = Math.max(10, Math.min(95, worker.cpuUsage + (Math.random() - 0.5) * 20))
      worker.memoryUsage = Math.max(15, Math.min(90, worker.memoryUsage + (Math.random() - 0.5) * 15))
    })
  }
}
