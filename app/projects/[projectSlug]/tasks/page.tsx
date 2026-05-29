import { notFound } from "next/navigation"
import TaskContent from "@/components/task/TaskContent"
import TasksPageHeader from "@/components/task/TasksPageHeader"
import { fetchMatdevProjectById, fetchMatdevTasksForProject, fetchProjectCreateLookups } from "@/lib/server/matdev-projects"
import { enrichProjectWithLookups } from "@/lib/matdev-project-map"

const TasksPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [{ project }, { tasks }, { lookups }] = await Promise.all([
        fetchMatdevProjectById(id),
        fetchMatdevTasksForProject(id),
        fetchProjectCreateLookups(id),
    ])

    if (!project) {
        notFound()
    }

    const enrichedProject = enrichProjectWithLookups(project, lookups)

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <header className="flex items-center justify-between">
                <h1>
                    {enrichedProject.projectName} <span className="font-normal">/ Tasks</span>
                </h1>

                <TasksPageHeader project={enrichedProject} lookups={lookups} />
            </header>

            <TaskContent tasks={tasks} projectId={id} />
        </div>
    )
}

export default TasksPage
