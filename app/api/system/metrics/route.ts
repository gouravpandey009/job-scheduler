import { NextResponse } from "next/server"
import { JobScheduler } from "@/lib/job-scheduler"

const scheduler = JobScheduler.getInstance()

export async function GET() {
  try {
    const metrics = scheduler.getSystemMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch system metrics" }, { status: 500 })
  }
}
