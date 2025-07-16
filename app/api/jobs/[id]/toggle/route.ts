import { type NextRequest, NextResponse } from "next/server"
import { JobScheduler } from "@/lib/job-scheduler"

const scheduler = JobScheduler.getInstance()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const job = scheduler.toggleJob(params.id, status)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }
    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle job" }, { status: 500 })
  }
}
