"use server"

import { matdevFetch } from "@/lib/matdev-http"

export type TagKind = "issue" | "topic" | "workpackage"
export type TagMutationResult = { ok: true } | { ok: false; error: string }

const endpointByKind: Record<TagKind, string> = {
    issue: "/api/issuetype",
    topic: "/api/topic",
    workpackage: "/api/workpackage",
}

const idFieldByKind: Record<TagKind, string> = {
    issue: "issueTypeId",
    topic: "topicId",
    workpackage: "workpackageId",
}

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

export async function createTag(kind: TagKind, name: string): Promise<TagMutationResult> {
    try {
        const res = await matdevFetch(endpointByKind[kind], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
        if (res.status === 201) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function updateTag(kind: TagKind, id: number, name: string): Promise<TagMutationResult> {
    try {
        const body = { [idFieldByKind[kind]]: id, name }
        const res = await matdevFetch(endpointByKind[kind], {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteTag(kind: TagKind, id: number): Promise<TagMutationResult> {
    try {
        const res = await matdevFetch(`${endpointByKind[kind]}/${id}`, { method: "DELETE" })
        if (res.ok) return { ok: true }
        return { ok: false, error: await parseError(res) }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
