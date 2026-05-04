"use server"

import { matdevFetch } from "@/lib/matdev-http"
import type { CreateProjectApiBody } from "@/lib/matdev-project-form"

export type CreateProjectResult = { ok: true } | { ok: false; error: string }
export type EditProjectBody = {
    projectId: number
    projectName: string | null
    topicId: number | null
    statusId: number | null
    priorityId: number | null
    issuetypeId: number | null
    respPeronId: number | null
    suppPersonId: number | null
    startDate: string | null
    endDate: string | null
    workpackageId: number | null
    description: string | null
}

export async function createMatdevProject(body: CreateProjectApiBody): Promise<CreateProjectResult> {
    try {
        const res = await matdevFetch("/api/project", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (res.status === 201) {
            return { ok: true }
        }

        let message = `HTTP ${res.status}`
        try {
            const j = (await res.json()) as { message?: string; errors?: Record<string, string[]> }
            if (j.message) {
                message = j.message
            }
            if (j.errors && typeof j.errors === "object") {
                const parts = Object.entries(j.errors).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}: ${x}`) : []))
                if (parts.length) {
                    message = parts.join("; ")
                }
            }
        } catch {
            // keep message
        }
        return { ok: false, error: message }
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        return { ok: false, error: msg }
    }
}

export async function updateMatdevProject(body: EditProjectBody): Promise<CreateProjectResult> {
    try {
        const res = await matdevFetch("/api/project", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (res.status === 200) {
            return { ok: true }
        }

        let message = `HTTP ${res.status}`
        try {
            const j = (await res.json()) as { message?: string; errors?: Record<string, string[]> }
            if (j.message) {
                message = j.message
            }
            if (j.errors && typeof j.errors === "object") {
                const parts = Object.entries(j.errors).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}: ${x}`) : []))
                if (parts.length) {
                    message = parts.join("; ")
                }
            }
        } catch {
            // keep message
        }
        return { ok: false, error: message }
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error"
        return { ok: false, error: msg }
    }
}
