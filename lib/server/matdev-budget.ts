import { matdevFetch } from "@/lib/matdev-http"

export type BudgetExpenditure = {
    expenditureId: number
    categoryName: string
    amount: number
    transactionDate: string
    description: string
    field: string
}

export type BudgetCategorySpend = {
    categoryId: number
    categoryName: string
    totalSpent: number
    expenditures: BudgetExpenditure[]
}

export type ProjectBudget = {
    planId: number
    planName: string
    totalAmount: number
    totalSpent: number
    freeBudget: number
    categories: BudgetCategorySpend[]
}

export async function fetchProjectBudget(projectId: number): Promise<ProjectBudget | null> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget`, { cache: "no-store" })
        if (!res.ok) return null
        const json = await res.json()
        return json.data as ProjectBudget
    } catch {
        return null
    }
}
