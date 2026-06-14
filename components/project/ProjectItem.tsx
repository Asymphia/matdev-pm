"use client"

import ProgressBar from "./ProgressBar"
import BlockWrapper from "@/components/ui/BlockWrapper"
import { calculateBudgetDiff, calculateTimeProgress, formatNumber } from "@/lib/projects-helpers"
import { type ProjectType } from "@/lib/data"
import Link from "next/link"
import ProjectTags from "@/components/project/ProjectTags"
import { TrashIcon } from "@heroicons/react/24/outline"

interface ProjectItemProps {
    project: ProjectType
    onDelete?: (projectId: number) => void
    actionPending?: boolean
}

const ProjectItem = ({ project, onDelete, actionPending }: ProjectItemProps) => {
    const now = new Date()
    const start = project.startDate ? new Date(project.startDate) : null
    const end = project.deadline ? new Date(project.deadline) : null
    const validStart = start && !isNaN(start.getTime())
    const validEnd = end && !isNaN(end.getTime())

    // Past deadline → always 100 %; future with both dates → interpolate; otherwise 0
    const deadlineProgress = !validEnd ? 0
        : now >= end! ? 100
        : validStart ? calculateTimeProgress(start!, end!)
        : 0

    const deadlineLabel = validEnd
        ? end!.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "—"

    const hasBudget = project.budget > 0
    const budgetPct = hasBudget ? calculateBudgetDiff(project.budget, project.amountSpent) : 0
    const overBudget = hasBudget && project.amountSpent > project.budget
    const budgetLabel = hasBudget
        ? overBudget
            ? `${project.amountSpent}/${project.budget} (+${formatNumber(project.amountSpent - project.budget)})`
            : `${project.amountSpent}/${project.budget}`
        : "—"

    return (
        <div className="relative">
            <Link href={`/projects/${project.id}`}>
                <BlockWrapper className="cursor-pointer gap-4">
                    <div className="flex w-full items-start justify-between gap-3">
                        <h3 className="line-clamp-1 min-w-0 flex-1">{project.projectName}</h3>
                        {onDelete ? <div className="size-9 shrink-0" aria-hidden /> : null}
                    </div>

                    <div className="line-clamp-2">{project.description}</div>

                    <ProjectTags topic={project.topic} workpackage={project.workpackage} issueType={project.issueType} />

                    <div className="flex flex-col gap-3">
                        <ProgressBar name="Budget" progress={hasBudget ? Math.min(budgetPct, 100) : 0} limit={budgetLabel} />
                        {overBudget && <p className="text-error text-xs">Over budget</p>}
                        <ProgressBar name="Deadline" progress={deadlineProgress} limit={deadlineLabel} />
                    </div>
                </BlockWrapper>
            </Link>

            {onDelete ? (
                <button
                    type="button"
                    title="Delete project"
                    aria-label="Delete project"
                    disabled={actionPending}
                    onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDelete(project.id)
                    }}
                    className="border-border bg-background hover:bg-foreground group absolute top-9 right-9 z-10 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-solid disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <TrashIcon className="text-text-primary-500 group-hover:text-error size-4 transition-colors" />
                </button>
            ) : null}
        </div>
    )
}

export default ProjectItem
