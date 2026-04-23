import { useState } from "react"
import { TaskType } from "@/lib/data"

const useTasksTree = (tasks: TaskType[]) => {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

    const mainTasks = tasks.filter(task => task.parentId === undefined)
    const getSubTasks = (parentId: number) => tasks.filter(task => task.parentId === parentId)

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const isExpanded = (id: number) => expandedIds.has(id)

    return { mainTasks, getSubTasks, toggleExpand, isExpanded }
}

export default useTasksTree
