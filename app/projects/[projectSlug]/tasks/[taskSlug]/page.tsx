import { notFound } from "next/navigation"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import ProjectDescription from "@/components/project/ProjectDescription"
import TaskDetails from "@/components/task/TaskDetails"
import TaskContent from "@/components/task/TaskContent"
import { fetchMatdevProjectById, fetchMatdevTasksForProject } from "@/lib/server/matdev-projects"

const TaskPage = async ({ params }: { params: Promise<{ projectSlug: string; taskSlug: string }> }) => {
    const { projectSlug, taskSlug } = await params
    const projectId = Number(projectSlug)
    const taskId = Number(taskSlug)
    if (!Number.isFinite(projectId) || !Number.isFinite(taskId)) {
        notFound()
    }

    const [{ project }, { tasks }] = await Promise.all([fetchMatdevProjectById(projectId), fetchMatdevTasksForProject(projectId)])

    if (!project) {
        notFound()
    }

    const task = tasks.find(t => t.id === taskId)

    if (!task) {
        notFound()
    }

    const subTasks = tasks.filter(t => t.parentId === task.id)

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <header className="flex items-center justify-between">
                <h1>
                    {project.projectName} <span className="font-normal"> / {task.name}</span>
                </h1>

                <ProjectSidebar status={task.status} deadline={task.endDate} />
            </header>

            <div className="grid grid-cols-2 gap-4">
                <ProjectDescription description={task.description} />

                <TaskDetails task={task} />
            </div>

            <TaskContent tasks={subTasks} projectId={task.projectId} />
        </div>
    )
}

export default TaskPage
