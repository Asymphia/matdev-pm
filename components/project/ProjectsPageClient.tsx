"use client"

import ProjectItem from "@/components/project/ProjectItem"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import BlockWrapper from "@/components/ui/BlockWrapper"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import { deleteMatdevProject } from "@/app/actions/project-mutations"
import { FolderPlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { ProjectType } from "@/lib/data"
import { useConfirm } from "@/hooks/useConfirm"
import AlertBanner from "@/components/ui/AlertBanner"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { toUserFacingError } from "@/lib/user-facing-errors"

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
    const { confirm, ConfirmModal } = useConfirm()

    const handleDeleteProject = async (projectId: number) => {
        const ok = await confirm({
            title: "Delete project",
            message: "This cannot be undone.",
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
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
    const statusOptions = ["To do", "In progress", "Closed"]

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

    const hasActiveFilters = Boolean(currentFilter || term)
    const isEmptyDatabase = initialProjects.length === 0

    const displayError = loadError
        ? toUserFacingError(loadError, "api")
        : deleteError
          ? toUserFacingError(deleteError, "generic")
          : null

    return (
        <div className="relative flex h-full w-full flex-col gap-11">
            {pending ? (
                <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                    <LoadingSpinner size="md" label="Przetwarzanie…" />
                </div>
            ) : null}

            {displayError ? (
                <AlertBanner
                    variant="error"
                    title={loadError ? "Nie udało się załadować projektów" : "Operacja nie powiodła się"}
                    message={displayError}
                    onRetry={loadError ? () => router.refresh() : undefined}
                    retryLabel="Odśwież stronę"
                />
            ) : null}

            <ProjectTopBar statusOptions={statusOptions} current={currentFilter} setCurrent={val => setCurrentFilter(val)} onOpenModal={() => setIsModalOpen(true)} search={search} onSearch={setSearch} />

            <div className="grid min-h-[420px] flex-1 grid-cols-2 gap-4 2xl:grid-cols-3">
                {!loadError && data.length === 0 ? (
                    <BlockWrapper className="col-span-full flex items-center justify-center border-dashed py-16">
                        <div className="flex max-w-md flex-col items-center gap-5 text-center">
                            <div className="border-border bg-foreground flex size-16 items-center justify-center rounded-full border">
                                {isEmptyDatabase ? (
                                    <FolderPlusIcon className="text-text-primary-300 size-8" />
                                ) : (
                                    <MagnifyingGlassIcon className="text-text-primary-300 size-8" />
                                )}
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">
                                    {isEmptyDatabase ? "No projects yet" : "No projects found"}
                                </h2>
                                <p className="text-text-primary-300 text-sm">
                                    {isEmptyDatabase
                                        ? "Create your first project to get started."
                                        : hasActiveFilters
                                          ? term
                                              ? `Nothing matches “${search.trim()}”. Try another phrase or clear filters.`
                                              : `No projects with status “${currentFilter}”. Try another filter or clear filters.`
                                          : "No projects match the current view."}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {isEmptyDatabase ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="cursor-pointer rounded-md bg-[#2D3748] px-5 py-2 text-sm text-white"
                                    >
                                        Add project
                                    </button>
                                ) : null}
                                {hasActiveFilters ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("")
                                            setCurrentFilter(null)
                                        }}
                                        className="border-border cursor-pointer rounded-md border px-5 py-2 text-sm"
                                    >
                                        Clear filters
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </BlockWrapper>
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
            <ConfirmModal />
        </div>
    )
}

export default ProjectsPageClient
