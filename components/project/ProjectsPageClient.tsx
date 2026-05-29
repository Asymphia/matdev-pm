"use client"

import ProjectItem from "@/components/project/ProjectItem"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import { deleteMatdevProject } from "@/app/actions/project-mutations"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { ProjectType } from "@/lib/data"

type Props = {
    initialProjects: ProjectType[]
    loadError: string | null
    lookups: ProjectCreateLookups | null
    lookupsError: string | null
}

const ProjectsPageClient = ({ initialProjects, loadError, lookups, lookupsError }: Props) => {
    const router = useRouter()
    const [currentFilter, setCurrentFilter] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const handleDeleteProject = (projectId: number) => {
        if (!confirm("Delete this project? This cannot be undone.")) return
        startTransition(async () => {
            setDeleteError(null)
            const res = await deleteMatdevProject(projectId)
            if (!res.ok) { setDeleteError(res.error); return }
            router.refresh()
        })
    }
    const normalizeStatus = (status: string) => {
        const normalized = status.trim().toUpperCase()
        if (normalized === "OPEN" || normalized === "IN PROGRESS") return "IN PROGRESS"
        if (normalized === "TODO" || normalized === "TO DO") return "TODO"
        if (normalized === "CLOSED" || normalized === "COMPLETED") return "CLOSED"
        return normalized
    }
    const statusOptions = ["TODO", "IN PROGRESS", "CLOSED"]

    const term = search.trim().toLowerCase()
    const data = initialProjects
        .filter(p => !currentFilter || normalizeStatus(p.rawStatusName ?? "") === normalizeStatus(currentFilter))
        .filter(p => {
            if (!term) return true
            return (
                p.projectName.toLowerCase().includes(term) ||
                (p.description ?? "").toLowerCase().includes(term) ||
                (p.topic ?? "").toLowerCase().includes(term) ||
                (p.issueType ?? "").toLowerCase().includes(term) ||
                (p.workpackage ?? "").toLowerCase().includes(term) ||
                (p.status ?? "").toLowerCase().includes(term) ||
                p.people.some(name => name.toLowerCase().includes(term))
            )
        })

    return (
        <div className="flex h-full w-full flex-col gap-11">
            {(loadError || deleteError) ? (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">
                    {loadError ? `Failed to load projects from API: ${loadError}` : deleteError}
                </p>
            ) : null}

            <ProjectTopBar statusOptions={statusOptions} current={currentFilter} setCurrent={val => setCurrentFilter(val)} onOpenModal={() => setIsModalOpen(true)} search={search} onSearch={setSearch} />

            <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3">
                {!loadError && data.length === 0 ? (
                    <p className="text-text-primary-300 col-span-full text-sm">No projects found.</p>
                ) : null}
                {data.map(project => (
                    <ProjectItem key={project.id} project={project} onDelete={handleDeleteProject} actionPending={pending} />
                ))}
            </div>

            <ProjectFormModal
                isOpen={isModalOpen}
                lookups={lookups}
                lookupsError={lookupsError}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {
                    setIsModalOpen(false)
                    router.refresh()
                }}
            />
        </div>
    )
}

export default ProjectsPageClient
