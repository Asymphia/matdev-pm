import Link from "next/link"
import BlockWrapper from "@/components/ui/BlockWrapper"
import ProgressBar from "@/components/project/ProgressBar"
import { fetchMatdevProjects } from "@/lib/server/matdev-projects"
import { calculateBudgetDiff, formatNumber } from "@/lib/projects-helpers"

const BudgetsPage = async () => {
    const { projects, error } = await fetchMatdevProjects()
    const withBudget = projects.filter(p => p.budget > 0)
    const sorted = [...withBudget].sort((a, b) => {
        const pa = calculateBudgetDiff(a.budget, a.amountSpent)
        const pb = calculateBudgetDiff(b.budget, b.amountSpent)
        return pb - pa
    })

    return (
        <div className="flex h-full w-full flex-col gap-8">
            <header>
                <h1 className="text-2xl font-semibold">Budgets</h1>
                <p className="text-text-primary-100 mt-2 text-sm">
                    All projects with a budget plan — sorted by utilization (highest first).
                </p>
            </header>

            {error && (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">
                    Failed to load projects: {error}
                </p>
            )}

            <BlockWrapper className="overflow-x-auto">
                {sorted.length === 0 ? (
                    <p className="text-text-primary-100 text-sm">No projects with a budget plan yet.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-text-primary-100 border-border border-b text-left text-xs uppercase">
                                <th className="py-3 pr-4">Project</th>
                                <th className="py-3 pr-4">Plan (PLN)</th>
                                <th className="py-3 pr-4">Spent</th>
                                <th className="py-3 pr-4 min-w-48">Utilization</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(p => {
                                const pct = calculateBudgetDiff(p.budget, p.amountSpent)
                                const over = p.amountSpent > p.budget
                                return (
                                    <tr key={p.id} className="border-border border-b last:border-0">
                                        <td className="py-3 pr-4">
                                            <Link href={`/projects/${p.id}/budget`} className="text-primary-700 font-medium hover:underline">
                                                {p.projectName}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4">{formatNumber(p.budget)}</td>
                                        <td className="py-3 pr-4">{formatNumber(p.amountSpent)}</td>
                                        <td className="py-3 pr-4">
                                            <ProgressBar
                                                progress={Math.min(pct, 100)}
                                                limit={`${Math.round(pct)}%`}
                                            />
                                        </td>
                                        <td className="py-3">
                                            {over ? (
                                                <span className="text-error font-medium">Over budget</span>
                                            ) : pct >= 80 ? (
                                                <span className="text-warning font-medium">≥ 80%</span>
                                            ) : (
                                                <span className="text-text-primary-100">OK</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </BlockWrapper>
        </div>
    )
}

export default BudgetsPage
