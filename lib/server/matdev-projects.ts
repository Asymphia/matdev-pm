import { matdevFetch } from "@/lib/matdev-http"
import {
    mapApiProjectToProjectType,
    mapApiTaskToTaskType,
    type ApiGetProjectDTO,
    type ApiGetProjectTaskListItemDTO,
    type ApiResponseModel,
} from "@/lib/matdev-project-map"
import type { ProjectType, TaskType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"

function mapLookupList(raw: unknown): { id: number; name: string }[] {
    if (!Array.isArray(raw)) return []
    return raw
        .map(row => {
            if (!row || typeof row !== "object") return null
            const o = row as { id?: number; name?: string }
            if (typeof o.id !== "number" || typeof o.name !== "string") return null
            return { id: o.id, name: o.name }
        })
        .filter((x): x is { id: number; name: string } => x != null)
}

/** Fetch project create/edit lookups from individual endpoints that actually exist. */
export async function fetchProjectCreateLookups(projectId?: number): Promise<{ lookups: ProjectCreateLookups | null; error: string | null }> {
    try {
        // Fetch issuetypes, topics, workpackages and users in parallel — all have standalone GET endpoints
        const [issueRes, topicRes, workpackageRes, userRes] = await Promise.all([
            matdevFetch("/api/issuetype"),
            matdevFetch("/api/topic"),
            matdevFetch("/api/workpackage"),
            matdevFetch("/api/user"),
        ])

        type NamedApiItem = { issueTypeId?: number; topicId?: number; workpackageId?: number; id?: number; name: string }
        type UserApiItem = { userId: number; firstName?: string; lastName?: string }

        const issueJson = issueRes.ok ? ((await issueRes.json()) as ApiResponseModel<NamedApiItem[]>) : { data: [] }
        const topicJson = topicRes.ok ? ((await topicRes.json()) as ApiResponseModel<NamedApiItem[]>) : { data: [] }
        const wpJson = workpackageRes.ok ? ((await workpackageRes.json()) as ApiResponseModel<NamedApiItem[]>) : { data: [] }
        const userJson = userRes.ok ? ((await userRes.json()) as ApiResponseModel<UserApiItem[]>) : { data: [] }

        // Statuses and priorities — try the task-list create-form from a specific or any project
        let statuses: ProjectCreateLookups["statuses"] = []
        let priorities: ProjectCreateLookups["priorities"] = []

        const formProjectId = projectId ?? await getFirstProjectId()
        if (formProjectId) {
            const formRes = await matdevFetch(`/api/project/${formProjectId}/task-list/create-form`)
            if (formRes.ok) {
                const formJson = (await formRes.json()) as ApiResponseModel<{ statuses?: { id: number; name: string }[]; priorities?: { id: number; name: string }[] }>
                statuses = mapLookupList(formJson.data?.statuses)
                priorities = mapLookupList(formJson.data?.priorities)
            }
        }

        const lookups: ProjectCreateLookups = {
            issueTypes: (issueJson.data ?? []).map(i => ({ id: (i as { issueTypeId: number }).issueTypeId, name: i.name })).filter(x => x.id),
            topics: (topicJson.data ?? []).map(t => ({ id: (t as { topicId: number }).topicId, name: t.name })).filter(x => x.id),
            workpackages: (wpJson.data ?? []).map(w => ({ id: (w as { workpackageId: number }).workpackageId, name: w.name })).filter(x => x.id),
            statuses,
            priorities,
            users: (userJson.data ?? []).map(u => ({
                id: u.userId,
                firstName: u.firstName ?? "",
                lastName: u.lastName ?? "",
                displayName: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
            })),
        }
        return { lookups, error: null }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { lookups: null, error: message }
    }
}

async function getFirstProjectId(): Promise<number | null> {
    try {
        const res = await matdevFetch("/api/project")
        if (!res.ok) return null
        const json = (await res.json()) as ApiResponseModel<Array<{ projectId: number }>>
        const first = json.data?.[0]
        return first?.projectId ?? null
    } catch {
        return null
    }
}

export async function fetchMatdevProjects(): Promise<{ projects: ProjectType[]; error: string | null }> {
    try {
        const res = await matdevFetch("/api/project")
        if (!res.ok) {
            return { projects: [], error: `Projekty: HTTP ${res.status}` }
        }
        const json = (await res.json()) as ApiResponseModel<ApiGetProjectDTO[]>
        const data = json.data
        if (!Array.isArray(data)) {
            return { projects: [], error: "Projekty: niepoprawna odpowiedź API" }
        }
        return { projects: data.map(mapApiProjectToProjectType), error: null }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { projects: [], error: message }
    }
}

export async function fetchMatdevProjectById(id: number): Promise<{ project: ProjectType | null; error: string | null }> {
    try {
        const res = await matdevFetch(`/api/project/id/${id}`)
        if (res.status === 404) {
            return { project: null, error: null }
        }
        if (!res.ok) {
            return { project: null, error: `Projekt: HTTP ${res.status}` }
        }
        const json = (await res.json()) as ApiResponseModel<ApiGetProjectDTO>
        const data = json.data
        if (!data || typeof data !== "object" || !("projectId" in data)) {
            return { project: null, error: "Projekt: niepoprawna odpowiedź API" }
        }
        return { project: mapApiProjectToProjectType(data), error: null }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { project: null, error: message }
    }
}

export async function fetchMatdevTasksForProject(projectId: number): Promise<{ tasks: TaskType[]; error: string | null }> {
    try {
        const pageSize = 100
        const allItems: ApiGetProjectTaskListItemDTO[] = []
        let totalCount = 0
        let page = 1

        do {
            const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
            const res = await matdevFetch(`/api/project/${projectId}/task-list?${qs}`)
            if (!res.ok) {
                return { tasks: [], error: `Zadania: HTTP ${res.status}` }
            }
            const json = (await res.json()) as ApiResponseModel<{
                items: ApiGetProjectTaskListItemDTO[]
                totalCount: number
                page: number
                pageSize: number
            }>
            const items = json.data?.items
            if (!Array.isArray(items)) {
                return { tasks: [], error: "Zadania: niepoprawna odpowiedź API" }
            }
            totalCount = json.data?.totalCount ?? items.length
            allItems.push(...items)
            page++
        } while (allItems.length < totalCount)

        return { tasks: allItems.map(t => mapApiTaskToTaskType(projectId, t)), error: null }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { tasks: [], error: message }
    }
}

export type ProjectAssignedUser = {
    id: number
    firstName: string
    secondName: string
    email: string
    phone: string
    isResponsible: boolean
}

export async function fetchMatdevAssignedUsers(projectId: number): Promise<{ users: ProjectAssignedUser[]; error: string | null }> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/view`)
        if (!res.ok) {
            return { users: [], error: `Użytkownicy projektu: HTTP ${res.status}` }
        }
        const json = (await res.json()) as ApiResponseModel<{
            assignedUsers?: Array<{
                userId: number
                firstName: string
                lastName: string
                isResponsible: boolean
                email?: string | null
                phoneNumber?: string | null
            }>
        }>
        const assignedUsers = json.data?.assignedUsers
        if (!Array.isArray(assignedUsers)) {
            return { users: [], error: "Użytkownicy projektu: niepoprawna odpowiedź API" }
        }
        return {
            users: assignedUsers.map(u => ({
                id: u.userId,
                firstName: u.firstName ?? "",
                secondName: u.lastName ?? "",
                email: u.email ?? "",
                phone: u.phoneNumber ?? "",
                isResponsible: Boolean(u.isResponsible),
            })),
            error: null,
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { users: [], error: message }
    }
}
