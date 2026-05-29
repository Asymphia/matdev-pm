import type { ProjectPriority, ProjectStatus, ProjectType, TaskType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"

/** JSON shape from ASP.NET (camelCase). */
export type ApiGetProjectDTO = {
    projectId: number
    name: string
    description: string | null
    startDate?: string | null
    endDate?: string | null
    topicId?: number | null
    statusId?: number | null
    priorityId?: number | null
    issuetypeId?: number | null
    respPeronId?: number | null
    suppPersonId?: number | null
    workpackageId?: number | null
    topicName?: string | null
    workpackageName?: string | null
    issueTypeName?: string | null
    statusName?: string | null
    priorityName?: string | null
    responsibleDisplayName?: string | null
    supportDisplayName?: string | null
    budgetAmount?: number | null
    budgetSpent?: number | null
}

export type ApiResponseModel<T> = {
    status?: boolean
    message?: string | null
    data?: T
}

export type ApiGetProjectTaskListItemDTO = {
    taskId: number
    name: string
    status: string
    priority: string
    statusId?: number | null
    priorityId?: number | null
    isMilestone: boolean
    startDate: string
    endDate: string
    parentId?: number | null
    sortOrder: number
    progress: number
    taskCategoryId?: number | null
    taskCategoryName?: string | null
}

function mapProjectStatus(api?: string | null): ProjectStatus {
    const n = (api ?? "").toLowerCase()
    if (n.includes("in progress") || n.includes("progress")) return "In progress"
    if (n.includes("todo") || n.includes("to do")) return "To do"
    if (n.includes("open")) return "In progress"
    if (n.includes("closed") || n.includes("completed")) return "Completed"
    return "To do"
}

function mapProjectPriority(api?: string | null): ProjectPriority {
    const n = (api ?? "").toLowerCase()
    if (n.includes("high")) return "High"
    if (n.includes("low")) return "Low"
    return "Medium"
}

function mapTaskStatus(api: string): ProjectStatus {
    const n = api.toLowerCase()
    if (n.includes("progress")) return "In progress"
    if (n.includes("done") || n.includes("closed") || n.includes("completed")) return "Completed"
    return "To do"
}

function mapTaskPriority(api: string): ProjectPriority {
    const n = api.toLowerCase()
    if (n.includes("high")) return "High"
    if (n.includes("low")) return "Low"
    return "Medium"
}

export function mapApiProjectToProjectType(p: ApiGetProjectDTO): ProjectType {
    const people = [p.responsibleDisplayName, p.supportDisplayName].filter((x): x is string => Boolean(x?.trim()))
    return {
        id: p.projectId,
        projectName: p.name ?? "",
        description: p.description ?? "",
        issueType: p.issueTypeName?.trim() || "—",
        workpackage: p.workpackageName?.trim() || "—",
        topic: p.topicName?.trim() || "—",
        startDate: p.startDate ?? "",
        deadline: p.endDate ?? "",
        status: mapProjectStatus(p.statusName),
        priority: mapProjectPriority(p.priorityName),
        people: people.length ? people : ["—"],
        budget: p.budgetAmount ?? 0,
        amountSpent: p.budgetSpent ?? 0,
        topicId: p.topicId ?? null,
        statusId: p.statusId ?? null,
        priorityId: p.priorityId ?? null,
        issuetypeId: p.issuetypeId ?? null,
        respPeronId: p.respPeronId ?? null,
        suppPersonId: p.suppPersonId ?? null,
        workpackageId: p.workpackageId ?? null,
        rawStatusName: p.statusName ?? null,
    }
}

/**
 * Backend GetProjectDTO only returns IDs, not display names. This function
 * resolves names from the already-fetched lookups so the UI can show real values.
 */
export function enrichProjectWithLookups(project: ProjectType, lookups: ProjectCreateLookups | null): ProjectType {
    if (!lookups) return project
    const byId = <T extends { id: number; name: string }>(arr: T[], id: number | null | undefined) =>
        id != null ? arr.find(x => x.id === id)?.name ?? null : null

    const topicName = byId(lookups.topics, project.topicId)
    const issueTypeName = byId(lookups.issueTypes, project.issuetypeId)
    const workpackageName = byId(lookups.workpackages, project.workpackageId)
    const statusName = byId(lookups.statuses, project.statusId)
    const priorityName = byId(lookups.priorities, project.priorityId)

    const responsible = project.respPeronId != null
        ? lookups.users.find(u => u.id === project.respPeronId)?.displayName ?? null
        : null
    const support = project.suppPersonId != null
        ? lookups.users.find(u => u.id === project.suppPersonId)?.displayName ?? null
        : null
    const people = [responsible, support].filter((x): x is string => Boolean(x?.trim()))

    return {
        ...project,
        issueType: issueTypeName ?? "—",
        workpackage: workpackageName ?? "—",
        topic: topicName ?? "—",
        status: mapProjectStatus(statusName),
        priority: mapProjectPriority(priorityName),
        rawStatusName: statusName,
        people: people.length ? people : ["—"],
    }
}

export function mapApiTaskToTaskType(projectId: number, t: ApiGetProjectTaskListItemDTO): TaskType {
    return {
        id: t.taskId,
        projectId,
        name: t.name,
        description: "",
        status: mapTaskStatus(t.status),
        priority: mapTaskPriority(t.priority),
        statusId: t.statusId ?? null,
        priorityId: t.priorityId ?? null,
        isMilestone: t.isMilestone,
        startDate: (t.startDate ?? "").slice(0, 10),
        endDate: (t.endDate ?? "").slice(0, 10),
        parentId: t.parentId ?? undefined,
        progress: Number(t.progress),
        taskCategory: t.taskCategoryName?.trim() || "—",
        requesterId: "—",
    }
}
