import { TaskType } from "@/lib/data"
import { ChevronRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline"
import StatusItem, { type StatusItemType } from "@/components/ui/StatusItem"
import ProgressBar from "@/components/project/ProgressBar"
import ContextMenu, { type ContextMenuItem } from "@/components/ui/ContextMenu"
import Link from "next/link"
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

export type LookupOption = { id: number; name: string }

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
    onDelete?: (taskId: number) => void
    onStatusChange?: (taskId: number, statusId: number, statusName: string) => void
    onPriorityChange?: (taskId: number, priorityId: number, priorityName: string) => void
    onDeadlineChange?: (taskId: number, currentDeadline: string) => void
    statusOptions?: LookupOption[]
    priorityOptions?: LookupOption[]
    actionPending?: boolean
}

const TaskRow = ({
    task,
    isSubTask = false,
    isExpanded,
    hasSubTasks,
    onToggle,
    category = null,
    progress = null,
    isMilestone = null,
    href = null,
    onDelete,
    onStatusChange,
    onPriorityChange,
    onDeadlineChange,
    statusOptions = [],
    priorityOptions = [],
    actionPending,
}: TaskRowProps) => {
    const menuItems: ContextMenuItem[] = [
        ...(onStatusChange && statusOptions.length > 0
            ? statusOptions.map(s => ({
                  label: `Status → ${s.name}`,
                  onClick: () => onStatusChange(task.id, s.id, s.name),
              }))
            : []),
        ...(onPriorityChange && priorityOptions.length > 0
            ? priorityOptions.map(p => ({
                  label: `Priority → ${p.name}`,
                  onClick: () => onPriorityChange(task.id, p.id, p.name),
              }))
            : []),
        ...(onDeadlineChange ? [{ label: "Change deadline", onClick: () => onDeadlineChange(task.id, task.endDate) }] : []),
        ...(onDelete ? [{ label: "Delete task", onClick: () => onDelete(task.id), danger: true }] : []),
    ]

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
                <div className="flex justify-center">
                    {menuItems.length > 0 ? (
                        <ContextMenu items={menuItems} disabled={actionPending} />
                    ) : (
                        <span className="text-text-primary-300 block w-8 h-8" />
                    )}
                </div>
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
