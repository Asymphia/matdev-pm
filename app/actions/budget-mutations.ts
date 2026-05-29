"use server"

import { matdevFetch } from "@/lib/matdev-http"
import type { ProjectBudget } from "@/lib/server/matdev-budget"

type BudgetResult = { ok: true; data: ProjectBudget } | { ok: false; error: string }

async function parseError(res: Response): Promise<string> {
    try {
        const j = await res.json()
        return j?.message ?? j?.title ?? `HTTP ${res.status}`
    } catch {
        return `HTTP ${res.status}`
    }
}

export async function fetchBudgetCategories(projectId: number): Promise<{ ok: true; categories: { categoryId: number; categoryName: string }[] } | { ok: false; error: string }> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/categories`)
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, categories: Array.isArray(json.data) ? json.data : [] }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateBudgetPlan(projectId: number, name: string, amount: number): Promise<BudgetResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount }),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function addExpenditure(
    projectId: number,
    categoryId: number,
    amount: number,
    transactionDate: string,
    description: string,
    field: string,
): Promise<BudgetResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/expenditures`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoryId,
                amount,
                transactionDate: transactionDate.includes("T") ? transactionDate : `${transactionDate}T00:00:00Z`,
                description,
                field,
            }),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteExpenditure(projectId: number, expenditureId: number): Promise<BudgetResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/expenditures/${expenditureId}`, {
            method: "DELETE",
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
