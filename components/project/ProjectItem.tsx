import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import ProgressBar from "./ProgressBar"
import BlockWrapper from "@/components/ui/BlockWrapper"
import { calculateBudgetDiff, calculateTimeProgress } from "@/lib/projects-helpers"
import { type ProjectType } from "@/lib/data"

const ProjectItem = ({ project }: { project: ProjectType }) => {
    const start = new Date(project.startDate)
    const end = new Date(project.deadline)

    return (
        <BlockWrapper className="gap-4 cursor-pointer">
            <div className="w-full flex justify-between">
                <h3 className="line-clamp-1 mb-2">
                    { project.projectName }
                </h3>

                <button type="button" className="cursor-pointer">
                    <EllipsisVerticalIcon className="size-6 text-text-primary-500" />
                </button>
            </div>

            <div className="line-clamp-2">
                { project.description }
            </div>

            <div className="flex flex-col gap-3">
                <ProgressBar
                    name="Budget"
                    progress={calculateBudgetDiff(project.budget, project.amountSpent)}
                    limit={project.amountSpent + '/' + project.budget}
                />

                <ProgressBar
                    name="Deadline"
                    progress={calculateTimeProgress(start, end)}
                    limit={end.toLocaleDateString("pl-PL")}
                />
            </div>
        </BlockWrapper>
    )
}

export default ProjectItem
