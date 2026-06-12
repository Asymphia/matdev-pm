"use client"

import { useMemo } from "react"
import Link from "next/link"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import type { TaskType } from "@/lib/data"
import {
    barPosition,
    buildGanttRows,
    buildGanttTicks,
    computeGanttTimeline,
    formatGanttRange,
    ganttBarColor,
    todayPositionPct,
} from "@/lib/gantt-utils"

type Props = {
    tasks: TaskType[]
    projectId: number
    projectStart?: string | null
    projectDeadline?: string | null
}

const LABEL_WIDTH = 220
const ROW_HEIGHT = 36

const ProjectGanttChart = ({ tasks, projectId, projectStart, projectDeadline }: Props) => {
    const rows = useMemo(() => buildGanttRows(tasks, projectStart, projectDeadline), [tasks, projectStart, projectDeadline])
    const timeline = useMemo(() => computeGanttTimeline(rows, projectStart, projectDeadline), [rows, projectStart, projectDeadline])
    const ticks = useMemo(() => buildGanttTicks(timeline), [timeline])
    const todayPct = useMemo(() => todayPositionPct(timeline), [timeline])

    const unscheduledCount = tasks.length - rows.length

    if (tasks.length === 0) {
        return (
            <BlockWrapper className="gap-3">
                <CardTitle>Timeline</CardTitle>
                <p className="text-text-primary-100 text-sm">No tasks yet — add tasks with start dates to see the Gantt chart.</p>
            </BlockWrapper>
        )
    }

    if (rows.length === 0) {
        return (
            <BlockWrapper className="gap-3">
                <CardTitle>Timeline</CardTitle>
                <p className="text-text-primary-100 text-sm">
                    Tasks exist but none have dates. Set start or deadline on tasks to populate the chart.
                </p>
            </BlockWrapper>
        )
    }

    return (
        <BlockWrapper className="gap-4 overflow-hidden p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <CardTitle>Timeline</CardTitle>
                    <p className="text-text-primary-100 mt-1 text-sm">
                        {rows.length} scheduled task{rows.length === 1 ? "" : "s"}
                        {unscheduledCount > 0 ? ` · ${unscheduledCount} without dates` : ""}
                    </p>
                </div>
                <div className="text-text-primary-300 flex flex-wrap gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="bg-primary-500 size-2.5 rounded-sm" /> Done
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm" style={{ backgroundColor: "#ab831e" }} /> In progress
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="bg-primary-700 size-2.5 rounded-sm" /> To do
                    </span>
                    {todayPct != null && (
                        <span className="flex items-center gap-1.5">
                            <span className="bg-error h-3 w-0.5" /> Today
                        </span>
                    )}
                </div>
            </div>

            <div className="border-border overflow-x-auto rounded-md border">
                <div style={{ minWidth: LABEL_WIDTH + 640 }}>
                    {/* Header */}
                    <div className="border-border bg-foreground/50 flex border-b" style={{ height: 40 }}>
                        <div
                            className="text-text-primary-100 border-border flex shrink-0 items-center border-r px-3 text-xs font-medium uppercase tracking-wide"
                            style={{ width: LABEL_WIDTH }}
                        >
                            Task
                        </div>
                        <div className="relative min-w-0 flex-1">
                            {ticks.map(t => (
                                <span
                                    key={t.label + t.pct}
                                    className="text-text-primary-300 absolute top-1/2 text-[10px] tabular-nums"
                                    style={{ left: `${t.pct}%`, transform: "translate(-50%, -50%)" }}
                                >
                                    {t.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="relative">
                        {/* Grid + today line (shared) */}
                        <div
                            className="pointer-events-none absolute top-0 bottom-0"
                            style={{ left: LABEL_WIDTH, right: 0 }}
                        >
                            {ticks.map(t => (
                                <div
                                    key={`grid-${t.pct}`}
                                    className="bg-border absolute top-0 bottom-0 w-px opacity-40"
                                    style={{ left: `${t.pct}%` }}
                                />
                            ))}
                            {todayPct != null && (
                                <div
                                    className="bg-error absolute top-0 bottom-0 w-0.5 opacity-80"
                                    style={{ left: `${todayPct}%` }}
                                    title="Today"
                                />
                            )}
                        </div>

                        {rows.map((row, i) => {
                            const { leftPct, widthPct } = barPosition(row.start, row.end, timeline)
                            const color = ganttBarColor(row.status)
                            const rangeLabel = formatGanttRange(row.start, row.end)

                            return (
                                <div
                                    key={row.id}
                                    className={`border-border flex items-center border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-foreground/20"}`}
                                    style={{ height: ROW_HEIGHT }}
                                >
                                    <div
                                        className="border-border shrink-0 border-r px-2"
                                        style={{ width: LABEL_WIDTH, paddingLeft: 8 + row.depth * 14 }}
                                    >
                                        <Link
                                            href={`/projects/${projectId}/tasks/${row.id}`}
                                            className="text-text-primary-500 hover:text-primary-700 block truncate text-sm"
                                            title={row.name}
                                        >
                                            {row.isMilestone ? "◆ " : null}
                                            {row.name}
                                        </Link>
                                    </div>
                                    <div className="relative min-w-0 flex-1 pr-2">
                                        <div
                                            className="group absolute top-1/2 h-5 -translate-y-1/2 rounded-sm transition-opacity"
                                            style={{
                                                left: `${leftPct}%`,
                                                width: `${widthPct}%`,
                                                minWidth: row.isMilestone ? 10 : 6,
                                            }}
                                            title={`${row.name} · ${rangeLabel} · ${row.progress}% · ${row.status}`}
                                        >
                                            <div
                                                className="absolute inset-0 rounded-sm opacity-30"
                                                style={{ backgroundColor: color }}
                                            />
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-sm"
                                                style={{
                                                    width: `${row.progress}%`,
                                                    backgroundColor: color,
                                                }}
                                            />
                                            {row.isMilestone && (
                                                <div
                                                    className="border-background absolute top-1/2 size-2.5 -translate-y-1/2 rotate-45 border-2"
                                                    style={{
                                                        right: -4,
                                                        borderColor: color,
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            )}
                                            <span className="text-background pointer-events-none absolute inset-0 flex items-center justify-center truncate px-1 text-[10px] font-medium opacity-0 group-hover:opacity-100">
                                                {row.progress}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </BlockWrapper>
    )
}

export default ProjectGanttChart
