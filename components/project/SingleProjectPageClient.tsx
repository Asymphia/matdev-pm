"use client"

import ProjectDescription from "@/components/project/ProjectDescription"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import TasksList from "@/components/project/TasksList"
import TaskFormModal from "@/components/task/TaskFormModal"
import BudgetChart from "@/components/project/BudgetChart"
import WarningsList from "@/components/project/WarningsList"
import UserList from "@/components/project/UserList"
import DeadlinePickerModal from "@/components/ui/DeadlinePickerModal"
import type { ProjectType, TaskType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import type { ProjectAssignedUser } from "@/lib/server/matdev-projects"
import type { ProjectBudget } from "@/lib/server/matdev-budget"
import type { ProjectRisk } from "@/lib/server/matdev-risks"
import { assignUserToProject, removeUserFromProject, changeProjectStatus, changeProjectDeadline } from "@/app/actions/project-view-mutations"
import { deleteTask, changeTaskStatus, changeTaskPriority, changeTaskDeadline } from "@/app/actions/task-mutations"
import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect } from "react"

type AssignableUser = { id: number; firstName: string; lastName: string }

type Props = {
    project: ProjectType
    tasks: TaskType[]
    assignedUsers: ProjectAssignedUser[]
    assignableUsers: AssignableUser[]
    lookups: ProjectCreateLookups | null
    lookupsError: string | null
    apiNote: string
    budget: ProjectBudget | null
    risks: ProjectRisk[]
}

