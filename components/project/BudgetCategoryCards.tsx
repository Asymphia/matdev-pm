"use client"

import CardTitle from "@/components/ui/CardTitle"
import { BUDGET_PALETTE } from "@/components/project/BudgetDonutChart"
import { formatNumber } from "@/lib/projects-helpers"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

type Props = {
    budget: ProjectBudget
}

const BudgetCategoryCards = ({ budget }: Props) => {
    const cards = budget.categories.filter(c => c.totalSpent > 0 || (c.allocatedAmount ?? 0) > 0)

    if (cards.length === 0) {
        return (
            <p className="text-text-primary-100 text-sm">
                No category allocations yet. Use &quot;Manage allocations&quot; to add categories and limits.
            </p>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((cat, i) => {
                const alloc = cat.allocatedAmount ?? 0
                const pct =
                    cat.categoryUtilizationPercent ??
                    (alloc > 0 ? Math.round((cat.totalSpent / alloc) * 100) : cat.totalSpent > 0 ? 100 : 0)
                const remaining = cat.remainingInCategory ?? (alloc > 0 ? alloc - cat.totalSpent : null)
                const color = BUDGET_PALETTE[i % BUDGET_PALETTE.length]

                return (
                    <div
                        key={cat.categoryId}
                        className="border-border bg-foreground flex flex-col gap-3 rounded-xl border p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-block size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                <CardTitle className="text-base">{cat.categoryName}</CardTitle>
                            </div>
                            {alloc > 0 && (
                                <span
                                    className={`text-xs font-medium ${pct >= 100 ? "text-error" : pct >= 70 ? "text-warning" : "text-text-primary-100"}`}
                                >
                                    {pct}%
                                </span>
                            )}
                        </div>
                        <div className="text-sm">
                            <p>
                                <span className="text-text-primary-100">Spent </span>
                                <span className="font-medium">{formatNumber(cat.totalSpent)} PLN</span>
                            </p>
                            {alloc > 0 ? (
                                <p className="text-text-primary-100 mt-1">
                                    Allocated {formatNumber(alloc)} PLN
                                    {remaining != null && (
                                        <span className={remaining < 0 ? "text-error" : ""}>
                                            {" "}
                                            · {remaining < 0 ? "Over" : "Left"} {formatNumber(Math.abs(remaining))} PLN
                                        </span>
                                    )}
                                </p>
                            ) : (
                                <p className="text-text-primary-100 mt-1">No allocation set</p>
                            )}
                        </div>
                        {alloc > 0 && (
                            <div className="bg-border h-2 overflow-hidden rounded-full">
                                <div
                                    className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-error" : pct >= 70 ? "bg-warning" : "bg-success"}`}
                                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct < 70 ? color : undefined }}
                                />
                            </div>
                        )}
                        <p className="text-text-primary-100 text-xs">
                            {cat.expenditures.length} expenditure{cat.expenditures.length === 1 ? "" : "s"}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}

export default BudgetCategoryCards
