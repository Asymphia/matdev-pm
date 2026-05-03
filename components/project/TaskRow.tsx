import { TaskType } from "@/lib/data"
import { ChevronRightIcon, EllipsisVerticalIcon, CheckIcon, XMarkIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline"
import StatusItem, { type StatusItemType } from "@/components/ui/StatusItem"
import ProgressBar from "@/components/project/ProgressBar"
import Link from "next/link"

interface TaskRowProps {
    task: TaskType
    isSubTask?: boolean
    isExpanded: boolean
    hasSubTasks: boolean
    isMilestone?: boolean | null
    category?: string | null
    progress?: number | null
    href?: string | null
    onToggle: () => void
}

const TaskRow = ({ task, isSubTask = false, isExpanded, hasSubTasks, onToggle, category = null, progress = null, isMilestone = null, href = null }: TaskRowProps) => {
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
            {isMilestone !== null && (
                <td>
                    <div className="flex justify-center">{isMilestone ? <CheckIcon className="text-text-primary-300 size-6" /> : <XMarkIcon className="text-text-primary-300 size-6" />}</div>
                </td>
            )}
            {category !== null && <td className="text-center">{task.taskCategory}</td>}
            {progress !== null && (
                <td className="text-center">
                    <ProgressBar progress={progress} />
                </td>
            )}
            <td>
                <button className="group flex w-full cursor-pointer justify-center">
                    <EllipsisVerticalIcon className="text-text-primary-300 group-hover:text-primary-700 group-active:text-primary-500 size-6 transition-all" />
                </button>
            </td>
            {href !== null && (
                <td>
                    <Link href={href} className="group flex w-full justify-center">
                        <ArrowUpRightIcon className="text-text-primary-300 group-hover:text-primary-700 group-active:text-primary-500 size-5 transition-all" />
                    </Link>
                </td>
            )}
        </tr>
    )
}

export default TaskRow
