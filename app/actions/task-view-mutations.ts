"use server"

import { matdevFetch } from "@/lib/matdev-http"
import type { ApiResponseModel } from "@/lib/matdev-project-map"

export type TaskViewMutationResult = { ok: true } | { ok: false; error: string }

/** Backend task DateTime fields require UTC ISO strings (Npgsql timestamptz). */
function toIsoDatetime(date: string | null | undefined): string | null {
    if (!date) return null
    if (date.includes("T")) return date
    return `${date}T00:00:00Z`
}

async function parseError(res: Response): Promise<string> {
    let message = `HTTP ${res.status}`
    try {
        const j = (await res.json()) as { message?: string; errors?: Record<string, string[]> }
        if (j.message) message = j.message
        if (j.errors && typeof j.errors === "object") {
            const parts = Object.entries(j.errors).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}: ${x}`) : []))
            if (parts.length) message = parts.join("; ")
        }
    } catch {
        // keep default
    }
    return message
}

export async function changeTaskViewStatus(projectId: number, taskId: number, taskStatusId: number): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskStatusId }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function changeTaskViewDeadline(projectId: number, taskId: number, endDate: string): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/deadline`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endDate: toIsoDatetime(endDate) }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function changeTaskViewPriority(projectId: number, taskId: number, taskPriorityId: number): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/priority`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskPriorityId }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export type CreateSubtaskBody = {
    name: string
    statusId: number
    priorityId: number
    isMilestone: boolean
    startDate: string
    endDate?: string | null
    taskDescription: string
    taskCategoryId?: number | null
}

export async function createSubtask(projectId: number, taskId: number, body: CreateSubtaskBody): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/subtasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...body,
                startDate: toIsoDatetime(body.startDate) ?? body.startDate,
                endDate: toIsoDatetime(body.endDate) ?? undefined,
            }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteSubtask(projectId: number, taskId: number, subtaskId: number): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/subtasks/${subtaskId}`, { method: "DELETE" })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function changeSubtaskStatus(projectId: number, taskId: number, subtaskId: number, statusId: number): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/subtasks/${subtaskId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statusId }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function changeSubtaskStartDate(projectId: number, taskId: number, subtaskId: number, startDate: string): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/subtasks/${subtaskId}/start-date`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startDate: toIsoDatetime(startDate) }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function changeSubtaskEndDate(projectId: number, taskId: number, subtaskId: number, endDate: string): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/subtasks/${subtaskId}/end-date`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endDate: toIsoDatetime(endDate) }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function assignUserToTask(projectId: number, taskId: number, userId: number): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/assignments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function removeUserFromTask(projectId: number, taskId: number, userId: number): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/assignments/${userId}`, { method: "DELETE" })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export type TaskEditBody = {
    name?: string
    statusId?: number | null
    priorityId?: number | null
    isMilestone?: boolean
    requesterId?: number | null
    startDate?: string | null
    endDate?: string | null
    taskDescription?: string | null
    taskCategoryId?: number | null
    estimatedCost?: number
}

export async function editTask(projectId: number, taskId: number, body: TaskEditBody): Promise<TaskViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...body,
                startDate: toIsoDatetime(body.startDate),
                endDate: toIsoDatetime(body.endDate),
            }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export type TaskCreateFormLookup = { id: number; name: string }
export type TaskCreateFormUser = { userId: number; firstName: string; lastName: string }

export async function fetchTaskViewCreateSubtaskForm(projectId: number, taskId: number): Promise<{
    ok: true
    data: { statuses: TaskCreateFormLookup[]; priorities: TaskCreateFormLookup[]; taskCategories: TaskCreateFormLookup[] }
} | { ok: false; error: string }> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view/create-subtask-form`)
        if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
        const json = (await res.json()) as ApiResponseModel<{
            statuses?: TaskCreateFormLookup[]
            priorities?: TaskCreateFormLookup[]
            taskCategories?: TaskCreateFormLookup[]
        }>
        return {
            ok: true,
            data: {
                statuses: Array.isArray(json.data?.statuses) ? json.data.statuses : [],
                priorities: Array.isArray(json.data?.priorities) ? json.data.priorities : [],
                taskCategories: Array.isArray(json.data?.taskCategories) ? json.data.taskCategories : [],
            },
        }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
