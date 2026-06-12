"use server"

import { matdevFetch } from "@/lib/matdev-http"

type ApiResponseModel<T> = {
    data?: T
    message?: string | null
}

export type DemoDataResult =
    | { ok: true; projectCount: number; message?: string }
    | { ok: false; error: string; status?: number }

async function postDemoEndpoint(path: string): Promise<DemoDataResult> {
    try {
        const res = await matdevFetch(path, { method: "POST" })
        if (res.status === 404) {
            return {
                ok: false,
                error: "Endpoint niedostępny (uruchom API w trybie Development lub włącz DemoSeed:Enabled).",
                status: 404,
            }
        }
        if (!res.ok) {
            return { ok: false, error: res.statusText || "HTTP error", status: res.status }
        }
        const json = (await res.json()) as ApiResponseModel<{ projectCount?: number }>
        return {
            ok: true,
            projectCount: json.data?.projectCount ?? 0,
            message: json.message ?? undefined,
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { ok: false, error: message }
    }
}

/** Adds demo projects if BW-2026 is missing (does not delete existing data). */
export async function seedDemoData(): Promise<DemoDataResult> {
    return postDemoEndpoint("/api/dev/seed-demo")
}

/** Clears transactional data and loads full Borg Warner demo dataset. */
export async function resetDemoData(): Promise<DemoDataResult> {
    return postDemoEndpoint("/api/dev/reset-demo")
}
