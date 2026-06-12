"use client"

import { createMatdevTask, fetchMatdevTaskCreateForm } from "@/app/actions/task-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import { CalendarIcon, PencilSquareIcon, UserIcon, CheckIcon } from "@heroicons/react/24/outline"
import { useEffect, useState, useTransition } from "react"

function userInitials(firstName: string, lastName: string) {
    const a = firstName.trim()[0] ?? ""
    const b = lastName.trim()[0] ?? ""
    return (a + b).toUpperCase() || "?"
}

interface TaskFormModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
    projectId: number
}

const TaskFormModal = ({ isOpen, onClose, onCreated, projectId }: TaskFormModalProps) => {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [lookupsError, setLookupsError] = useState<string | null>(null)
    const [lookups, setLookups] = useState<Awaited<ReturnType<typeof fetchMatdevTaskCreateForm>> | null>(null)
    const [assignedUserIds, setAssignedUserIds] = useState<number[]>([])
    const [pending, startTransition] = useTransition()

    const loadProjectId = isOpen ? projectId : null
    const [loadedFor, setLoadedFor] = useState<number | null>(null)
    const [wasOpen, setWasOpen] = useState(isOpen)
    if (loadProjectId !== loadedFor) {
        setLoadedFor(loadProjectId)
        setLookups(null)
        setLookupsError(null)
    }
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen)
        if (!isOpen) setAssignedUserIds([])
    }

    useEffect(() => {
        if (loadProjectId == null) return
        let cancelled = false
        ;(async () => {
            const result = await fetchMatdevTaskCreateForm(loadProjectId)
            if (cancelled) return
            if (!result.ok) {
                setLookupsError(result.error)
                return
            }
            setLookups(result)
        })()
        return () => {
            cancelled = true
        }
    }, [loadProjectId])

    function parseId(raw: FormDataEntryValue | null): number | null {
        if (raw == null || raw === "") return null
        const n = Number(raw)
        return Number.isFinite(n) && n > 0 ? n : null
    }

    const submitWithFormData = (formData: FormData) => {
        setSubmitError(null)
        const name = String(formData.get("name") ?? "").trim()
        const description = String(formData.get("description") ?? "").trim()
        const statusId = parseId(formData.get("statusId"))
        const priorityId = parseId(formData.get("priorityId"))
        const requesterId = parseId(formData.get("requesterId"))
        const taskCategoryId = parseId(formData.get("taskCategoryId"))
        const startDateRaw = String(formData.get("startDate") ?? "").trim()
        const endDateRaw = String(formData.get("endDate") ?? "").trim()

        if (!name) {
            setSubmitError("Task name is required.")
            return
        }
        if (!description) {
            setSubmitError("Task description is required.")
            return
        }
        if (!statusId || !priorityId) {
            setSubmitError("Please select a status and priority.")
            return
        }
        if (!startDateRaw) {
            setSubmitError("Start date is required.")
            return
        }

        startTransition(async () => {
            const result = await createMatdevTask(projectId, {
                name,
                description,
                statusId,
                priorityId,
                requesterId,
                assignedUserIds,
                taskCategoryId,
                isMilestone: formData.get("isMilestone") === "on",
                startDate: new Date(startDateRaw).toISOString(),
                endDate: endDateRaw ? new Date(endDateRaw).toISOString() : null,
            })
            if (result.ok) {
                onCreated()
            } else {
                setSubmitError(result.error)
            }
        })
    }

    return (
        <FormModalShell isOpen={isOpen} title="New task" onClose={onClose}>
            <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={e => {
                    e.preventDefault()
                    submitWithFormData(new FormData(e.currentTarget))
                }}
            >
                {lookupsError ? <p className="text-error mb-3 shrink-0 text-sm">Failed to load form data: {lookupsError}</p> : null}
                {submitError ? <p className="text-error mb-3 shrink-0 text-sm">{submitError}</p> : null}

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                <FormField icon={PencilSquareIcon}>
                    <input name="name" required placeholder="Task name" className={formFieldClasses} disabled={pending} />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={PencilSquareIcon} isSelect>
                        <select name="statusId" required className={formFieldClasses} disabled={pending || !lookups || !lookups.ok}>
                            <option value="">— Status —</option>
                            {lookups?.ok
                                ? lookups.data.statuses.map(s => (
                                      <option key={s.id} value={s.id}>
                                          {s.name}
                                      </option>
                                  ))
                                : null}
                        </select>
                    </FormField>
                    <FormField icon={PencilSquareIcon} isSelect>
                        <select name="priorityId" required className={formFieldClasses} disabled={pending || !lookups || !lookups.ok}>
                            <option value="">— Priority —</option>
                            {lookups?.ok
                                ? lookups.data.priorities.map(p => (
                                      <option key={p.id} value={p.id}>
                                          {p.name}
                                      </option>
                                  ))
                                : null}
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

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={UserIcon} isSelect>
                        <select name="requesterId" className={formFieldClasses} disabled={pending || !lookups || !lookups.ok}>
                            <option value="">— Requester —</option>
                            {lookups?.ok
                                ? lookups.data.users.map(u => (
                                      <option key={u.userId} value={u.userId}>
                                          {u.firstName} {u.lastName}
                                      </option>
                                  ))
                                : null}
                        </select>
                    </FormField>
                    <FormField icon={PencilSquareIcon} isSelect>
                        <select name="taskCategoryId" className={formFieldClasses} disabled={pending || !lookups || !lookups.ok}>
                            <option value="">— Category —</option>
                            {lookups?.ok
                                ? lookups.data.taskCategories.map(c => (
                                      <option key={c.id} value={c.id}>
                                          {c.name}
                                      </option>
                                  ))
                                : null}
                        </select>
                    </FormField>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Assigned users</span>
                    {!lookups?.ok ? (
                        <p className="text-text-primary-100 text-sm">Loading users…</p>
                    ) : lookups.data.users.length === 0 ? (
                        <p className="text-text-primary-100 text-sm">No users available to assign.</p>
                    ) : (
                        <div className="border-border flex max-h-52 flex-col gap-1 overflow-y-auto rounded-md border p-1">
                            {lookups.data.users.map(u => {
                                const selected = assignedUserIds.includes(u.userId)
                                return (
                                    <div
                                        key={u.userId}
                                        className="border-border hover:bg-foreground/60 flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2 transition-colors"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="bg-primary-700 text-background flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                                                {userInitials(u.firstName, u.lastName)}
                                            </span>
                                            <span className="text-text-primary-500 truncate text-sm font-medium">
                                                {u.firstName} {u.lastName}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={pending}
                                            onClick={() =>
                                                setAssignedUserIds(prev =>
                                                    selected ? prev.filter(id => id !== u.userId) : [...prev, u.userId],
                                                )
                                            }
                                            className={
                                                selected
                                                    ? "bg-primary-700 hover:bg-primary-800 flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
                                                    : "border-border text-text-primary-500 hover:bg-foreground cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                                            }
                                        >
                                            {selected ? (
                                                <>
                                                    <CheckIcon className="size-3.5" />
                                                    Assigned
                                                </>
                                            ) : (
                                                "Assign"
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input name="isMilestone" type="checkbox" disabled={pending} />
                    Milestone
                </label>

                <div className="relative">
                    <PencilSquareIcon className="text-text-primary-300 absolute top-3 left-3 h-5 w-5" />
                    <textarea
                        name="description"
                        rows={4}
                        required
                        placeholder="Description"
                        disabled={pending}
                        className="border-border w-full resize-none rounded-md border bg-transparent py-3 pr-4 pl-10"
                    />
                </div>

                </div>

                <div className="border-border mt-4 flex shrink-0 justify-end gap-3 border-t pt-4">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50"
                        disabled={pending || Boolean(lookupsError) || (lookups !== null && !lookups.ok)}
                    >
                        {pending ? "Adding..." : "Add task"}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default TaskFormModal
