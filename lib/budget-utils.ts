import { calculateBudgetDiff } from "@/lib/projects-helpers"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

export type BudgetSnapshot = {
    utilizationPercent: number
    isOverBudget: boolean
    overAmount: number
    displayFreeBudget: number
}

export function getBudgetSnapshot(budget: Pick<ProjectBudget, "totalAmount" | "totalSpent" | "freeBudget" | "utilizationPercent" | "isOverBudget" | "overAmount">): BudgetSnapshot {
    const utilizationPercent =
        budget.utilizationPercent ?? calculateBudgetDiff(budget.totalAmount, budget.totalSpent)
    const isOverBudget = budget.isOverBudget ?? budget.totalSpent > budget.totalAmount
    const overAmount = budget.overAmount ?? Math.max(0, budget.totalSpent - budget.totalAmount)
    const displayFreeBudget = isOverBudget ? 0 : Math.max(0, budget.freeBudget)

    return { utilizationPercent, isOverBudget, overAmount, displayFreeBudget }
}

export function isBudgetRelatedRisk(description: string): boolean {
    const d = description.toLowerCase()
    return d.includes("budget") || d.includes("budżet") || d.includes("expenditure") || d.includes("wydatek") || d.includes("overspend") || d.includes("allocation") || d.includes("alokac")
}
