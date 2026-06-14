"use server"

import { matdevFetch } from "@/lib/matdev-http"

export type TaskCategoryMutationResult = { ok: true } | { ok: false; error: string }

async function parseError(res: Response): Promise<string> {
    let message = `HTTP ${res.status}`
    try {
        const j = (await res.json()) as { message?: string; errors?: Record<string, string[]> }
        if (j.message) message = j.message
        if (j.errors && typeof j.errors === "object") {
            const parts = Object.entries(j.errors).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}: ${x}`) : []))
            if (parts.length) message = parts.join("; ")
        }
    } catch {
        // keep default
    }
    return message
}

export async function createTaskCategory(name: string): Promise<TaskCategoryMutationResult> {
    try {
        const res = await matdevFetch("/api/taskcategory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        if (res.status === 201 || res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateTaskCategory(taskCategoryId: number, name: string): Promise<TaskCategoryMutationResult> {
    try {
        const res = await matdevFetch("/api/taskcategory", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskCategoryId, name }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteTaskCategory(taskCategoryId: number): Promise<TaskCategoryMutationResult> {
    try {
        const res = await matdevFetch(`/api/taskcategory/${taskCategoryId}`, { method: "DELETE" })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
