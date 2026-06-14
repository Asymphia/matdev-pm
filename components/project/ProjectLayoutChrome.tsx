"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProjectLocalFields } from "@/hooks/useProjectLocalFields"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import DeadlinePickerModal from "@/components/ui/DeadlinePickerModal"
import type { ProjectType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import { changeProjectStatus, changeProjectDeadline } from "@/app/actions/project-view-mutations"

type Props = {
    project: ProjectType
    lookups: ProjectCreateLookups | null
    lookupsError: string | null
}

/** Status, deadline and edit — shared across Overview / Tasks / Budget (no duplicate page titles). */
const ProjectLayoutChrome = ({ project, lookups, lookupsError }: Props) => {
    const router = useRouter()
    const [deadlinePicker, setDeadlinePicker] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const {
        localStatus,
        setLocalStatus,
        localStatusId,
        setLocalStatusId,
        localDeadline,
        setLocalDeadline,
    } = useProjectLocalFields(project)

    const statusOptions = lookups?.statuses ?? []

    const handleStatusChange = (statusId: number) => {
        const newStatusName = statusOptions.find(s => s.id === statusId)?.name ?? ""
        const n = newStatusName.toLowerCase()
        const mapped: typeof localStatus =
            n.includes("progress") || n.includes("open") ? "In progress"
            : n.includes("closed") || n.includes("completed") ? "Completed"
            : "To do"
        setLocalStatus(mapped)
        setLocalStatusId(statusId)
        ;(async () => {
            const res = await changeProjectStatus(project.id, statusId)
            if (!res.ok) {
                setError(res.error)
                setLocalStatus(project.status)
                setLocalStatusId(project.statusId)
            }
        })()
    }

    const handleDeadlineChange = (date: string) => {
        setLocalDeadline(date)
        setDeadlinePicker(false)
        ;(async () => {
            const res = await changeProjectDeadline(project.id, date)
            if (!res.ok) {
                setError(res.error)
                setLocalDeadline(project.deadline)
            }
        })()
    }

    return (
        <>
            {error ? (
                <p className="text-error border-error mb-2 max-w-sm rounded-md border px-3 py-2 text-sm">
                    {error}
                </p>
            ) : null}
            <ProjectSidebar
                status={localStatus}
                deadline={localDeadline}
                onEdit={() => setEditOpen(true)}
                statusOptions={statusOptions}
                onStatusChange={handleStatusChange}
                onDeadlineChange={() => setDeadlinePicker(true)}
            />
            <DeadlinePickerModal
                isOpen={deadlinePicker}
                title="Change project deadline"
                currentDate={localDeadline?.slice(0, 10) ?? ""}
                onClose={() => setDeadlinePicker(false)}
                onConfirm={handleDeadlineChange}
                pending={false}
            />
            <ProjectFormModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onCreated={() => {
                    setEditOpen(false)
                    router.refresh()
                }}
                lookups={lookups}
                lookupsError={lookupsError}
                mode="edit"
                initialProject={{ ...project, statusId: localStatusId, deadline: localDeadline }}
            />
        </>
    )
}

export default ProjectLayoutChrome
