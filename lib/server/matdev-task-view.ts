import { matdevFetch } from "@/lib/matdev-http"
import type { ApiResponseModel } from "@/lib/matdev-project-map"

export type TaskViewTopbar = {
    taskId: number
    taskName: string
    taskCategory: string | null
    taskCategoryId: number | null
    taskDescription: string | null
    statusName: string
    statusId: number
    taskDeadline: string | null
    requesterName: string | null
    taskPriority: string
    priorityId: number
    taskProgress: number
    isMilestone: boolean
    estimatedCost: number | null
}

export type TaskViewCosts = {
    estimatedCost: number | null
    taskSpent: number
    expenditures: {
        expenditureId: number
        categoryName: string
        amount: number
        transactionDate: string
        description: string
    }[]
}

export type TaskViewSubtask = {
    subtaskId: number
    subtaskName: string
    subtaskStatus: string
    subtaskStatusId: number
    subtaskPriority: string
    priorityId: number
    subtaskStartDate: string | null
    subtaskEndDate: string | null
    sortOrder: number | null
    taskCategoryId: number | null
    taskCategoryName: string | null
}

export type TaskViewAssignedUser = {
    userId: number
    firstName: string
    lastName: string
}

export type TaskViewData = {
    topbar: TaskViewTopbar
    subtasks: TaskViewSubtask[]
    assignments: TaskViewAssignedUser[]
    costs: TaskViewCosts
}

type ApiTaskViewTopbar = {
    taskId?: number
    taskName?: string
    taskCategory?: string | null
    taskCategoryId?: number | null
    taskDescription?: string | null
    statusName?: string
    statusId?: number | null
    taskDeadline?: string | null
    requesterFirstName?: string | null
    requesterLastName?: string | null
    taskPriority?: string
    priorityId?: number | null
    taskProgress?: number
    isMilestone?: boolean
    estimatedCost?: number | null
}

type ApiTaskViewCosts = {
    estimatedCost?: number | null
    taskSpent?: number
    expenditures?: {
        expenditureId?: number
        categoryName?: string
        amount?: number
        transactionDate?: string
        description?: string
    }[]
}

type ApiTaskViewSubtask = {
    subtaskId?: number
    subtaskName?: string
    subtaskStatus?: string
    subtaskPriority?: string
    subtaskStatusId?: number | null
    priorityId?: number | null
    subtaskStartDate?: string | null
    subtaskEndDate?: string | null
    sortOrder?: number | null
    taskCategoryId?: number | null
    taskCategoryName?: string | null
}

type ApiTaskViewAssignedUser = {
    userId?: number
    firstName?: string
    lastName?: string
}

type ApiTaskViewData = {
    topbar?: ApiTaskViewTopbar
    subtasks?: ApiTaskViewSubtask[]
    assignments?: ApiTaskViewAssignedUser[]
    costs?: ApiTaskViewCosts
}

export async function fetchTaskView(
    projectId: number,
    taskId: number,
): Promise<{ data: TaskViewData | null; error: string | null }> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/task/${taskId}/view`)
        if (res.status === 404) return { data: null, error: null }
        if (!res.ok) return { data: null, error: `HTTP ${res.status}` }

        const json = (await res.json()) as ApiResponseModel<ApiTaskViewData>
        const raw = json.data
        if (!raw || !raw.topbar) return { data: null, error: "Empty task view response" }

        const t = raw.topbar

        const requesterName =
            t.requesterFirstName || t.requesterLastName
                ? [t.requesterFirstName, t.requesterLastName].filter(Boolean).join(" ")
                : null

        return {
            data: {
                topbar: {
                    taskId: t.taskId ?? taskId,
                    taskName: t.taskName ?? "",
                    taskCategory: t.taskCategory ?? null,
                    taskCategoryId: t.taskCategoryId ?? null,
                    taskDescription: t.taskDescription ?? null,
                    statusName: t.statusName ?? "",
                    statusId: t.statusId ?? 0,
                    taskDeadline: t.taskDeadline ?? null,
                    requesterName,
                    taskPriority: t.taskPriority ?? "",
                    priorityId: t.priorityId ?? 0,
                    taskProgress: Number(t.taskProgress ?? 0),
                    isMilestone: Boolean(t.isMilestone),
                    estimatedCost: t.estimatedCost != null ? Number(t.estimatedCost) : null,
                },
                costs: {
                    estimatedCost: raw.costs?.estimatedCost != null ? Number(raw.costs.estimatedCost) : t.estimatedCost != null ? Number(t.estimatedCost) : null,
                    taskSpent: Number(raw.costs?.taskSpent ?? 0),
                    expenditures: (raw.costs?.expenditures ?? []).map(e => ({
                        expenditureId: e.expenditureId ?? 0,
                        categoryName: e.categoryName ?? "",
                        amount: Number(e.amount ?? 0),
                        transactionDate: e.transactionDate ?? "",
                        description: e.description ?? "",
                    })),
                },
                subtasks: (raw.subtasks ?? []).map(s => ({
                    subtaskId: s.subtaskId ?? 0,
                    subtaskName: s.subtaskName ?? "",
                    subtaskStatus: s.subtaskStatus ?? "",
                    subtaskStatusId: s.subtaskStatusId ?? 0,
                    subtaskPriority: s.subtaskPriority ?? "",
                    priorityId: s.priorityId ?? 0,
                    subtaskStartDate: s.subtaskStartDate ?? null,
                    subtaskEndDate: s.subtaskEndDate ?? null,
                    sortOrder: s.sortOrder ?? null,
                    taskCategoryId: s.taskCategoryId ?? null,
                    taskCategoryName: s.taskCategoryName ?? null,
                })),
                assignments: (raw.assignments ?? []).map(a => ({
                    userId: a.userId ?? 0,
                    firstName: a.firstName ?? "",
                    lastName: a.lastName ?? "",
                })),
            },
            error: null,
        }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
