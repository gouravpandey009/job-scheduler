export class CronJob {
  private schedule: string
  private callback: () => void
  private intervalId?: NodeJS.Timeout
  private isRunning = false

  constructor(schedule: string, callback: () => void) {
    this.schedule = schedule
    this.callback = callback
    this.start()
  }

  public start() {
    if (this.isRunning) return

    this.isRunning = true
    const interval = this.parseSchedule(this.schedule)

    if (interval > 0) {
      this.intervalId = setInterval(() => {
        this.callback()
      }, interval)
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.isRunning = false
  }

  public getNextRunTime(): Date {
    const interval = this.parseSchedule(this.schedule)
    return new Date(Date.now() + interval)
  }

  private parseSchedule(schedule: string): number {
    // Simple cron parser - in production, use a proper cron library
    // This is a simplified version for demonstration

    // Handle some common patterns
    if (schedule === "*/5 * * * *") return 5 * 60 * 1000 // Every 5 minutes
    if (schedule === "0 * * * *") return 60 * 60 * 1000 // Every hour
    if (schedule === "0 0 * * *") return 24 * 60 * 60 * 1000 // Daily
    if (schedule === "0 0 * * 0") return 7 * 24 * 60 * 60 * 1000 // Weekly

    // Default to 10 minutes for unknown patterns
    return 10 * 60 * 1000
  }
}
