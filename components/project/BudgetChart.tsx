"use client"

/**
 * @deprecated Use BudgetMiniWidget on Overview and BudgetPageClient on /budget tab.
 * Kept for imports that still reference BudgetChart.
 */
import BudgetMiniWidget from "@/components/project/BudgetMiniWidget"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

type Props = {
    budget: ProjectBudget | null
    projectId: number
}

const BudgetChart = ({ budget, projectId }: Props) => (
    <BudgetMiniWidget budget={budget} projectId={projectId} />
)

export default BudgetChart
