"use server"

import { matdevFetch } from "@/lib/matdev-http"
import type { ProjectRisk } from "@/lib/server/matdev-risks"

type RiskResult = { ok: true; data: ProjectRisk } | { ok: false; error: string }
type DeleteResult = { ok: true } | { ok: false; error: string }
type ListResult = { ok: true; data: ProjectRisk[] } | { ok: false; error: string }

export async function fetchRisks(projectId: number): Promise<ListResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/risks`, { cache: "no-store" })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: (json.data ?? []) as ProjectRisk[] }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

async function parseError(res: Response): Promise<string> {
    try {
        const j = await res.json()
        return j?.message ?? j?.title ?? `HTTP ${res.status}`
    } catch {
        return `HTTP ${res.status}`
    }
}

export async function createRisk(projectId: number, severity: string, description: string): Promise<RiskResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/risks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ severity, description }),
        })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function resolveRisk(projectId: number, riskId: number): Promise<RiskResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/risks/${riskId}/resolve`, { method: "PATCH" })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        const json = await res.json()
        return { ok: true, data: json.data }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}

export async function deleteRisk(projectId: number, riskId: number): Promise<DeleteResult> {
    try {
        const res = await matdevFetch(`/api/project/${projectId}/risks/${riskId}`, { method: "DELETE" })
        if (!res.ok) return { ok: false, error: await parseError(res) }
        return { ok: true }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Unknown error" }
    }
}
