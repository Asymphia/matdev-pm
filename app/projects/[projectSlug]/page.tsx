import { DUMMY_PROJECTS_DATA, DUMMY_TASKS_DATA } from "@/lib/data"
import { notFound } from "next/navigation"
import ProjectDescription from "@/components/project/ProjectDescription"
import TasksList from "@/components/project/TasksList"
import BudgetChart from "@/components/project/BudgetChart"

const SingleProjectPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const project = DUMMY_PROJECTS_DATA.find(project => project.id === Number(projectSlug))

    if (!project) {
        notFound()
    }

    const tasks = DUMMY_TASKS_DATA.filter(task => project.id === task.projectId)

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <h1>{project.projectName}</h1>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <ProjectDescription description={project.description} />

                    <TasksList tasks={tasks} />
                </div>

                <div className="flex flex-col gap-4">
                    <BudgetChart />
                </div>
            </div>
        </div>
    )
}

export default SingleProjectPage
