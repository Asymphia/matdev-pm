import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import ProgressBar from "./ProgressBar"
import BlockWrapper from "@/components/ui/BlockWrapper"
import { calculateBudgetDiff, calculateTimeProgress } from "@/lib/projects-helpers"

interface ProjectItemProps {
  name: string
  description: string
  startDate: Date
  endDate: Date
  budget: number
  amountSpent: number
}

const ProjectItem = ({ name, description, startDate, endDate, budget, amountSpent,}: ProjectItemProps) => {
    return (
        <BlockWrapper className="gap-4 cursor-pointer">
            <div className="w-full flex justify-between">
                <h3 className="line-clamp-1 mb-2">
                    { name }
                </h3>

                <button type="button" className="cursor-pointer">
                    <EllipsisVerticalIcon className="size-6 text-text-primary-500" />
                </button>
            </div>

            <div className="line-clamp-2">
                { description }
            </div>

            <div className="flex flex-col gap-3">
                <ProgressBar
                    name="Budget"
                    progress={calculateBudgetDiff(budget, amountSpent)}
                    limit={amountSpent + '/' + budget}
                />

                <ProgressBar
                    name="Deadline"
                    progress={calculateTimeProgress(startDate, endDate)}
                    limit={endDate.toLocaleDateString("pl-PL")}
                />
            </div>
        </BlockWrapper>
    )
}

export default ProjectItem
