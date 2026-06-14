"use client"

import FilterButtons from "@/components/project/FilterButtons"
import TasksList from "@/components/project/TasksList"
import { PROJECT_STATUS_OPTIONS, ProjectStatus, TaskType } from "@/lib/data"
import { useState, useTransition, useEffect } from "react"
import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"
import { useRouter } from "next/navigation"
import TaskFormModal from "@/components/task/TaskFormModal"
import { useConfirm } from "@/hooks/useConfirm"
import DeadlinePickerModal from "@/components/ui/DeadlinePickerModal"
import { fetchMatdevTaskCreateForm } from "@/app/actions/task-mutations"
import { deleteTask, changeTaskStatus, changeTaskPriority, changeTaskDeadline } from "@/app/actions/task-mutations"
import type { LookupOption } from "@/components/project/TaskRow"

const TaskContent = ({ tasks, projectId }: { tasks: TaskType[]; projectId: number }) => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)
    const [search, setSearch] = useState("")
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    const [deadlinePicker, setDeadlinePicker] = useState<{ taskId: number; current: string } | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [statusOptions, setStatusOptions] = useState<LookupOption[]>([])
    const [priorityOptions, setPriorityOptions] = useState<LookupOption[]>([])
    const [pending, startTransition] = useTransition()
    const router = useRouter()
    const { confirm, ConfirmModal } = useConfirm()

    useEffect(() => {
        fetchMatdevTaskCreateForm(projectId).then(res => {
            if (res.ok) {
                setStatusOptions(res.data.statuses.map(s => ({ id: s.id, name: s.name })))
                setPriorityOptions(res.data.priorities.map(p => ({ id: p.id, name: p.name })))
            }
        })
    }, [projectId])

    const term = search.trim().toLowerCase()
    const filteredTasks = tasks
        .filter(task => !currentFilter || task.status === currentFilter)
        .filter(task => {
            if (!term) return true
            return (
                task.name.toLowerCase().includes(term) ||
                (task.description ?? "").toLowerCase().includes(term) ||
                (task.taskCategory ?? "").toLowerCase().includes(term) ||
                task.status.toLowerCase().includes(term) ||
                task.priority.toLowerCase().includes(term) ||
                (task.isMilestone && term.length >= 3 && "milestone".includes(term))
            )
        })

    const onTaskCreated = () => {
        setIsTaskModalOpen(false)
        router.refresh()
    }

    const handleDelete = async (taskId: number) => {
        const ok = await confirm({
            title: "Delete task",
            message: "This task will be permanently removed.",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
        startTransition(async () => {
            setActionError(null)
            const res = await deleteTask(projectId, taskId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleStatusChange = (taskId: number, statusId: number) => {
        startTransition(async () => {
            setActionError(null)
            const res = await changeTaskStatus(projectId, taskId, statusId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handlePriorityChange = (taskId: number, priorityId: number) => {
        startTransition(async () => {
            setActionError(null)
            const res = await changeTaskPriority(projectId, taskId, priorityId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleDeadlineConfirm = (date: string) => {
        if (!deadlinePicker) return
        const { taskId } = deadlinePicker
        startTransition(async () => {
            setActionError(null)
            const res = await changeTaskDeadline(projectId, taskId, date)
            setDeadlinePicker(null)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    return (
        <div className="flex flex-col gap-6">
            {actionError && (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{actionError}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <FilterButtons
                    options={PROJECT_STATUS_OPTIONS}
                    current={currentFilter}
                    setCurrent={val => setCurrentFilter(val as ProjectStatus | null)}
                />
                <div className="flex items-center gap-3">
                    <IconButton Icon={PlusIcon} onClick={() => setIsTaskModalOpen(true)} />
                    <SearchBar value={search} onChange={setSearch} placeholder="Search tasks…" />
                </div>
            </div>

            <TasksList
                tasks={filteredTasks}
                projectId={projectId}
                withDetails={true}
                onDelete={handleDelete}
                onStatusChange={(taskId, statusId) => handleStatusChange(taskId, statusId)}
                onPriorityChange={(taskId, priorityId) => handlePriorityChange(taskId, priorityId)}
                onDeadlineChange={(taskId, currentDeadline) => setDeadlinePicker({ taskId, current: currentDeadline })}
                statusOptions={statusOptions}
                priorityOptions={priorityOptions}
                actionPending={pending}
            />

            <TaskFormModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onCreated={onTaskCreated} projectId={projectId} />

            <DeadlinePickerModal
                isOpen={deadlinePicker !== null}
                currentDate={deadlinePicker?.current ?? ""}
                onClose={() => setDeadlinePicker(null)}
                onConfirm={handleDeadlineConfirm}
                pending={pending}
            />
            <ConfirmModal />
        </div>
    )
}

export default TaskContent
