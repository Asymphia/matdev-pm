import { getBudgetSnapshot } from "@/lib/budget-utils"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

/** Shared category colors — same in progress bar legend and charts. */
export const BUDGET_CATEGORY_COLORS = [
    "#2D4654",
    "#E8C468",
    "#629677",
    "#7B9EC0",
    "#C08B5C",
    "#A3C4A8",
    "#D4A5A5",
    "#8B6FA8",
] as const

export const BUDGET_REMAINING_COLOR = "#E8EAED"

export type BudgetSpendSlice = {
    categoryId: number
    name: string
    amount: number
    fill: string
    percentOfSpent: number
}

export function getBudgetSpendSlices(budget: ProjectBudget): BudgetSpendSlice[] {
    const totalSpent = budget.totalSpent
    if (totalSpent <= 0) return []

    return budget.categories
        .filter(c => c.totalSpent > 0)
        .map((c, i) => ({
            categoryId: c.categoryId,
            name: c.categoryName,
            amount: c.totalSpent,
            fill: BUDGET_CATEGORY_COLORS[i % BUDGET_CATEGORY_COLORS.length],
            percentOfSpent: Math.round((c.totalSpent / totalSpent) * 1000) / 10,
        }))
}

/** Donut data: only spent breakdown (never mixes “free budget” into spend chart). */
export function buildSpendDonutData(budget: ProjectBudget) {
    const slices = getBudgetSpendSlices(budget)
    if (slices.length === 0) {
        return {
            chartData: [{ name: "No spending", value: 1, fill: BUDGET_REMAINING_COLOR }],
            legendItems: [] as BudgetSpendSlice[],
            isEmpty: true,
        }
    }
    return {
        chartData: slices.map(s => ({ name: s.name, value: s.amount, fill: s.fill })),
        legendItems: slices,
        isEmpty: false,
    }
}

export function buildFullBudgetLegend(budget: ProjectBudget) {
    const { displayFreeBudget } = getBudgetSnapshot(budget)
    const spendLegend = getBudgetSpendSlices(budget)
    const free =
        displayFreeBudget > 0
            ? [{ name: "Remaining", amount: displayFreeBudget, fill: BUDGET_REMAINING_COLOR }]
            : []
    return [...spendLegend, ...free]
}
