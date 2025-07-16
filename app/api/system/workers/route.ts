import { NextResponse } from "next/server"
import { WorkerManager } from "@/lib/worker-manager"

const workerManager = WorkerManager.getInstance()

export async function GET() {
  try {
    const workers = workerManager.getWorkers()
    return NextResponse.json(workers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 })
  }
}
