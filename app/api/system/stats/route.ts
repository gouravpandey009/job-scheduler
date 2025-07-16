import { NextResponse } from "next/server"
import { JobScheduler } from "@/lib/job-scheduler"

const scheduler = JobScheduler.getInstance()

export async function GET() {
  try {
    const stats = scheduler.getSystemStats()
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch system stats" }, { status: 500 })
  }
}
