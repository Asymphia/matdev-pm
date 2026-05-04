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

function mapUserList(raw: unknown): ProjectCreateLookups["users"] {
    if (!Array.isArray(raw)) return []
    return raw
        .map(row => {
            if (!row || typeof row !== "object") return null
            const o = row as { id?: number; firstName?: string; lastName?: string; displayName?: string }
            if (typeof o.id !== "number") return null
            return {
                id: o.id,
                firstName: o.firstName ?? "",
                lastName: o.lastName ?? "",
                displayName: o.displayName ?? `${o.firstName ?? ""} ${o.lastName ?? ""}`.trim(),
            }
        })
        .filter((x): x is NonNullable<typeof x> => x != null)
}

export async function fetchProjectCreateLookups(): Promise<{ lookups: ProjectCreateLookups | null; error: string | null }> {
    try {
        const res = await matdevFetch("/api/project/lookups/for-create")
        if (!res.ok) {
            return { lookups: null, error: `Słowniki: HTTP ${res.status}` }
        }
        const json = (await res.json()) as ApiResponseModel<Record<string, unknown>>
        const d = json.data
        if (!d || typeof d !== "object") {
            return { lookups: null, error: "Słowniki: pusta odpowiedź" }
        }
        const lookups: ProjectCreateLookups = {
            issueTypes: mapLookupList(d.issueTypes),
            topics: mapLookupList(d.topics),
            workpackages: mapLookupList(d.workpackages),
            statuses: mapLookupList(d.statuses),
            priorities: mapLookupList(d.priorities),
            users: mapUserList(d.users),
        }
        return { lookups, error: null }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { lookups: null, error: message }
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
        const qs = new URLSearchParams({ page: "1", pageSize: "500" })
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
        return { tasks: items.map(t => mapApiTaskToTaskType(projectId, t)), error: null }
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
