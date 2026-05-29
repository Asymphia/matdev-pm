"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import ProgressBar from "@/components/project/ProgressBar"
import StatusItem, { type StatusItemType } from "@/components/ui/StatusItem"
import ContextMenu from "@/components/ui/ContextMenu"
import DeadlinePickerModal from "@/components/ui/DeadlinePickerModal"
import FormModalShell from "@/components/forms/FormModalShell"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import IconButton from "@/components/ui/IconButton"
import {
    changeTaskViewStatus,
    changeTaskViewPriority,
    changeTaskViewDeadline,
    createSubtask,
    deleteSubtask,
    changeSubtaskStatus,
    changeSubtaskStartDate,
    changeSubtaskEndDate,
    assignUserToTask,
    removeUserFromTask,
    fetchTaskViewCreateSubtaskForm,
    editTask,
    type TaskCreateFormLookup,
} from "@/app/actions/task-view-mutations"
import type { TaskViewData, TaskViewSubtask } from "@/lib/server/matdev-task-view"
import { CheckIcon, XMarkIcon, PlusIcon, CalendarIcon, TagIcon, UserIcon, PencilIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

type AssignableUser = { id: number; firstName: string; lastName: string; email?: string; phone?: string }

function priorityWeight(name: string): number {
    const n = name.toLowerCase()
    if (n.includes("high")) return 3
    if (n.includes("low")) return 1
    return 2
}

function isDoneStatus(name: string | null | undefined): boolean {
    if (!name) return false
    const n = name.toLowerCase()
    return n.includes("closed") || n.includes("done") || n.includes("completed") || n.includes("finish")
}

function computeWeightedProgress(subtasks: TaskViewSubtask[]): number {
    if (subtasks.length === 0) return 0
    const totalWeight = subtasks.reduce((sum, s) => sum + priorityWeight(s.subtaskPriority), 0)
    if (totalWeight === 0) return 0
    const doneWeight = subtasks
        .filter(s => isDoneStatus(s.subtaskStatus))
        .reduce((sum, s) => sum + priorityWeight(s.subtaskPriority), 0)
    return Math.round((doneWeight / totalWeight) * 100)
}

interface TaskViewClientProps {
    projectId: number
    taskId: number
    taskView: TaskViewData
    projectName: string
    allUsers: AssignableUser[]
}

const TaskViewClient = ({ projectId, taskId, taskView, projectName, allUsers }: TaskViewClientProps) => {
    const router = useRouter()
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [deadlinePicker, setDeadlinePicker] = useState<{ forSubtask?: number; isStartDate?: boolean; isEndDate?: boolean } | null>(null)

    const [subtaskFormOpen, setSubtaskFormOpen] = useState(false)
    const [editTaskOpen, setEditTaskOpen] = useState(false)
    const [subtaskLookups, setSubtaskLookups] = useState<{
        statuses: TaskCreateFormLookup[]
        priorities: TaskCreateFormLookup[]
        taskCategories: TaskCreateFormLookup[]
    } | null>(null)

    const [assignModal, setAssignModal] = useState(false)
    const [userCard, setUserCard] = useState<AssignableUser | null>(null)

    const { topbar, subtasks, assignments } = taskView

    // Fetch lookups on mount so status/priority menus are available immediately
    useEffect(() => {
        fetchTaskViewCreateSubtaskForm(projectId, taskId).then(res => {
            if (res.ok) setSubtaskLookups(res.data)
        })
    }, [projectId, taskId])

    const openSubtaskForm = () => {
        setSubtaskFormOpen(true)
    }

    const handleTopbarStatusChange = (statusId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await changeTaskViewStatus(projectId, taskId, statusId)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleTopbarPriorityChange = (priorityId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await changeTaskViewPriority(projectId, taskId, priorityId)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleTopbarDeadline = (date: string) => {
        startTransition(async () => {
            setError(null)
            const res = await changeTaskViewDeadline(projectId, taskId, date)
            setDeadlinePicker(null)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleSubtaskStatusChange = (subtaskId: number, statusId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await changeSubtaskStatus(projectId, taskId, subtaskId, statusId)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleSubtaskDate = (date: string) => {
        if (!deadlinePicker?.forSubtask) return
        const subtaskId = deadlinePicker.forSubtask
        const isEnd = deadlinePicker.isEndDate
        startTransition(async () => {
            setError(null)
            const res = isEnd
                ? await changeSubtaskEndDate(projectId, taskId, subtaskId, date)
                : await changeSubtaskStartDate(projectId, taskId, subtaskId, date)
            setDeadlinePicker(null)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleDeleteSubtask = (subtaskId: number) => {
        if (!confirm("Delete this subtask?")) return
        startTransition(async () => {
            setError(null)
            const res = await deleteSubtask(projectId, taskId, subtaskId)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleAssignUser = (userId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await assignUserToTask(projectId, taskId, userId)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleRemoveUser = (userId: number) => {
        startTransition(async () => {
            setError(null)
            const res = await removeUserFromTask(projectId, taskId, userId)
            if (!res.ok) { setError(res.error); return }
            router.refresh()
        })
    }

    const handleEditTask = (body: Parameters<typeof editTask>[2]) => {
        startTransition(async () => {
            setError(null)
            const res = await editTask(projectId, taskId, body)
            if (!res.ok) { setError(res.error); return }
            setEditTaskOpen(false)
            router.refresh()
        })
    }

    const assignedUserIds = new Set(assignments.map(a => a.userId))
    const availableToAssign = allUsers.filter(u => !assignedUserIds.has(u.id))

    const displayProgress = subtasks.length > 0
        ? computeWeightedProgress(subtasks)
        : isDoneStatus(topbar.statusName) ? 100 : topbar.taskProgress

    const statusMenuItems = subtaskLookups?.statuses.map(s => ({
        label: `Status → ${s.name}`,
        onClick: () => handleTopbarStatusChange(s.id),
    })) ?? []

    const priorityMenuItems = subtaskLookups?.priorities.map(p => ({
        label: `Priority → ${p.name}`,
        onClick: () => handleTopbarPriorityChange(p.id),
    })) ?? []

    return (
        <div className="flex flex-col gap-8">
            {error && <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{error}</p>}

            {/* ---- TOPBAR ---- */}
            <BlockWrapper>
                <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-semibold">{topbar.taskName}</h2>
                            {topbar.taskCategory && (
                                <span className="text-sm text-muted-foreground">{topbar.taskCategory}</span>
                            )}
                            {topbar.taskDescription && (
                                <p className="text-sm text-muted-foreground mt-1 max-w-xl">{topbar.taskDescription}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <IconButton Icon={PencilIcon} onClick={() => setEditTaskOpen(true)} disabled={pending} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-medium w-24 flex-shrink-0">Status</span>
                            <div className="flex items-center gap-2">
                                <StatusItem status={topbar.statusName as StatusItemType} />
                                <ContextMenu
                                    items={(subtaskLookups?.statuses ?? []).map(s => ({ label: s.name, onClick: () => handleTopbarStatusChange(s.id) }))}
                                    disabled={pending || (subtaskLookups?.statuses ?? []).length === 0}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium w-24 flex-shrink-0">Priority</span>
                            <div className="flex items-center gap-2">
                                <StatusItem status={topbar.taskPriority as StatusItemType} />
                                <ContextMenu
                                    items={(subtaskLookups?.priorities ?? []).map(p => ({ label: p.name, onClick: () => handleTopbarPriorityChange(p.id) }))}
                                    disabled={pending || (subtaskLookups?.priorities ?? []).length === 0}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium w-24 flex-shrink-0">Deadline</span>
                            <button
                                type="button"
                                onClick={() => setDeadlinePicker({})}
                                className="flex items-center gap-1 hover:text-primary-700 transition-colors text-sm"
                                disabled={pending}
                            >
                                <CalendarIcon className="size-4" />
                                {topbar.taskDeadline ? topbar.taskDeadline.slice(0, 10) : "Not set"}
                                <PencilIcon className="size-3 opacity-50" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium w-24 flex-shrink-0">Requester</span>
                            <span>{topbar.requesterName ?? "—"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium w-24 flex-shrink-0">Milestone</span>
                            {topbar.isMilestone ? (
                                <CheckIcon className="text-primary-500 size-5" />
                            ) : (
                                <XMarkIcon className="text-text-primary-300 size-5" />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="font-medium w-24 flex-shrink-0">Progress</span>
                            <div className="flex items-center gap-2 w-full">
                                <span className="text-sm">{displayProgress}%</span>
                                <ProgressBar progress={displayProgress} />
                            </div>
                        </div>
                    </div>
                </div>
            </BlockWrapper>

            {/* ---- SUBTASKS ---- */}
            <BlockWrapper className="gap-5">
                <header className="flex items-center justify-between">
                    <h2>Subtasks</h2>
                    <IconButton Icon={PlusIcon} onClick={openSubtaskForm} disabled={pending} />
                </header>

                {subtasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No subtasks yet.</p>
                ) : (
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-sm font-semibold">
                                <th className="text-center">Name</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Priority</th>
                                <th className="text-center">Start</th>
                                <th className="text-center">End</th>
                                <th className="text-center">Category</th>
                                <th className="text-center">Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subtasks.map((sub: TaskViewSubtask) => {
                                const subMenuItems = [
                                    ...(subtaskLookups?.statuses ?? []).map(s => ({
                                        label: `Status → ${s.name}`,
                                        onClick: () => handleSubtaskStatusChange(sub.subtaskId, s.id),
                                    })),
                                    { label: "Change start date", onClick: () => setDeadlinePicker({ forSubtask: sub.subtaskId, isStartDate: true }) },
                                    { label: "Change end date", onClick: () => setDeadlinePicker({ forSubtask: sub.subtaskId, isEndDate: true }) },
                                    { label: "Delete", onClick: () => handleDeleteSubtask(sub.subtaskId), danger: true },
                                ]
                                return (
                                    <tr key={sub.subtaskId}>
                                        <td className="text-center text-sm">
                                            <Link
                                                href={`/projects/${projectId}/tasks/${sub.subtaskId}`}
                                                className="inline-flex items-center gap-1 hover:text-primary-700 transition-colors"
                                            >
                                                {sub.subtaskName}
                                                <ArrowTopRightOnSquareIcon className="size-3 opacity-50" />
                                            </Link>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center">
                                                <StatusItem status={sub.subtaskStatus as StatusItemType} />
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center">
                                                <StatusItem status={sub.subtaskPriority as StatusItemType} />
                                            </div>
                                        </td>
                                        <td className="text-center text-sm">{sub.subtaskStartDate?.slice(0, 10) ?? "—"}</td>
                                        <td className="text-center text-sm">{sub.subtaskEndDate?.slice(0, 10) ?? "—"}</td>
                                        <td className="text-center text-sm">{sub.taskCategoryName ?? "—"}</td>
                                        <td>
                                            <div className="flex justify-center">
                                                <ContextMenu items={subMenuItems} disabled={pending} />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </BlockWrapper>

            {/* ---- ASSIGNMENTS ---- */}
            <BlockWrapper className="gap-5">
                <header className="flex items-center justify-between">
                    <h2>Assigned Users</h2>
                    {availableToAssign.length > 0 && (
                        <IconButton Icon={PlusIcon} onClick={() => setAssignModal(true)} disabled={pending} />
                    )}
                </header>

                {assignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No users assigned yet.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {assignments.map(u => {
                            const full = allUsers.find(a => a.id === u.userId)
                            return (
                                <div key={u.userId} className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setUserCard(prev => prev?.id === u.userId ? null : (full ?? { id: u.userId, firstName: u.firstName, lastName: u.lastName }))}
                                        className="text-sm hover:text-primary-700 transition-colors text-left"
                                    >
                                        {u.firstName} {u.lastName}
                                    </button>
                                    <ContextMenu
                                        items={[{ label: "Remove", onClick: () => handleRemoveUser(u.userId), danger: true }]}
                                        disabled={pending}
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* User info card */}
                {userCard && (
                    <div className="mt-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{userCard.firstName} {userCard.lastName}</span>
                            <button onClick={() => setUserCard(null)} className="text-text-primary-100 hover:text-text-primary-500 text-base leading-none">×</button>
                        </div>
                        {userCard.email ? (
                            <a href={`mailto:${userCard.email}`} className="text-text-primary-300 hover:text-primary-700 transition-colors">{userCard.email}</a>
                        ) : <span className="text-text-primary-100">No email on file</span>}
                        {userCard.phone ? (
                            <a href={`tel:${userCard.phone}`} className="text-text-primary-300 hover:text-primary-700 transition-colors">{userCard.phone}</a>
                        ) : <span className="text-text-primary-100">No phone on file</span>}
                    </div>
                )}
            </BlockWrapper>

            {/* ---- MODALS ---- */}
            <DeadlinePickerModal
                isOpen={deadlinePicker !== null}
                title={
                    deadlinePicker?.isStartDate ? "Change start date"
                    : deadlinePicker?.isEndDate ? "Change end date"
                    : "Change deadline"
                }
                currentDate={
                    deadlinePicker?.forSubtask
                        ? (deadlinePicker.isEndDate
                            ? subtasks.find(s => s.subtaskId === deadlinePicker.forSubtask)?.subtaskEndDate?.slice(0, 10) ?? ""
                            : subtasks.find(s => s.subtaskId === deadlinePicker.forSubtask)?.subtaskStartDate?.slice(0, 10) ?? "")
                        : topbar.taskDeadline?.slice(0, 10) ?? ""
                }
                onClose={() => setDeadlinePicker(null)}
                onConfirm={deadlinePicker?.forSubtask ? handleSubtaskDate : handleTopbarDeadline}
                pending={pending}
            />

            <CreateSubtaskModal
                isOpen={subtaskFormOpen}
                onClose={() => setSubtaskFormOpen(false)}
                onCreated={() => { setSubtaskFormOpen(false); router.refresh() }}
                projectId={projectId}
                taskId={taskId}
                statuses={subtaskLookups?.statuses ?? []}
                priorities={subtaskLookups?.priorities ?? []}
                taskCategories={subtaskLookups?.taskCategories ?? []}
                pending={pending}
                startTransition={startTransition}
                setError={setError}
            />

            <AssignUserModal
                isOpen={assignModal}
                users={availableToAssign}
                onClose={() => setAssignModal(false)}
                onAssign={userId => {
                    handleAssignUser(userId)
                    setAssignModal(false)
                }}
                pending={pending}
            />

            <EditTaskModal
                isOpen={editTaskOpen}
                onClose={() => setEditTaskOpen(false)}
                onSave={handleEditTask}
                topbar={topbar}
                statuses={subtaskLookups?.statuses ?? []}
                priorities={subtaskLookups?.priorities ?? []}
                taskCategories={subtaskLookups?.taskCategories ?? []}
                allUsers={allUsers}
                pending={pending}
            />
        </div>
    )
}

// ---- sub-components ----

interface CreateSubtaskModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
    projectId: number
    taskId: number
    statuses: TaskCreateFormLookup[]
    priorities: TaskCreateFormLookup[]
    taskCategories: TaskCreateFormLookup[]
    pending: boolean
    startTransition: (cb: () => void) => void
    setError: (e: string | null) => void
}

const CreateSubtaskModal = ({
    isOpen,
    onClose,
    onCreated,
    projectId,
    taskId,
    statuses,
    priorities,
    taskCategories,
    pending,
    startTransition,
    setError,
}: CreateSubtaskModalProps) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const name = String(fd.get("name") ?? "").trim()
        const statusId = Number(fd.get("statusId"))
        const priorityId = Number(fd.get("priorityId"))
        const startDate = String(fd.get("startDate") ?? "")
        const endDate = String(fd.get("endDate") ?? "").trim() || null
        const taskCategoryId = fd.get("taskCategoryId") ? Number(fd.get("taskCategoryId")) : null
        const taskDescription = String(fd.get("taskDescription") ?? "").trim()

        if (!name || !statusId || !priorityId || !startDate) return

        startTransition(async () => {
            setError(null)
            const res = await createSubtask(projectId, taskId, {
                name,
                statusId,
                priorityId,
                isMilestone: false,
                startDate,
                endDate,
                taskDescription,
                taskCategoryId,
            })
            if (!res.ok) { setError(res.error); return }
            onCreated()
        })
    }

    return (
        <FormModalShell isOpen={isOpen} title="New subtask" onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <FormField icon={TagIcon}>
                    <input name="name" required placeholder="Subtask name" className={formFieldClasses} disabled={pending} />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={TagIcon} isSelect>
                        <select name="statusId" required className={formFieldClasses} disabled={pending}>
                            <option value="">Status</option>
                            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </FormField>
                    <FormField icon={TagIcon} isSelect>
                        <select name="priorityId" required className={formFieldClasses} disabled={pending}>
                            <option value="">Priority</option>
                            {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={CalendarIcon}>
                        <input name="startDate" type="date" required className={formFieldClasses} disabled={pending} />
                    </FormField>
                    <FormField icon={CalendarIcon}>
                        <input name="endDate" type="date" className={formFieldClasses} disabled={pending} />
                    </FormField>
                </div>

                {taskCategories.length > 0 && (
                    <FormField icon={TagIcon} isSelect>
                        <select name="taskCategoryId" className={formFieldClasses} disabled={pending}>
                            <option value="">Category (optional)</option>
                            {taskCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </FormField>
                )}

                <FormField icon={TagIcon}>
                    <input name="taskDescription" placeholder="Description" className={formFieldClasses} disabled={pending} />
                </FormField>

                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button type="submit" className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50" disabled={pending}>
                        {pending ? "Saving..." : "Add subtask"}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

interface AssignUserModalProps {
    isOpen: boolean
    users: AssignableUser[]
    onClose: () => void
    onAssign: (userId: number) => void
    pending: boolean
}

const AssignUserModal = ({ isOpen, users, onClose, onAssign, pending }: AssignUserModalProps) => (
    <FormModalShell isOpen={isOpen} title="Assign user" onClose={onClose}>
        <div className="flex flex-col gap-2">
            {users.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">All users already assigned.</p>
            ) : (
                users.map(u => (
                    <button
                        key={u.id}
                        type="button"
                        disabled={pending}
                        onClick={() => onAssign(u.id)}
                        className="flex items-center gap-3 rounded-md px-4 py-3 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                        <UserIcon className="size-5 text-muted-foreground" />
                        <span>{u.firstName} {u.lastName}</span>
                    </button>
                ))
            )}
        </div>
    </FormModalShell>
)

interface EditTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (body: Parameters<typeof editTask>[2]) => void
    topbar: TaskViewData["topbar"]
    statuses: TaskCreateFormLookup[]
    priorities: TaskCreateFormLookup[]
    taskCategories: TaskCreateFormLookup[]
    allUsers: AssignableUser[]
    pending: boolean
}

const EditTaskModal = ({ isOpen, onClose, onSave, topbar, statuses, priorities, taskCategories, allUsers, pending }: EditTaskModalProps) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        onSave({
            name: String(fd.get("name") ?? "").trim() || undefined,
            statusId: fd.get("statusId") ? Number(fd.get("statusId")) : undefined,
            priorityId: fd.get("priorityId") ? Number(fd.get("priorityId")) : undefined,
            isMilestone: fd.get("isMilestone") === "on",
            requesterId: fd.get("requesterId") ? Number(fd.get("requesterId")) : null,
            startDate: String(fd.get("startDate") ?? "").trim() || null,
            endDate: String(fd.get("endDate") ?? "").trim() || null,
            taskDescription: String(fd.get("taskDescription") ?? "").trim() || null,
            taskCategoryId: fd.get("taskCategoryId") ? Number(fd.get("taskCategoryId")) : null,
        })
    }

    return (
        <FormModalShell isOpen={isOpen} title="Edit task" onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <FormField icon={TagIcon}>
                    <input name="name" defaultValue={topbar.taskName} placeholder="Task name" className={formFieldClasses} disabled={pending} required />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={TagIcon} isSelect>
                        <select name="statusId" defaultValue={topbar.statusId} className={formFieldClasses} disabled={pending}>
                            <option value="">Status</option>
                            {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </FormField>
                    <FormField icon={TagIcon} isSelect>
                        <select name="priorityId" defaultValue={topbar.priorityId} className={formFieldClasses} disabled={pending}>
                            <option value="">Priority</option>
                            {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={CalendarIcon}>
                        <input name="startDate" type="date" className={formFieldClasses} disabled={pending} />
                    </FormField>
                    <FormField icon={CalendarIcon}>
                        <input name="endDate" type="date" defaultValue={topbar.taskDeadline?.slice(0, 10) ?? ""} className={formFieldClasses} disabled={pending} />
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {taskCategories.length > 0 && (
                        <FormField icon={TagIcon} isSelect>
                            <select name="taskCategoryId" className={formFieldClasses} disabled={pending}>
                                <option value="">Category (optional)</option>
                                {taskCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </FormField>
                    )}
                    {allUsers.length > 0 && (
                        <FormField icon={UserIcon} isSelect>
                            <select name="requesterId" className={formFieldClasses} disabled={pending}>
                                <option value="">Requester (optional)</option>
                                {allUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                            </select>
                        </FormField>
                    )}
                </div>

                <FormField icon={TagIcon}>
                    <input name="taskDescription" defaultValue={topbar.taskDescription ?? ""} placeholder="Description" className={formFieldClasses} disabled={pending} />
                </FormField>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" name="isMilestone" defaultChecked={topbar.isMilestone} className="rounded" disabled={pending} />
                    Is milestone
                </label>

                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button type="submit" className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50" disabled={pending}>
                        {pending ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default TaskViewClient
