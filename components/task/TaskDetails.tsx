import BlockWrapper from "@/components/ui/BlockWrapper"
import StatusItem from "@/components/ui/StatusItem"
import ProgressBar from "@/components/project/ProgressBar"
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { TaskType } from "@/lib/data"

const TaskDetails = ({ task }: { task: TaskType }) => {
    return (
        <BlockWrapper className="gap-5">
            <h2>Details</h2>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <strong>Priority:</strong> <StatusItem status={task.priority} />
                </div>

                <div className="flex items-center gap-2">
                    <strong>Progress:</strong>

                    <div className="flex w-full items-center gap-1">
                        <span>{task.progress}%</span>
                        <ProgressBar progress={task.progress} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <strong>Is milestone?:</strong>
                    {task.isMilestone ? <XMarkIcon className="text-text-primary-300 size-5" /> : <CheckIcon className="text-text-primary-300 size-5" />}
                </div>
            </div>
        </BlockWrapper>
    )
}

export default TaskDetails
