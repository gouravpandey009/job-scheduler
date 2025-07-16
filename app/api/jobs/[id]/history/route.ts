import { type NextRequest, NextResponse } from "next/server"
import { JobScheduler } from "@/lib/job-scheduler"

const scheduler = JobScheduler.getInstance()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const history = scheduler.getJobHistory(params.id)
    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job history" }, { status: 500 })
  }
}
