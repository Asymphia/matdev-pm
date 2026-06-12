import type { TaskType } from "@/lib/data"

export type GanttRow = {
    id: number
    name: string
    depth: number
    start: Date
    end: Date
    progress: number
    status: string
    isMilestone: boolean
}

export type GanttTimeline = {
    rangeStart: Date
    rangeEnd: Date
    totalMs: number
}

export type GanttTick = {
    label: string
    pct: number
}

const DAY_MS = 86_400_000

export function parseTaskDate(raw: string | null | undefined): Date | null {
    if (!raw?.trim()) return null
    const s = raw.slice(0, 10)
    const d = new Date(`${s}T12:00:00`)
    return Number.isNaN(d.getTime()) ? null : d
}

function inferTaskRange(
    task: TaskType,
    fallbackStart: Date,
    fallbackEnd: Date,
): { start: Date; end: Date } | null {
    const start = parseTaskDate(task.startDate)
    const end = parseTaskDate(task.endDate)

    if (!start && !end) return null

    if (start && end) {
        return end >= start ? { start, end } : { start: end, end: start }
    }

    if (start && !end) {
        const inferredEnd = new Date(start.getTime() + 6 * DAY_MS)
        return { start, end: inferredEnd > fallbackEnd ? inferredEnd : fallbackEnd }
    }

    const e = end!
    const inferredStart = new Date(e.getTime() - 6 * DAY_MS)
    return { start: inferredStart < fallbackStart ? fallbackStart : inferredStart, end: e }
}

function flattenTasks(tasks: TaskType[], getChildren: (parentId: number) => TaskType[], roots: TaskType[], depth = 0): TaskType[] {
    const out: TaskType[] = []
    for (const t of roots) {
        out.push(t)
        out.push(...flattenTasks(tasks, getChildren, getChildren(t.id), depth + 1))
    }
    return out
}

export function buildGanttRows(
    tasks: TaskType[],
    projectStart?: string | null,
    projectDeadline?: string | null,
): GanttRow[] {
    if (tasks.length === 0) return []

    const projStart = parseTaskDate(projectStart) ?? new Date()
    const projEnd = parseTaskDate(projectDeadline) ?? new Date(Date.now() + 30 * DAY_MS)

    const getChildren = (parentId: number) => tasks.filter(t => t.parentId === parentId)
    const roots = tasks.filter(t => t.parentId === undefined || !tasks.some(o => o.id === t.parentId))
    const ordered = flattenTasks(tasks, getChildren, roots)

    const rows: GanttRow[] = []
    for (const task of ordered) {
        const range = inferTaskRange(task, projStart, projEnd)
        if (!range) continue

        let depth = 0
        let pid = task.parentId
        while (pid != null) {
            depth++
            pid = tasks.find(t => t.id === pid)?.parentId
        }

        rows.push({
            id: task.id,
            name: task.name,
            depth,
            start: range.start,
            end: range.end,
            progress: Math.min(100, Math.max(0, task.progress ?? 0)),
            status: task.status,
            isMilestone: task.isMilestone,
        })
    }

    return rows
}

export function computeGanttTimeline(
    rows: GanttRow[],
    projectStart?: string | null,
    projectDeadline?: string | null,
): GanttTimeline {
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    let rangeStart = parseTaskDate(projectStart) ?? today
    let rangeEnd = parseTaskDate(projectDeadline) ?? new Date(today.getTime() + 14 * DAY_MS)

    for (const row of rows) {
        if (row.start < rangeStart) rangeStart = new Date(row.start)
        if (row.end > rangeEnd) rangeEnd = new Date(row.end)
    }

    rangeStart = new Date(rangeStart.getTime() - 2 * DAY_MS)
    rangeEnd = new Date(rangeEnd.getTime() + 2 * DAY_MS)

    if (rangeEnd <= rangeStart) {
        rangeEnd = new Date(rangeStart.getTime() + 14 * DAY_MS)
    }

    return {
        rangeStart,
        rangeEnd,
        totalMs: rangeEnd.getTime() - rangeStart.getTime(),
    }
}

export function barPosition(start: Date, end: Date, timeline: GanttTimeline): { leftPct: number; widthPct: number } {
    const { rangeStart, totalMs } = timeline
    const leftMs = start.getTime() - rangeStart.getTime()
    const widthMs = Math.max(end.getTime() - start.getTime(), DAY_MS / 2)
    const leftPct = Math.max(0, (leftMs / totalMs) * 100)
    const widthPct = Math.min(100 - leftPct, (widthMs / totalMs) * 100)
    return { leftPct, widthPct: Math.max(widthPct, 0.8) }
}

export function todayPositionPct(timeline: GanttTimeline): number | null {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const { rangeStart, rangeEnd, totalMs } = timeline
    if (today < rangeStart || today > rangeEnd) return null
    return ((today.getTime() - rangeStart.getTime()) / totalMs) * 100
}

export function buildGanttTicks(timeline: GanttTimeline, maxTicks = 8): GanttTick[] {
    const { rangeStart, rangeEnd, totalMs } = timeline
    const spanDays = totalMs / DAY_MS
    const stepDays = spanDays <= 14 ? 1 : spanDays <= 45 ? 7 : spanDays <= 120 ? 14 : 30

    const ticks: GanttTick[] = []
    const cursor = new Date(rangeStart)
    cursor.setHours(12, 0, 0, 0)

    while (cursor <= rangeEnd && ticks.length < maxTicks + 2) {
        const pct = ((cursor.getTime() - rangeStart.getTime()) / totalMs) * 100
        ticks.push({
            label: cursor.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
            pct,
        })
        cursor.setDate(cursor.getDate() + stepDays)
    }

    return ticks
}

export function ganttBarColor(status: string): string {
    const n = status.trim().toLowerCase()
    if (n.includes("completed") || n.includes("closed") || n.includes("done")) return "#629677"
    if (n.includes("progress") || n.includes("open")) return "#ab831e"
    if (n.includes("cancel")) return "#b21c1c"
    return "#2D4654"
}

export function formatGanttRange(start: Date, end: Date): string {
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    return `${fmt(start)} – ${fmt(end)}`
}
