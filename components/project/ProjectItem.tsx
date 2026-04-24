import { EllipsisVerticalIcon, HashtagIcon, ExclamationTriangleIcon, BriefcaseIcon } from "@heroicons/react/24/outline"
import ProgressBar from "./ProgressBar"
import BlockWrapper from "@/components/ui/BlockWrapper"
import { calculateBudgetDiff, calculateTimeProgress } from "@/lib/projects-helpers"
import { type ProjectType } from "@/lib/data"
import TextIcon from "@/components/ui/TextIcon"
import Link from "next/link"
import ProjectTags from "@/components/project/ProjectTags"

interface ProjectItemProps {
    project: ProjectType
}

const ProjectItem = ({ project }: ProjectItemProps) => {
    const start = new Date(project.startDate)
    const end = new Date(project.deadline)

    return (
        <Link href={`/projects/${project.id}`}>
            <BlockWrapper className="cursor-pointer gap-4">
                <div className="flex w-full justify-between">
                    <h3 className="mb-2 line-clamp-1">{project.projectName}</h3>

                    <button type="button" className="cursor-pointer">
                        <EllipsisVerticalIcon className="text-text-primary-500 size-6" />
                    </button>
                </div>

                <div className="line-clamp-2">{project.description}</div>

                <ProjectTags topic={project.topic} workpackage={project.workpackage} issueType={project.issueType} />

                <div className="flex flex-col gap-3">
                    <ProgressBar name="Budget" progress={calculateBudgetDiff(project.budget, project.amountSpent)} limit={project.amountSpent + "/" + project.budget} />

                    <ProgressBar name="Deadline" progress={calculateTimeProgress(start, end)} limit={end.toLocaleDateString("pl-PL")} />
                </div>
            </BlockWrapper>
        </Link>
    )
}

export default ProjectItem
