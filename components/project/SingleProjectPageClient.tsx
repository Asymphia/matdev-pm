"use client"

import ProjectDescription from "@/components/project/ProjectDescription"
import TasksList from "@/components/project/TasksList"
import TaskFormModal from "@/components/task/TaskFormModal"
import BudgetMiniWidget from "@/components/project/BudgetMiniWidget"
import WarningsList from "@/components/project/WarningsList"
import UserList from "@/components/project/UserList"
import DeadlinePickerModal from "@/components/ui/DeadlinePickerModal"
import type { ProjectType, TaskType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import type { ProjectAssignedUser } from "@/lib/server/matdev-projects"
import type { ProjectBudget } from "@/lib/server/matdev-budget"
import type { ProjectRisk } from "@/lib/server/matdev-risks"
import { assignUserToProject, removeUserFromProject } from "@/app/actions/project-view-mutations"
import { deleteTask, changeTaskStatus, changeTaskPriority, changeTaskDeadline } from "@/app/actions/task-mutations"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useConfirm } from "@/hooks/useConfirm"

type AssignableUser = { id: number; firstName: string; lastName: string }

type Props = {
    project: ProjectType
    tasks: TaskType[]
    assignedUsers: ProjectAssignedUser[]
    assignableUsers: AssignableUser[]
    lookups: ProjectCreateLookups | null
    apiNote: string
    budget: ProjectBudget | null
    risks: ProjectRisk[]
}

const SingleProjectPageClient = ({ project, tasks, assignedUsers, assignableUsers, lookups, apiNote, budget, risks }: Props) => {
    const router = useRouter()
    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [taskDeadlinePicker, setTaskDeadlinePicker] = useState<{ taskId: number; current: string } | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()
    const { confirm, ConfirmModal } = useConfirm()

    const usersWithRoles = assignedUsers.map(user => ({
        ...user,
        role: user.isResponsible ? "Responsible" : ("Member" as "Responsible" | "Support" | "Member"),
    }))

    const taskStatusOptions = lookups?.statuses ?? []
    const taskPriorityOptions = lookups?.priorities ?? []

    const handleTaskDelete = async (taskId: number) => {
        const ok = await confirm({
            title: "Delete task",
            message: "This task will be permanently removed.",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
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
        <div className="flex h-full w-full flex-col gap-8">
            {displayNote ? <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{displayNote}</p> : null}

            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
                <div className="flex flex-col items-stretch gap-4">
                    <ProjectDescription description={project.description} topic={project.topic} issueType={project.issueType} workpackage={project.workpackage} />
                    <TasksList
                        tasks={tasks}
                        projectId={project.id}
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

                <div className="flex flex-col items-stretch gap-4">
                    <BudgetMiniWidget budget={budget} projectId={project.id} />
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
            <ConfirmModal />
        </div>
    )
}

export default SingleProjectPageClient
