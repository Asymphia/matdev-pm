import { notFound } from "next/navigation"
import TaskContent from "@/components/task/TaskContent"
import { fetchMatdevTasksForProject } from "@/lib/server/matdev-projects"

const TasksPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const { tasks } = await fetchMatdevTasksForProject(id)

    return <TaskContent tasks={tasks} projectId={id} />
}

export default TasksPage
