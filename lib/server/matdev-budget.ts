import { matdevFetch } from "@/lib/matdev-http"

export type BudgetExpenditure = {
    expenditureId: number
    categoryId?: number
    categoryName: string
    amount: number
    transactionDate: string
    description: string
    field: string
    taskId?: number | null
    taskName?: string | null
}

export type BudgetCategorySpend = {
    categoryId: number
    categoryName: string
    totalSpent: number
    allocatedAmount?: number
    remainingInCategory?: number
    categoryUtilizationPercent?: number
    expenditures: BudgetExpenditure[]
}

export type ProjectBudget = {
    planId: number
    planName: string
    totalAmount: number
    totalSpent: number
    freeBudget: number
    utilizationPercent?: number
    isOverBudget?: boolean
    overAmount?: number
    categories: BudgetCategorySpend[]
}

export type BudgetPlanLine = {
    categoryId: number
    categoryName?: string
    allocatedAmount: number
    alertThresholdPercent?: number | null
}

export type BudgetCategoryOption = {
    categoryId: number
    categoryName: string
    defaultAlertThreshold?: number | null
}

type ApiResponse<T> = { data?: T; message?: string }

export async function fetchProjectBudget(projectId: number): Promise<ProjectBudget | null> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget`, { cache: "no-store" })
        if (res.status === 404) return null
        if (!res.ok) return null
        const json = (await res.json()) as ApiResponse<ProjectBudget>
        return json.data ?? null
    } catch {
        return null
    }
}

export async function fetchBudgetCategories(projectId: number): Promise<BudgetCategoryOption[]> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/categories`, { cache: "no-store" })
        if (!res.ok) return []
        const json = (await res.json()) as ApiResponse<BudgetCategoryOption[]>
        const list = Array.isArray(json.data) ? json.data : []
        return list.map(c => ({
            categoryId: c.categoryId,
            categoryName: c.categoryName,
            defaultAlertThreshold:
                c.defaultAlertThreshold != null && c.defaultAlertThreshold <= 100
                    ? c.defaultAlertThreshold
                    : null,
        }))
    } catch {
        return []
    }
}

export async function fetchBudgetLines(projectId: number): Promise<BudgetPlanLine[]> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/lines`, { cache: "no-store" })
        if (res.status === 404 || !res.ok) return []
        const json = (await res.json()) as ApiResponse<BudgetPlanLine[]>
        return Array.isArray(json.data) ? json.data : []
    } catch {
        return []
    }
}
