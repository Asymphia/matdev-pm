"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import DeadlinePickerModal from "@/components/ui/DeadlinePickerModal"
import type { ProjectType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import { changeProjectStatus, changeProjectDeadline } from "@/app/actions/project-view-mutations"

type Props = {
    project: ProjectType
    lookups: ProjectCreateLookups | null
}

const TasksPageHeader = ({ project, lookups }: Props) => {
    const router = useRouter()
    const [deadlinePicker, setDeadlinePicker] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [localStatus, setLocalStatus] = useState(project.status)
    const [localStatusId, setLocalStatusId] = useState(project.statusId)
    const [localDeadline, setLocalDeadline] = useState(project.deadline)
    useEffect(() => { setLocalStatus(project.status) }, [project.status])
    useEffect(() => { setLocalStatusId(project.statusId) }, [project.statusId])
    useEffect(() => { setLocalDeadline(project.deadline) }, [project.deadline])

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
            if (!res.ok) { setError(res.error); setLocalStatus(project.status); setLocalStatusId(project.statusId) }
        })()
    }

    const handleDeadlineChange = (date: string) => {
        setLocalDeadline(date)
        setDeadlinePicker(false)
        ;(async () => {
            const res = await changeProjectDeadline(project.id, date)
            if (!res.ok) { setError(res.error); setLocalDeadline(project.deadline) }
        })()
    }

    return (
        <>
            {error && <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{error}</p>}

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
                onSaved={() => { setEditOpen(false); router.refresh() }}
                editProject={{ ...project, statusId: localStatusId, deadline: localDeadline }}
                lookups={lookups}
            />
        </>
    )
}

export default TasksPageHeader
