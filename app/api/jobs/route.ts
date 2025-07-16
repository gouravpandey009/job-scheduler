import { type NextRequest, NextResponse } from "next/server"
import { JobScheduler } from "@/lib/job-scheduler"

const scheduler = JobScheduler.getInstance()

export async function GET() {
  try {
    const jobs = scheduler.getAllJobs()
    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()
    const job = scheduler.createJob(jobData)
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
