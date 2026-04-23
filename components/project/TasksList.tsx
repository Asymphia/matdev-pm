"use client"

import { ReactNode } from "react"
import BlockWrapper from "@/components/ui/BlockWrapper"
import { TaskType } from "@/lib/data"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline"
import Th from "@/components/ui/Th"
import TaskRow from "./TaskRow"
import useTasksTree from "@/hooks/useTaskTree"

const TasksList = ({ tasks }: { tasks: TaskType[] }) => {
    const { mainTasks, getSubTasks, toggleExpand, isExpanded } = useTasksTree(tasks)

    const renderRows = (task: TaskType, isSubTask = false): ReactNode[] => {
        const subTasks = getSubTasks(task.id)
        const expanded = isExpanded(task.id)

        return [
            <TaskRow key={task.id} task={task} isSubTask={isSubTask} isExpanded={expanded} hasSubTasks={subTasks.length > 0} onToggle={() => toggleExpand(task.id)} />,
            ...(expanded ? subTasks.flatMap(sub => renderRows(sub, true)) : []),
        ]
    }

    return (
        <BlockWrapper className="gap-5">
            <header className="flex flex-nowrap items-center justify-between">
                <h2>Tasks</h2>
                <div className="flex flex-nowrap items-center gap-4">
                    <IconButton Icon={PlusIcon} onClick={() => {}} />
                    <IconButton Icon={ArrowUpRightIcon} onClick={() => {}} />
                </div>
            </header>

            <table className="w-full border-separate border-spacing-y-4">
                <thead>
                    <tr>
                        <Th>Task name</Th>
                        <Th>Start date</Th>
                        <Th>Deadline</Th>
                        <Th>Priority</Th>
                        <Th>Status</Th>
                        <Th>Manage</Th>
                    </tr>
                </thead>
                <tbody>{mainTasks.map(task => renderRows(task))}</tbody>
            </table>
        </BlockWrapper>
    )
}

export default TasksList
