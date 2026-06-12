import { notFound } from "next/navigation"
import BudgetPageClient from "@/components/project/BudgetPageClient"
import {
    fetchBudgetCategories,
    fetchBudgetLines,
    fetchProjectBudget,
} from "@/lib/server/matdev-budget"
import { fetchProjectRisks } from "@/lib/server/matdev-risks"
import { fetchMatdevTasksForProject } from "@/lib/server/matdev-projects"

const ProjectBudgetPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [budget, categories, lines, risks, { tasks }] = await Promise.all([
        fetchProjectBudget(id),
        fetchBudgetCategories(id),
        fetchBudgetLines(id),
        fetchProjectRisks(id),
        fetchMatdevTasksForProject(id),
    ])

    const taskOptions = tasks.map(t => ({ taskId: t.id, taskName: t.name }))

    return (
        <BudgetPageClient
            projectId={id}
            initialBudget={budget}
            categories={categories}
            initialLines={lines}
            initialRisks={risks}
            taskOptions={taskOptions}
        />
    )
}

export default ProjectBudgetPage
