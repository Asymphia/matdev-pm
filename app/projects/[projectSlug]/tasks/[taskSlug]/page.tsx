import { notFound } from "next/navigation"
import TaskViewClient from "@/components/task/TaskViewClient"
import { fetchMatdevProjectById } from "@/lib/server/matdev-projects"
import { fetchTaskView } from "@/lib/server/matdev-task-view"
import { fetchMatdevUsers } from "@/lib/server/matdev-users"
import { fetchBudgetCategories, fetchProjectBudget } from "@/lib/server/matdev-budget"
import Link from "next/link"
import { ChevronRightIcon } from "@heroicons/react/24/outline"

const TaskPage = async ({ params }: { params: Promise<{ projectSlug: string; taskSlug: string }> }) => {
    const { projectSlug, taskSlug } = await params
    const projectId = Number(projectSlug)
    const taskId = Number(taskSlug)
    if (!Number.isFinite(projectId) || !Number.isFinite(taskId)) {
        notFound()
    }

    const [{ project }, { data: taskView, error: taskError }, { users }, budget, budgetCategories] = await Promise.all([
        fetchMatdevProjectById(projectId),
        fetchTaskView(projectId, taskId),
        fetchMatdevUsers(),
        fetchProjectBudget(projectId),
        fetchBudgetCategories(projectId),
    ])

    if (!project) notFound()
    // Only treat a missing task as 404 when there is no API error; a server failure
    // should surface the error banner rather than a misleading 404 page.
    if (!taskView && !taskError) notFound()

    const allUsers = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.secondName, email: u.email, phone: u.phone }))

    return (
        <div className="flex h-full w-full flex-col gap-8">
            {taskError && (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">{taskError}</p>
            )}

            {taskView && (
                <>
                    <header className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/projects" className="hover:text-primary-700 transition-colors">Projects</Link>
                        <ChevronRightIcon className="size-4" />
                        <Link href={`/projects/${projectId}`} className="hover:text-primary-700 transition-colors">{project.projectName}</Link>
                        <ChevronRightIcon className="size-4" />
                        <Link href={`/projects/${projectId}/tasks`} className="hover:text-primary-700 transition-colors">Tasks</Link>
                        <ChevronRightIcon className="size-4" />
                        <span className="text-foreground font-medium">{taskView.topbar.taskName}</span>
                    </header>

                    <h1>
                        {project.projectName}
                        <span className="font-normal"> / {taskView.topbar.taskName}</span>
                    </h1>

                    <TaskViewClient
                        projectId={projectId}
                        taskId={taskId}
                        taskView={taskView}
                        allUsers={allUsers}
                        budgetCategories={budgetCategories}
                        hasBudgetPlan={budget != null}
                    />
                </>
            )}
        </div>
    )
}

export default TaskPage
