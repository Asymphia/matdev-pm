"use client"

import ProjectItem from "@/components/project/ProjectItem"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const normalizeStatus = (status: string) => {
        const normalized = status.trim().toUpperCase()
        if (normalized === "OPEN" || normalized === "IN PROGRESS") return "IN PROGRESS"
        if (normalized === "TODO" || normalized === "TO DO") return "TODO"
        if (normalized === "CLOSED" || normalized === "COMPLETED") return "CLOSED"
        return normalized
    }
    const statusOptions = ["TODO", "IN PROGRESS", "CLOSED"]

    const data = currentFilter
        ? initialProjects.filter(project => normalizeStatus(project.rawStatusName ?? "") === normalizeStatus(currentFilter))
        : initialProjects

    return (
        <div className="flex h-full w-full flex-col gap-11">
            {loadError ? (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">
                    Nie udało się wczytać projektów z API: {loadError}
                </p>
            ) : null}

            <ProjectTopBar statusOptions={statusOptions} current={currentFilter} setCurrent={val => setCurrentFilter(val)} onOpenModal={() => setIsModalOpen(true)} />

            <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3">
                {!loadError && data.length === 0 ? (
                    <p className="text-text-primary-300 col-span-full text-sm">Brak projektów w bazie.</p>
                ) : null}
                {data.map(project => (
                    <ProjectItem key={project.id} project={project} />
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
