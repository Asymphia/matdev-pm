"use server"

import { matdevFetch } from "@/lib/matdev-http"
import type { ApiResponseModel } from "@/lib/matdev-project-map"

type TaskCreateFormLookup = { id: number; name: string }
type TaskCreateFormUser = { userId: number; firstName: string; lastName: string }
type TaskCreateFormData = {
    users?: TaskCreateFormUser[]
    statuses?: TaskCreateFormLookup[]
    priorities?: TaskCreateFormLookup[]
    taskCategories?: TaskCreateFormLookup[]
}

export type CreateTaskQuickResult = { ok: true } | { ok: false; error: string }
export type TaskCreateLookups = {
    users: TaskCreateFormUser[]
    statuses: TaskCreateFormLookup[]
    priorities: TaskCreateFormLookup[]
    taskCategories: TaskCreateFormLookup[]
}
export type CreateTaskBody = {
    name: string
    description: string
    statusId?: number | null
    priorityId?: number | null
    isMilestone?: boolean
    requesterId?: number | null
    assignedUserIds?: number[]
    startDate?: string
    endDate?: string | null
    taskCategoryId?: number | null
    parentTaskId?: number | null
}

function pickIdByNameOrFirst(list: TaskCreateFormLookup[] | undefined, contains: string): number | null {
    if (!Array.isArray(list) || list.length === 0) return null
    const preferred = list.find(x => x.name.toLowerCase().includes(contains))
    return (preferred ?? list[0]).id
}

export async function createMatdevTask(projectId: number, body: CreateTaskBody): Promise<CreateTaskQuickResult> {
    try {
        const lookups = await fetchMatdevTaskCreateForm(projectId)
        if (!lookups.ok) return { ok: false, error: lookups.error }
        const formJson = { data: lookups.data }
        const statusId = pickIdByNameOrFirst(formJson.data?.statuses, "to do")
        const priorityId = pickIdByNameOrFirst(formJson.data?.priorities, "medium")

        if ((!body.statusId && !statusId) || (!body.priorityId && !priorityId)) {
            return { ok: false, error: "Brak statusu lub priorytetu w słownikach API." }
        }

        const nowIso = new Date().toISOString()
        const payload = {
            name: body.name.trim(),
            statusId: body.statusId ?? statusId!,
            priorityId: body.priorityId ?? priorityId!,
            isMilestone: body.isMilestone ?? false,
            requesterId: body.requesterId ?? null,
            assignedUserIds: body.assignedUserIds ?? [],
            startDate: body.startDate ?? nowIso,
            endDate: body.endDate ?? null,
            taskDescription: body.description.trim(),
            taskCategoryId: body.taskCategoryId ?? null,
            parentTaskId: body.parentTaskId ?? null,
        }

        const createRes = await matdevFetch(`/api/project/${projectId}/task-list`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (createRes.status === 201) {
            return { ok: true }
        }

        let message = `HTTP ${createRes.status}`
        try {
            const j = (await createRes.json()) as { message?: string; errors?: Record<string, string[]> }
            if (j.message) message = j.message
            if (j.errors && typeof j.errors === "object") {
                const parts = Object.entries(j.errors).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}: ${x}`) : []))
                if (parts.length) message = parts.join("; ")
            }
        } catch {
            // keep fallback
        }
        return { ok: false, error: message }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function fetchMatdevTaskCreateForm(projectId: number): Promise<{ ok: true; data: TaskCreateLookups } | { ok: false; error: string }> {
    try {
        const formRes = await matdevFetch(`/api/project/${projectId}/task-list/create-form`)
        if (!formRes.ok) {
            return { ok: false, error: `Create form HTTP ${formRes.status}` }
        }
        const formJson = (await formRes.json()) as ApiResponseModel<TaskCreateFormData>
        return {
            ok: true,
            data: {
                users: Array.isArray(formJson.data?.users) ? formJson.data.users : [],
                statuses: Array.isArray(formJson.data?.statuses) ? formJson.data.statuses : [],
                priorities: Array.isArray(formJson.data?.priorities) ? formJson.data.priorities : [],
                taskCategories: Array.isArray(formJson.data?.taskCategories) ? formJson.data.taskCategories : [],
            },
        }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function createMatdevTaskQuick(projectId: number): Promise<CreateTaskQuickResult> {
    const now = new Date()
    return createMatdevTask(projectId, {
        name: `Nowe zadanie ${now.toLocaleTimeString("pl-PL")}`,
        description: "Utworzone z szybkiego przycisku +",
    })
}
