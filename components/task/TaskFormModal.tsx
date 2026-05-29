"use client"

import { createMatdevTask, fetchMatdevTaskCreateForm } from "@/app/actions/task-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import { CalendarIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline"
import { useEffect, useState, useTransition } from "react"

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
    const [pending, startTransition] = useTransition()

    useEffect(() => {
        if (!isOpen) return
        let cancelled = false
        setLookups(null)
        setLookupsError(null)
        ;(async () => {
            const result = await fetchMatdevTaskCreateForm(projectId)
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
    }, [isOpen, projectId])

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
        const assignedUserIds = formData
            .getAll("assignedUserIds")
            .map(v => Number(v))
            .filter(v => Number.isFinite(v) && v > 0)

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
            {lookupsError ? <p className="text-error mb-4 text-sm">Failed to load form data: {lookupsError}</p> : null}
            {submitError ? <p className="text-error mb-4 text-sm">{submitError}</p> : null}
            <form
                className="flex flex-col gap-4"
                onSubmit={e => {
                    e.preventDefault()
                    submitWithFormData(new FormData(e.currentTarget))
                }}
            >
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

                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Assigned users <span className="text-muted-foreground font-normal">(hold Ctrl / Cmd to select multiple)</span></span>
                    <FormField icon={UserIcon} isSelect>
                        <select name="assignedUserIds" multiple className={formFieldClasses} disabled={pending || !lookups || !lookups.ok}>
                            {lookups?.ok
                                ? lookups.data.users.map(u => (
                                      <option key={`a-${u.userId}`} value={u.userId}>
                                          {u.firstName} {u.lastName}
                                      </option>
                                  ))
                                : null}
                        </select>
                    </FormField>
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

                <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm" disabled={pending}>
                        Cancel
                    </button>
                    <button type="submit" className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50" disabled={pending}>
                        {pending ? "Adding..." : "Add task"}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default TaskFormModal
