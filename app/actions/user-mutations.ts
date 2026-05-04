"use server"

import { matdevFetch } from "@/lib/matdev-http"

export type CreateUserBody = {
    firstName: string
    lastName: string
    email: string | null
    phoneNumber: string | null
}

export type CreateUserResult = { ok: true } | { ok: false; error: string }

export async function createMatdevUser(body: CreateUserBody): Promise<CreateUserResult> {
    try {
        const res = await matdevFetch("/api/user/create", {
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
            if (j.message) message = j.message
            if (j.errors && typeof j.errors === "object") {
                const parts = Object.entries(j.errors).flatMap(([k, v]) => (Array.isArray(v) ? v.map(x => `${k}: ${x}`) : []))
                if (parts.length) message = parts.join("; ")
            }
        } catch {
            // keep message
        }
        return { ok: false, error: message }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
