import { DUMMY_PROJECTS_DATA, DUMMY_TASKS_DATA } from "@/lib/data"
import { notFound } from "next/navigation"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import TaskContent from "@/components/task/TaskContent"

const TasksPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const project = DUMMY_PROJECTS_DATA.find(project => project.id === Number(projectSlug))

    if (!project) {
        notFound()
    }

    const tasks = DUMMY_TASKS_DATA.filter(task => project.id === task.projectId)

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
