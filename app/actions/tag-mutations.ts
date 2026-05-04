"use server"

import { matdevFetch } from "@/lib/matdev-http"

export type TagKind = "issue" | "topic" | "workpackage"
export type CreateTagResult = { ok: true } | { ok: false; error: string }

const endpointByKind: Record<TagKind, string> = {
    issue: "/api/issuetype",
    topic: "/api/topic",
    workpackage: "/api/workpackage",
}

export async function createTag(kind: TagKind, name: string): Promise<CreateTagResult> {
    try {
        const res = await matdevFetch(endpointByKind[kind], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
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
            // ignore
        }
        return { ok: false, error: message }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
