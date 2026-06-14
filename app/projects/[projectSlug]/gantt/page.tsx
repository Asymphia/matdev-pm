import { notFound } from "next/navigation"
import ProjectGanttChart from "@/components/project/ProjectGanttChart"
import { fetchMatdevProjectById, fetchMatdevTasksForProject } from "@/lib/server/matdev-projects"

const ProjectGanttPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [{ project }, { tasks }] = await Promise.all([
        fetchMatdevProjectById(id),
        fetchMatdevTasksForProject(id),
    ])

    if (!project) {
        notFound()
    }

    return (
        <ProjectGanttChart
            tasks={tasks}
            projectId={id}
            projectStart={project.startDate}
            projectDeadline={project.deadline}
        />
    )
}

export default ProjectGanttPage
