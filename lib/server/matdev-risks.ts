import { matdevFetch } from "@/lib/matdev-http"

export type ProjectRisk = {
    riskId: number
    severity: "Low" | "Medium" | "High"
    description: string
    isResolved: boolean
    createdAt: string
    isAutomatic: boolean
}

export async function fetchProjectRisks(projectId: number): Promise<ProjectRisk[]> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/risks`, { cache: "no-store" })
        if (!res.ok) return []
        const json = await res.json()
        return (json.data ?? []) as ProjectRisk[]
    } catch {
        return []
    }
}
