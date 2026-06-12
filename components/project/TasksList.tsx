"use client"

import { ReactNode } from "react"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import { TaskType } from "@/lib/data"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline"
import Th from "@/components/ui/Th"
import TaskRow, { type LookupOption } from "./TaskRow"
import useTasksTree from "@/hooks/useTaskTree"
import { useRouter } from "next/navigation"


interface TasksListProps {
    tasks: TaskType[]
    projectId?: number
    withDetails?: boolean
    onAdd?: () => void
    onDelete?: (taskId: number) => void
    onStatusChange?: (taskId: number, statusId: number, statusName: string) => void
    onPriorityChange?: (taskId: number, priorityId: number, priorityName: string) => void
    onDeadlineChange?: (taskId: number, currentDeadline: string) => void
    statusOptions?: LookupOption[]
    priorityOptions?: LookupOption[]
    actionPending?: boolean
}

const TasksList = ({
    tasks,
    projectId,
    withDetails = false,
    onAdd,
    onDelete,
    onStatusChange,
    onPriorityChange,
    onDeadlineChange,
    statusOptions = [],
    priorityOptions = [],
    actionPending,
}: TasksListProps) => {
    const { mainTasks, getSubTasks, toggleExpand, isExpanded } = useTasksTree(tasks)
    const router = useRouter()

    const renderRows = (task: TaskType, isSubTask = false): ReactNode[] => {
        const subTasks = getSubTasks(task.id)
        const expanded = isExpanded(task.id)

        return [
            <TaskRow
                key={task.id}
                task={task}
                isSubTask={isSubTask}
                isExpanded={expanded}
                hasSubTasks={subTasks.length > 0}
                isMilestone={withDetails ? task.isMilestone : null}
                category={withDetails ? task.taskCategory : null}
                progress={withDetails ? (task.progress ?? 0) : null}
                onToggle={() => toggleExpand(task.id)}
                href={withDetails ? `/projects/${task.projectId}/tasks/${task.id}` : null}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onPriorityChange={onPriorityChange}
                onDeadlineChange={onDeadlineChange}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                actionPending={actionPending}
            />,
            ...(expanded ? subTasks.flatMap(sub => renderRows(sub, true)) : []),
        ]
    }

    const resolvedProjectId = projectId ?? tasks[0]?.projectId

    const listHeader = !withDetails ? (
        <header className="flex items-center justify-between gap-3">
            <CardTitle>Tasks</CardTitle>
            <div className="flex shrink-0 items-center gap-2">
                {onAdd ? <IconButton Icon={PlusIcon} onClick={() => onAdd()} /> : null}
                {resolvedProjectId != null ? (
                    <IconButton Icon={ArrowUpRightIcon} onClick={() => router.push(`/projects/${resolvedProjectId}/tasks`)} />
                ) : null}
            </div>
        </header>
    ) : null

    if (tasks.length === 0) {
        return (
            <BlockWrapper className="flex w-full flex-col gap-3 self-start">
                {listHeader}
                <p className="text-text-primary-100 text-sm">No tasks found.</p>
            </BlockWrapper>
        )
    }

    return (
        <BlockWrapper className="flex w-full flex-col gap-5 self-start">
            {!withDetails && listHeader}

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-border border-b">
                        <Th>Task name</Th>
                        <Th align="center">Start date</Th>
                        <Th align="center">Deadline</Th>
                        <Th align="center">Priority</Th>
                        <Th align="center">Status</Th>
                        {withDetails && (
                            <>
                                <Th align="center">Is milestone?</Th>
                                <Th align="center">Category</Th>
                                <Th align="center">Progress</Th>
                            </>
                        )}
                        <Th align="center">Manage</Th>
                        {withDetails && <Th align="center">Open</Th>}
                    </tr>
                </thead>
                <tbody className="divide-border divide-y">{mainTasks.map(task => renderRows(task))}</tbody>
            </table>
        </BlockWrapper>
    )
}

export default TasksList
