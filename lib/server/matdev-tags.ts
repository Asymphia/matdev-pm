import { matdevFetch } from "@/lib/matdev-http"

type ApiResponseModel<T> = {
    data?: T
    message?: string | null
}

export type NamedItem = { id: number; name: string }

type ApiIssueType = { issueTypeId: number; name: string }
type ApiTopic = { topicId: number; name: string }
type ApiWorkpackage = { workpackageId: number; name: string }
type ApiTaskCategory = { taskCategoryId: number; name: string }

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

export async function fetchTaskCategories(): Promise<{ categories: NamedItem[]; error: string | null }> {
    try {
        const res = await matdevFetch("/api/taskcategory")
        if (!res.ok) return { categories: [], error: `HTTP ${res.status}` }
        const json = (await res.json()) as ApiResponseModel<ApiTaskCategory[]>
        return {
            categories: (json.data ?? []).map(c => ({ id: c.taskCategoryId, name: c.name })),
            error: null,
        }
    } catch (e) {
        return { categories: [], error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function fetchAssignableUsersForProject(projectId: number): Promise<{ users: { id: number; firstName: string; lastName: string }[]; error: string | null }> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/view/assignable-users`)
        if (!res.ok) return { users: [], error: `HTTP ${res.status}` }
        const json = (await res.json()) as ApiResponseModel<Array<{ userId: number; firstName: string; lastName: string }>>
        return {
            users: (json.data ?? []).map(u => ({ id: u.userId, firstName: u.firstName ?? "", lastName: u.lastName ?? "" })),
            error: null,
        }
    } catch (e) {
        return { users: [], error: e instanceof Error ? e.message : "Unknown error" }
    }
}
