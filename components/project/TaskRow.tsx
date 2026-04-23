import { TaskType } from "@/lib/data"
import { ChevronRightIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import StatusItem, { type StatusItemType } from "@/components/ui/StatusItem"

interface TaskRowProps {
    task: TaskType
    isSubTask?: boolean
    isExpanded: boolean
    hasSubTasks: boolean
    onToggle: () => void
}

const TaskRow = ({ task, isSubTask = false, isExpanded, hasSubTasks, onToggle }: TaskRowProps) => {
    return (
        <tr key={task.id}>
            <td className="text-center">
                <div className={`group flex flex-nowrap items-center gap-2 ${hasSubTasks ? "cursor-pointer" : ""}`} onClick={onToggle}>
                    <ChevronRightIcon
                        className={`text-text-primary-300 group-hover:text-primary-700 group-active:text-primary-500 size-5 transition-all ${!hasSubTasks ? "invisible" : ""} ${isExpanded ? "rotate-90" : ""} ${isSubTask ? "ml-5" : ""}`}
                    />
                    <p className="group-hover:text-primary-700 group-active:text-primary-500">{task.name}</p>
                </div>
            </td>
            <td className="text-center">{task.startDate}</td>
            <td className="text-center">{task.endDate}</td>
            <td>
                <div className="flex justify-center">
                    <StatusItem status={task.priority as StatusItemType} />
                </div>
            </td>
            <td>
                <div className="flex justify-center">
                    <StatusItem status={task.status as StatusItemType} />
                </div>
            </td>
            <td>
                <button className="group flex w-full cursor-pointer justify-center">
                    <EllipsisVerticalIcon className="text-text-primary-300 group-hover:text-primary-700 group-active:text-primary-500 size-6 transition-all" />
                </button>
            </td>
        </tr>
    )
}

export default TaskRow