const SingleProjectPageClient = ({ project, tasks, assignedUsers, assignableUsers, lookups, lookupsError, apiNote, budget, risks }: Props) => {
    const router = useRouter()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deadlinePicker, setDeadlinePicker] = useState(false)
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [taskDeadlinePicker, setTaskDeadlinePicker] = useState<{ taskId: number; current: string } | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    // Optimistic local state so the header updates immediately after mutations.
    // The useEffect syncs back from server props when the full edit form saves + router.refresh() fires.
    const [localStatus, setLocalStatus] = useState(project.status)
    const [localStatusId, setLocalStatusId] = useState(project.statusId)
    const [localDeadline, setLocalDeadline] = useState(project.deadline)
    useEffect(() => { setLocalStatus(project.status) }, [project.status])
    useEffect(() => { setLocalStatusId(project.statusId) }, [project.statusId])
    useEffect(() => { setLocalDeadline(project.deadline) }, [project.deadline])

    const usersWithRoles = assignedUsers.map(user => ({
        ...user,
        role: user.isResponsible ? "Responsible" : ("Member" as "Responsible" | "Support" | "Member"),
    }))

    const statusOptions = lookups?.statuses ?? []
    const taskStatusOptions = lookups?.statuses ?? []
    const taskPriorityOptions = lookups?.priorities ?? []

    const handleTaskDelete = (taskId: number) => {
        if (!confirm("Delete this task?")) return
        startTransition(async () => {
            setActionError(null)
            const res = await deleteTask(project.id, taskId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleTaskStatusChange = (taskId: number, statusId: number) => {
        startTransition(async () => {
            setActionError(null)
            const res = await changeTaskStatus(project.id, taskId, statusId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleTaskPriorityChange = (taskId: number, priorityId: number) => {
        startTransition(async () => {
            setActionError(null)
            const res = await changeTaskPriority(project.id, taskId, priorityId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleTaskDeadlineConfirm = (date: string) => {
        if (!taskDeadlinePicker) return
        startTransition(async () => {
            setActionError(null)
            const res = await changeTaskDeadline(project.id, taskDeadlinePicker.taskId, date)
            setTaskDeadlinePicker(null)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleStatusChange = (statusId: number) => {
        const newStatusName = statusOptions.find(s => s.id === statusId)?.name ?? ""
        const n = newStatusName.toLowerCase()
        const mapped: typeof localStatus =
            n.includes("progress") || n.includes("open") ? "In progress"
            : n.includes("closed") || n.includes("completed") ? "Completed"
            : "To do"
        // Update UI immediately — no router.refresh() needed (nothing else on this page depends on project status)
        setLocalStatus(mapped)
        setLocalStatusId(statusId)
        ;(async () => {
            const res = await changeProjectStatus(project.id, statusId)
            if (!res.ok) { setActionError(res.error); setLocalStatus(project.status); setLocalStatusId(project.statusId) }
        })()
    }

    const handleDeadlineChange = (date: string) => {
        setLocalDeadline(date)
        setDeadlinePicker(false)
        ;(async () => {
            const res = await changeProjectDeadline(project.id, date)
            if (!res.ok) { setActionError(res.error); setLocalDeadline(project.deadline) }
        })()
    }

    const handleAssign = (userId: number, isResponsible: boolean) => {
        startTransition(async () => {
            setActionError(null)
            const res = await assignUserToProject(project.id, userId, isResponsible)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    const handleRemove = (userId: number) => {
        startTransition(async () => {
            setActionError(null)
            const res = await removeUserFromProject(project.id, userId)
            if (!res.ok) { setActionError(res.error); return }
            router.refresh()
        })
    }

    // Only show critical errors (project/tasks failed), not form-lookup failures
    const displayNote = actionError ?? (apiNote || null)

    return (
        <div className="flex h-full w-full flex-col gap-11">
            {displayNote ? <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{displayNote}</p> : null}

            <header className="flex items-center justify-between">
                <h1>{project.projectName}</h1>
                <ProjectSidebar
                    status={localStatus}
                    deadline={localDeadline}
                    onEdit={() => setIsEditModalOpen(true)}
                    statusOptions={statusOptions}
                    onStatusChange={handleStatusChange}
                    onDeadlineChange={() => setDeadlinePicker(true)}
                />
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <ProjectDescription description={project.description} topic={project.topic} issueType={project.issueType} workpackage={project.workpackage} />
                    <TasksList
                        tasks={tasks}
                        onAdd={() => setTaskModalOpen(true)}
                        onDelete={handleTaskDelete}
                        onStatusChange={handleTaskStatusChange}
                        onPriorityChange={handleTaskPriorityChange}
                        onDeadlineChange={(taskId, current) => setTaskDeadlinePicker({ taskId, current })}
                        statusOptions={taskStatusOptions}
                        priorityOptions={taskPriorityOptions}
                        actionPending={pending}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <BudgetChart budget={budget} projectId={project.id} />
                    <WarningsList projectId={project.id} initialRisks={risks} />
                    <UserList
                        users={usersWithRoles}
                        assignableUsers={assignableUsers}
                        onAssign={handleAssign}
                        onRemove={handleRemove}
                        actionPending={pending}
                    />
                </div>
            </div>

            <ProjectFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onCreated={() => {
                    setIsEditModalOpen(false)
                    router.refresh()
                }}
                lookups={lookups}
                lookupsError={lookupsError}
                mode="edit"
                initialProject={{ ...project, statusId: localStatusId, deadline: localDeadline }}
            />

            <DeadlinePickerModal
                isOpen={deadlinePicker}
                currentDate={localDeadline?.slice(0, 10) ?? ""}
                onClose={() => setDeadlinePicker(false)}
                onConfirm={handleDeadlineChange}
                pending={pending}
            />

            <TaskFormModal
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                onCreated={() => { setTaskModalOpen(false); router.refresh() }}
                projectId={project.id}
            />

            <DeadlinePickerModal
                isOpen={taskDeadlinePicker !== null}
                currentDate={taskDeadlinePicker?.current ?? ""}
                onClose={() => setTaskDeadlinePicker(null)}
                onConfirm={handleTaskDeadlineConfirm}
                pending={pending}
                title="Change task deadline"
            />
        </div>
    )
}

export default SingleProjectPageClient
