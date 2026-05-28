"use client"

import FilterButtons from "@/components/project/FilterButtons"
import TasksList from "@/components/project/TasksList"
import { PROJECT_STATUS_OPTIONS, ProjectStatus, TaskType } from "@/lib/data"
import { useState } from "react"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"
import { useRouter } from "next/navigation"
import TaskFormModal from "@/components/task/TaskFormModal"

const TaskContent = ({ tasks, projectId }: { tasks: TaskType[]; projectId: number }) => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const router = useRouter()
    const filteredTasks = currentFilter ? tasks.filter(task => task.status === currentFilter) : tasks

    const onTaskCreated = () => {
        setIsTaskModalOpen(false)
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3">
                <h2>Overview</h2>

                <div className="justify-self-center">
                    <FilterButtons options={PROJECT_STATUS_OPTIONS} current={currentFilter} setCurrent={val => setCurrentFilter(val)} />
                </div>

                <div className="flex items-center gap-3 justify-self-end">
                    <IconButton Icon={PlusIcon} onClick={() => setIsTaskModalOpen(true)} />
                    <SearchBar />
                </div>
            </div>

            <TasksList tasks={filteredTasks} withDetails={true} />
            <TaskFormModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onCreated={onTaskCreated} projectId={projectId} />
        </div>
    )
}

export default TaskContent
