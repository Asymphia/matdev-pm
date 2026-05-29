"use client"

import { createMatdevProject, updateMatdevProject } from "@/app/actions/project-mutations"
import FormField, { formFieldClasses } from "@/components/forms/FormField"
import FormModalShell from "@/components/forms/FormModalShell"
import type { ProjectType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import {
    BellIcon,
    BriefcaseIcon,
    CalendarIcon,
    Cog6ToothIcon,
    ExclamationTriangleIcon,
    HashtagIcon,
    LinkIcon,
    PencilSquareIcon,
    UserIcon,
} from "@heroicons/react/24/outline"
import { useState, useTransition } from "react"

interface ProjectFormModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
    lookups: ProjectCreateLookups | null
    lookupsError: string | null
    mode?: "create" | "edit"
    initialProject?: ProjectType
}

function parseId(raw: FormDataEntryValue | null): number | null {
    if (raw == null || raw === "") return null
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
}

function parseOptionalDate(raw: FormDataEntryValue | null): string | null {
    const s = typeof raw === "string" ? raw.trim() : ""
    return s === "" ? null : s
}

const ProjectFormModal = ({ isOpen, onClose, onCreated, lookups, lookupsError, mode = "create", initialProject }: ProjectFormModalProps) => {
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const submitWithFormData = (formData: FormData) => {
        setSubmitError(null)
        const projectName = String(formData.get("name") ?? "").trim()
        if (!projectName) {
            setSubmitError("Project name is required.")
            return
        }
        const topicId = parseId(formData.get("topicId"))
        const issuetypeId = parseId(formData.get("issuetypeId"))
        const workpackageId = parseId(formData.get("workpackageId"))
        if (!topicId || !issuetypeId || !workpackageId) {
            setSubmitError("Wybierz wymagane tagi: topic, issue i workpackage.")
            return
        }

        const body = {
            projectName,
            topicId,
            statusId: parseId(formData.get("statusId")),
            priorityId: parseId(formData.get("priorityId")),
            issuetypeId,
            respPeronId: parseId(formData.get("respPeronId")),
            suppPersonId: parseId(formData.get("suppPersonId")),
            startDate: parseOptionalDate(formData.get("startDate")),
            endDate: parseOptionalDate(formData.get("endDate")),
            workpackageId,
            description: (() => {
                const d = formData.get("description")
                const s = typeof d === "string" ? d.trim() : ""
                return s === "" ? null : s
            })(),
        }

        startTransition(async () => {
            const result =
                mode === "edit" && initialProject
                    ? await updateMatdevProject({
                          projectId: initialProject.id,
                          projectName: body.projectName,
                          topicId: body.topicId,
                          statusId: body.statusId,
                          priorityId: body.priorityId,
                          issuetypeId: body.issuetypeId,
                          respPeronId: body.respPeronId,
                          suppPersonId: body.suppPersonId,
                          startDate: body.startDate,
                          endDate: body.endDate,
                          workpackageId: body.workpackageId,
                          description: body.description,
                      })
                    : await createMatdevProject(body)
            if (result.ok) {
                onCreated()
            } else {
                setSubmitError(result.error)
            }
        })
    }

    const canUseForm = Boolean(lookups && !lookupsError)
    const isEdit = mode === "edit"

    return (
        <FormModalShell isOpen={isOpen} title={isEdit ? "Edit project" : "New project"} onClose={onClose}>
            {lookupsError ? (
                <p className="text-error mb-4 text-sm">Nie załadowano list (topic, status, …): {lookupsError}</p>
            ) : null}
            {submitError ? <p className="text-error mb-4 text-sm">{submitError}</p> : null}

            <form
                className="flex flex-col gap-4"
                onSubmit={e => {
                    e.preventDefault()
                    submitWithFormData(new FormData(e.currentTarget))
                }}
            >
                <FormField icon={LinkIcon}>
                    <input
                        name="name"
                        required
                        placeholder="Project name"
                        defaultValue={initialProject?.projectName ?? ""}
                        className={formFieldClasses}
                        disabled={pending || !canUseForm}
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={HashtagIcon} isSelect>
                        <select
                            name="topicId"
                            required
                            defaultValue={initialProject?.topicId != null ? String(initialProject.topicId) : ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        >
                            <option value="">— Topic —</option>
                            {lookups?.topics.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField icon={Cog6ToothIcon} isSelect>
                        <select
                            name="statusId"
                            defaultValue={initialProject?.statusId != null ? String(initialProject.statusId) : ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        >
                            <option value="">— Status —</option>
                            {lookups?.statuses.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={BellIcon} isSelect>
                        <select
                            name="priorityId"
                            defaultValue={initialProject?.priorityId != null ? String(initialProject.priorityId) : ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        >
                            <option value="">— Priority —</option>
                            {lookups?.priorities.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField icon={ExclamationTriangleIcon} isSelect>
                        <select
                            name="issuetypeId"
                            required
                            defaultValue={initialProject?.issuetypeId != null ? String(initialProject.issuetypeId) : ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        >
                            <option value="">— Issue type —</option>
                            {lookups?.issueTypes.map(i => (
                                <option key={i.id} value={i.id}>
                                    {i.name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={UserIcon} isSelect>
                        <select
                            name="respPeronId"
                            defaultValue={initialProject?.respPeronId != null ? String(initialProject.respPeronId) : ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        >
                            <option value="">— Responsible —</option>
                            {lookups?.users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.displayName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField icon={UserIcon} isSelect>
                        <select
                            name="suppPersonId"
                            defaultValue={initialProject?.suppPersonId != null ? String(initialProject.suppPersonId) : ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        >
                            <option value="">— Support —</option>
                            {lookups?.users.map(u => (
                                <option key={`s-${u.id}`} value={u.id}>
                                    {u.displayName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField icon={CalendarIcon}>
                        <input
                            name="startDate"
                            type="date"
                            defaultValue={initialProject?.startDate ?? ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        />
                    </FormField>
                    <FormField icon={CalendarIcon}>
                        <input
                            name="endDate"
                            type="date"
                            defaultValue={initialProject?.deadline ?? ""}
                            className={formFieldClasses}
                            disabled={pending || !canUseForm}
                        />
                    </FormField>
                </div>

                <FormField icon={BriefcaseIcon} isSelect>
                    <select
                        name="workpackageId"
                        required
                        defaultValue={initialProject?.workpackageId != null ? String(initialProject.workpackageId) : ""}
                        className={formFieldClasses}
                        disabled={pending || !canUseForm}
                    >
                        <option value="">— Workpackage —</option>
                        {lookups?.workpackages.map(w => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                <div className="relative">
                    <PencilSquareIcon className="text-text-primary-300 absolute top-3 left-3 h-5 w-5" />
                    <textarea
                        name="description"
                        rows={4}
                        placeholder="Description"
                        defaultValue={initialProject?.description ?? ""}
                        disabled={pending || !canUseForm}
                        className="border-border w-full resize-none rounded-md border bg-transparent py-3 pr-4 pl-10"
                    />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border-border cursor-pointer rounded-md border px-4 py-2 text-sm"
                        disabled={pending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={pending || !canUseForm}
                        className="cursor-pointer rounded-md bg-[#2D3748] px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {pending ? "Saving…" : isEdit ? "Save changes" : "Add project"}
                    </button>
                </div>
            </form>
        </FormModalShell>
    )
}

export default ProjectFormModal
