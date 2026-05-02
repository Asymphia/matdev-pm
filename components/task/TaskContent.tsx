"use client"

import FilterButtons from "@/components/project/FilterButtons"
import TasksList from "@/components/project/TasksList"
import { ProjectStatus, TaskType } from "@/lib/data"
import { useState } from "react"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"

const TaskContent = ({ tasks }: { tasks: TaskType[] }) => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)
    const filteredTasks = currentFilter ? tasks.filter(task => task.status === currentFilter) : tasks

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3">
                <h2>Overview</h2>

                <div className="justify-self-center">
                    <FilterButtons current={currentFilter} setCurrent={val => setCurrentFilter(val)} />
                </div>

                <div className="flex items-center gap-3 justify-self-end">
                    <IconButton Icon={PlusIcon} onClick={() => {}} />
                    <SearchBar />
                </div>
            </div>

            <TasksList tasks={filteredTasks} withDetails={true} />
        </div>
    )
}

export default TaskContent
