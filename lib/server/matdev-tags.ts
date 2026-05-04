import { matdevFetch } from "@/lib/matdev-http"

type ApiResponseModel<T> = {
    data?: T
    message?: string | null
}

type NamedItem = { id: number; name: string }

type ApiIssueType = { issueTypeId: number; name: string }
type ApiTopic = { topicId: number; name: string }
type ApiWorkpackage = { workpackageId: number; name: string }

export type TagCollections = {
    issues: NamedItem[]
    topics: NamedItem[]
    workpackages: NamedItem[]
}

export async function fetchTagCollections(): Promise<{ data: TagCollections; error: string | null }> {
    try {
        const [issuesRes, topicsRes, workpackagesRes] = await Promise.all([
            matdevFetch("/api/issuetype"),
            matdevFetch("/api/topic"),
            matdevFetch("/api/workpackage"),
        ])

        if (!issuesRes.ok || !topicsRes.ok || !workpackagesRes.ok) {
            return {
                data: { issues: [], topics: [], workpackages: [] },
                error: `HTTP ${issuesRes.status}/${topicsRes.status}/${workpackagesRes.status}`,
            }
        }

        const [issuesJson, topicsJson, workpackagesJson] = (await Promise.all([
            issuesRes.json(),
            topicsRes.json(),
            workpackagesRes.json(),
        ])) as [ApiResponseModel<ApiIssueType[]>, ApiResponseModel<ApiTopic[]>, ApiResponseModel<ApiWorkpackage[]>]

        return {
            data: {
                issues: (issuesJson.data ?? []).map(i => ({ id: i.issueTypeId, name: i.name })),
                topics: (topicsJson.data ?? []).map(t => ({ id: t.topicId, name: t.name })),
                workpackages: (workpackagesJson.data ?? []).map(w => ({ id: w.workpackageId, name: w.name })),
            },
            error: null,
        }
    } catch (e) {
        return {
            data: { issues: [], topics: [], workpackages: [] },
            error: e instanceof Error ? e.message : "Unknown error",
        }
    }
}
