import { DUMMY_PROJECTS_DATA, DUMMY_TASKS_DATA } from "@/lib/data"
import { notFound } from "next/navigation"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import ProjectDescription from "@/components/project/ProjectDescription"
import TaskDetails from "@/components/task/TaskDetails"
import TaskContent from "@/components/task/TaskContent"

const TaskPage = async ({ params }: { params: { projectSlug: string; taskSlug: string } }) => {
    const { projectSlug, taskSlug } = await params
    const project = DUMMY_PROJECTS_DATA.find(project => project.id === Number(projectSlug))

    if (!project) {
        notFound()
    }

    const task = DUMMY_TASKS_DATA.find(task => task.projectId === project.id && task.id === Number(taskSlug))

    if (!task) {
        notFound()
    }

    const subTasks = DUMMY_TASKS_DATA.filter(t => t.parentId === task.id)

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

            <TaskContent tasks={subTasks} />
        </div>
    )
}

export default TaskPage
