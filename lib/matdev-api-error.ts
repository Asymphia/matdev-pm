/** Parse JSON error body from matdev API (ProblemDetails / ResponseModel). */
import { toUserFacingError } from "@/lib/user-facing-errors"

export async function parseMatdevApiError(res: Response, fallback?: string): Promise<string> {
    const defaultMsg = fallback ?? `HTTP ${res.status}`
    try {
        const j = (await res.json()) as { message?: string; title?: string; errors?: Record<string, string[]> }
        if (j.message) return j.message
        if (j.title) return j.title
        if (j.errors && typeof j.errors === "object") {
            const parts = Object.entries(j.errors).flatMap(([k, v]) =>
                Array.isArray(v) ? v.map(x => `${k}: ${x}`) : [],
            )
            if (parts.length) return parts.join("; ")
        }
    } catch {
        // non-JSON body
    }
    if (res.status === 404) return "Nie znaleziono zasobu (404)."
    if (res.status >= 500) return "Błąd serwera API — spróbuj odświeżyć stronę."
    return toUserFacingError(defaultMsg, "api")
}

export function isMatdevApiUnavailable(status: number): boolean {
    return status === 404 || status === 502 || status === 503
}

export const LAB_API_UNAVAILABLE =
    "Moduł Lab nie jest dostępny — zrestartuj backend (docker compose build && docker compose up -d)."
