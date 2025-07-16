import { type NextRequest, NextResponse } from "next/server"
import { JobScheduler } from "@/lib/job-scheduler"

const scheduler = JobScheduler.getInstance()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = scheduler.runJobNow(params.id)
    if (!success) {
      return NextResponse.json({ error: "Job not found or cannot be run" }, { status: 404 })
    }
    return NextResponse.json({ message: "Job queued for execution" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to run job" }, { status: 500 })
  }
}
