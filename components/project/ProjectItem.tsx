"use client"

import ProgressBar from "./ProgressBar"
import BlockWrapper from "@/components/ui/BlockWrapper"
import ContextMenu from "@/components/ui/ContextMenu"
import { calculateBudgetDiff, calculateTimeProgress } from "@/lib/projects-helpers"
import { type ProjectType } from "@/lib/data"
import TextIcon from "@/components/ui/TextIcon"
import Link from "next/link"
import ProjectTags from "@/components/project/ProjectTags"

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
    const budgetLabel = hasBudget ? `${project.amountSpent}/${project.budget}` : "—"

    return (
        <div className="relative">
            <Link href={`/projects/${project.id}`}>
                <BlockWrapper className="cursor-pointer gap-4">
                    <div className="flex w-full justify-between">
                        <h3 className="mb-2 line-clamp-1">{project.projectName}</h3>
                        {/* spacer to keep layout when no context menu */}
                        <div className="w-8 h-8" />
                    </div>

                    <div className="line-clamp-2">{project.description}</div>

                    <ProjectTags topic={project.topic} workpackage={project.workpackage} issueType={project.issueType} />

                    <div className="flex flex-col gap-3">
                        <ProgressBar name="Budget" progress={hasBudget ? calculateBudgetDiff(project.budget, project.amountSpent) : 0} limit={budgetLabel} />
                        <ProgressBar name="Deadline" progress={deadlineProgress} limit={deadlineLabel} />
                    </div>
                </BlockWrapper>
            </Link>

            {onDelete && (
                <div className="absolute top-9 right-9 z-10" onClick={e => e.preventDefault()}>
                    <ContextMenu
                        items={[{ label: "Delete project", onClick: () => onDelete(project.id), danger: true }]}
                        disabled={actionPending}
                    />
                </div>
            )}
        </div>
    )
}

export default ProjectItem
