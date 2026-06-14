"use server"

import { matdevFetch } from "@/lib/matdev-http"

export type ProjectViewMutationResult = { ok: true } | { ok: false; error: string }

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
    if (res.status >= 500) return "Błąd serwera API — spróbuj ponownie."
    return message
}

export async function changeProjectStatus(projectId: number, projectStatusId: number): Promise<ProjectViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/view/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectStatusId }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function changeProjectDeadline(projectId: number, endDate: string): Promise<ProjectViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/view/deadline`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endDate }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function assignUserToProject(projectId: number, userId: number, isResponsible: boolean): Promise<ProjectViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/view/assigned-users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, isResponsible }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function removeUserFromProject(projectId: number, userId: number): Promise<ProjectViewMutationResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/view/assigned-users/${userId}`, { method: "DELETE" })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
