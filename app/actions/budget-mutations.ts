"use server"

import { matdevFetch } from "@/lib/matdev-http"
import type { BudgetPlanLine, ProjectBudget } from "@/lib/server/matdev-budget"

type BudgetResult = { ok: true; data: ProjectBudget } | { ok: false; error: string }

async function parseError(res: Response): Promise<string> {
    try {
        const j = await res.json()
        return j?.message ?? j?.title ?? `HTTP ${res.status}`
    } catch {
        return `HTTP ${res.status}`
    }
}

async function parseBudgetResponse(res: Response): Promise<BudgetResult> {
    if (!res.ok) return { ok: false, error: await parseError(res) }
    const json = await res.json()
    return { ok: true, data: json.data as ProjectBudget }
}

/** @deprecated use fetchBudgetCategories from lib/server/matdev-budget on server; this is for client modals */
export async function fetchBudgetCategories(projectId: number): Promise<
    { ok: true; categories: { categoryId: number; categoryName: string }[] } | { ok: false; error: string }
> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/categories`)
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, categories: Array.isArray(json.data) ? json.data : [] }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function createBudgetPlan(projectId: number, name: string, amount: number): Promise<BudgetResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, amount, currency: "PLN" }),
        })
        return await parseBudgetResponse(res)
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
        return await parseBudgetResponse(res)
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateBudgetLines(
    projectId: number,
    lines: { categoryId: number; allocatedAmount: number; alertThresholdPercent?: number | null }[],
): Promise<{ ok: true; lines: BudgetPlanLine[] } | { ok: false; error: string }> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/lines`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lines }),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, lines: Array.isArray(json.data) ? json.data : [] }
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
    taskId?: number | null,
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
                ...(taskId != null ? { taskId } : {}),
            }),
        })
        return await parseBudgetResponse(res)
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateExpenditure(
    projectId: number,
    expenditureId: number,
    categoryId: number,
    amount: number,
    transactionDate: string,
    description: string,
    field: string,
    taskId?: number | null,
): Promise<BudgetResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/expenditures/${expenditureId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoryId,
                amount,
                transactionDate: transactionDate.includes("T") ? transactionDate : `${transactionDate}T00:00:00Z`,
                description,
                field,
                taskId: taskId ?? null,
            }),
        })
        return await parseBudgetResponse(res)
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function createBudgetCategory(
    projectId: number,
    name: string,
    defaultAlertThresholdPercent?: number,
): Promise<
    { ok: true; category: { categoryId: number; categoryName: string; defaultAlertThreshold?: number | null } } | { ok: false; error: string }
> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                defaultAlertThresholdPercent: defaultAlertThresholdPercent ?? 80,
            }),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        const c = json.data
        return {
            ok: true,
            category: {
                categoryId: c.categoryId,
                categoryName: c.categoryName,
                defaultAlertThreshold: c.defaultAlertThreshold ?? null,
            },
        }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteExpenditure(projectId: number, expenditureId: number): Promise<BudgetResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/budget/expenditures/${expenditureId}`, {
            method: "DELETE",
        })
        return await parseBudgetResponse(res)
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
