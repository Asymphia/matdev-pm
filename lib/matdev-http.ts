import { getMatdevApiBaseUrl } from "@/lib/matdev-api-env"

const DEFAULT_TIMEOUT_MS = 20_000

export async function matdevFetch(path: string, init?: RequestInit) {
    const base = getMatdevApiBaseUrl()
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

    try {
        const headers: Record<string, string> = { Accept: "application/json" }
        if (init?.headers) {
            const extra = init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : init.headers
            Object.assign(headers, extra)
        }
        if (!(init?.body instanceof FormData) && init?.body != null && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json"
        }

        return await fetch(url, {
            ...init,
            cache: "no-store",
            signal: init?.signal ?? controller.signal,
            headers,
        })
    } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
            throw new Error("API nie odpowiada (timeout). Sprawdź czy backend działa.")
        }
        throw e
    } finally {
        clearTimeout(timeout)
    }
}
