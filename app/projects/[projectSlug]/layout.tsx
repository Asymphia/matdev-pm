import { notFound } from "next/navigation"
import ProjectLayoutChrome from "@/components/project/ProjectLayoutChrome"
import ProjectTabs from "@/components/project/ProjectTabs"
import { enrichProjectWithLookups } from "@/lib/matdev-project-map"
import { fetchMatdevProjectById, fetchProjectCreateLookups } from "@/lib/server/matdev-projects"

const ProjectLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ projectSlug: string }>
}) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [{ project, error: projectLoadError }, { lookups, error: lookupsError }] = await Promise.all([
        fetchMatdevProjectById(id),
        fetchProjectCreateLookups(id),
    ])

    if (!project) {
        if (projectLoadError) {
            return (
                <div className="flex h-full flex-col gap-4">
                    <p className="text-error border-error rounded-md border px-4 py-3 text-sm">
                        Nie udało się załadować projektu: {projectLoadError}
                    </p>
                    <p className="text-text-primary-300 text-sm">
                        Sprawdź czy backend działa ({process.env.MATDEV_API_BASE_URL ?? "http://127.0.0.1:5196"}).
                    </p>
                </div>
            )
        }
        notFound()
    }

    const enriched = enrichProjectWithLookups(project, lookups)

    return (
        <div className="flex h-full w-full flex-col gap-8">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <h1 className="truncate text-2xl font-semibold">{enriched.projectName}</h1>
                    <ProjectTabs projectSlug={projectSlug} />
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                    <ProjectLayoutChrome
                        project={enriched}
                        lookups={lookups}
                        lookupsError={lookupsError}
                    />
                </div>
            </header>
            {children}
        </div>
    )
}

export default ProjectLayout
