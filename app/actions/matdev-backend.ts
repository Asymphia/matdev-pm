"use server"

import { matdevFetch } from "@/lib/matdev-http"
import { toUserFacingError } from "@/lib/user-facing-errors"

export type MatdevPingResult =
    | { ok: true; latencyMs: number; utc?: string }
    | { ok: false; latencyMs: number; error: string; status?: number }

export type MatdevProjectsProbeResult =
    | { ok: true; projectCount: number; message?: string }
    | { ok: false; error: string; status?: number }

/** Server action: lightweight connectivity check to the .NET API. */
export async function pingMatdevBackend(): Promise<MatdevPingResult> {
    const started = performance.now()
    try {
        const res = await matdevFetch("/api/health")
        const latencyMs = Math.round(performance.now() - started)
        if (!res.ok) {
            return { ok: false, latencyMs, error: toUserFacingError(res.statusText || "HTTP error", "api"), status: res.status }
        }
        let utc: string | undefined
        try {
            const body = (await res.json()) as { utc?: string }
            utc = body.utc
        } catch {
            // ignore parse errors; ping still succeeded
        }
        return { ok: true, latencyMs, utc }
    } catch (e) {
        const latencyMs = Math.round(performance.now() - started)
        const message = e instanceof Error ? e.message : "Unknown error"
        return { ok: false, latencyMs, error: toUserFacingError(message, "network") }
    }
}

/** Server action: verifies project list endpoint (shape from API may differ from UI mocks). */
export async function probeMatdevProjects(): Promise<MatdevProjectsProbeResult> {
    try {
        const res = await matdevFetch("/api/project")
        if (!res.ok) {
            return { ok: false, error: toUserFacingError(res.statusText || "HTTP error", "api") }
        }
        const json = (await res.json()) as {
            data?: unknown
            message?: string
        }
        const data = json.data
        const projectCount = Array.isArray(data) ? data.length : 0
        return { ok: true, projectCount, message: json.message }
    } catch (e) {
        return { ok: false, error: toUserFacingError(e, "network") }
    }
}
