import { notFound } from "next/navigation"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import TaskContent from "@/components/task/TaskContent"
import { fetchMatdevProjectById, fetchMatdevTasksForProject } from "@/lib/server/matdev-projects"

const TasksPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [{ project }, { tasks }] = await Promise.all([fetchMatdevProjectById(id), fetchMatdevTasksForProject(id)])

    if (!project) {
        notFound()
    }

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <header className="flex items-center justify-between">
                <h1>
                    {project.projectName} <span className="font-normal">/ Tasks</span>
                </h1>

                <ProjectSidebar status={project.status} deadline={project.deadline} />
            </header>

            <TaskContent tasks={tasks} />
        </div>
    )
}

export default TasksPage
