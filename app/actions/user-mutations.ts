"use server"

import { matdevFetch } from "@/lib/matdev-http"

export type UserBody = {
    firstName: string
    lastName: string
    email: string | null
    phoneNumber: string | null
}

export type UserMutationResult = { ok: true } | { ok: false; error: string }

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

export async function createMatdevUser(body: UserBody): Promise<UserMutationResult> {
    try {
        const res = await matdevFetch("/api/user/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (res.status === 201) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateMatdevUser(userId: number, body: UserBody): Promise<UserMutationResult> {
    try {
        const res = await matdevFetch("/api/user/edit", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, ...body }),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteMatdevUser(userId: number): Promise<UserMutationResult> {
    try {
        const res = await matdevFetch(`/api/user/${userId}`, { method: "DELETE" })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
