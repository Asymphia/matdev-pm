import { BUDGET_CATEGORY_COLORS } from "@/components/project/budget-chart-data"
import { getBudgetSnapshot } from "@/lib/budget-utils"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

export type BudgetExpenditureRow = {
    amount: number
    transactionDate: string
    taskId?: number | null
    categoryId: number
    categoryName: string
}

export type TaskSpendRow = {
    taskId: number
    taskName: string
    total: number
    count: number
}

export type BudgetStatsSummary = {
    planTotal: number
    totalSpent: number
    remaining: number
    utilizationPercent: number
    isOverBudget: boolean
    overAmount: number
    expenditureCount: number
    categoriesWithSpend: number
    taskLinkedSpend: number
    unlinkedSpend: number
    avgExpenditure: number
}

export type CategoryBarRow = {
    name: string
    spent: number
    allocated: number
    fill: string
}

export type MonthBarRow = {
    key: string
    label: string
    total: number
}

export type MonthTrendRow = {
    key: string
    label: string
    monthly: number
    cumulative: number
}

function monthLabel(key: string): string {
    const [y, m] = key.split("-").map(Number)
    if (!y || !m) return key
    return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
}

export function buildBudgetStatsSummary(
    budget: ProjectBudget,
    expenditures: BudgetExpenditureRow[],
): BudgetStatsSummary {
    const snap = getBudgetSnapshot(budget)
    const taskLinkedSpend = expenditures
        .filter(e => e.taskId != null)
        .reduce((s, e) => s + e.amount, 0)

    return {
        planTotal: budget.totalAmount,
        totalSpent: budget.totalSpent,
        remaining: snap.displayFreeBudget,
        utilizationPercent: snap.utilizationPercent,
        isOverBudget: snap.isOverBudget,
        overAmount: snap.overAmount,
        expenditureCount: expenditures.length,
        categoriesWithSpend: budget.categories.filter(c => c.totalSpent > 0).length,
        taskLinkedSpend,
        unlinkedSpend: Math.max(0, budget.totalSpent - taskLinkedSpend),
        avgExpenditure: expenditures.length > 0 ? budget.totalSpent / expenditures.length : 0,
    }
}

export function buildCategoryBarRows(budget: ProjectBudget): CategoryBarRow[] {
    return budget.categories
        .filter(c => c.totalSpent > 0 || (c.allocatedAmount ?? 0) > 0)
        .map((c, i) => ({
            name: c.categoryName,
            spent: c.totalSpent,
            allocated: c.allocatedAmount ?? 0,
            fill: BUDGET_CATEGORY_COLORS[i % BUDGET_CATEGORY_COLORS.length],
        }))
        .sort((a, b) => b.spent - a.spent)
}

export function buildTaskBarRows(rows: TaskSpendRow[], limit = 8): { name: string; total: number }[] {
    return rows.slice(0, limit).map(r => ({
        name: r.taskName.length > 28 ? `${r.taskName.slice(0, 26)}…` : r.taskName,
        total: r.total,
    }))
}

export function buildMonthlyBarRows(expenditures: BudgetExpenditureRow[]): MonthBarRow[] {
    const map = new Map<string, number>()
    for (const e of expenditures) {
        const d = new Date(e.transactionDate)
        if (Number.isNaN(d.getTime())) continue
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        map.set(key, (map.get(key) ?? 0) + e.amount)
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, total]) => ({ key, label: monthLabel(key), total }))
}

/** Monthly spend + running total of budget expenditures (PLN). */
export function buildMonthlyTrendRows(expenditures: BudgetExpenditureRow[]): MonthTrendRow[] {
    let cumulative = 0
    return buildMonthlyBarRows(expenditures).map(row => {
        cumulative += row.total
        return {
            key: row.key,
            label: row.label,
            monthly: row.total,
            cumulative,
        }
    })
}

export function buildTaskLinkRows(summary: BudgetStatsSummary): { name: string; value: number }[] {
    const rows = [
        { name: "Linked to tasks", value: summary.taskLinkedSpend },
        { name: "Not linked", value: summary.unlinkedSpend },
    ]
    return rows.filter(r => r.value > 0)
}
