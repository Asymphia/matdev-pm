/** Maps technical errors to short Polish messages for the UI. */
export function toUserFacingError(error: unknown, context?: "api" | "network" | "upload" | "generic"): string {
    const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "Nieznany błąd"
    const lower = raw.toLowerCase()

    if (lower.includes("timeout") || lower.includes("abort")) {
        return "Serwer nie odpowiada (timeout). Uruchom backend na porcie 5196 i spróbuj ponownie."
    }
    if (
        lower.includes("fetch failed") ||
        lower.includes("econnrefused") ||
        lower.includes("network") ||
        lower.includes("failed to fetch")
    ) {
        return "Brak połączenia z API. Sprawdź Docker / profil http w Visual Studio."
    }
    if (lower.includes("404") && context === "api") {
        return "Endpoint API niedostępny — przebuduj kontener (docker compose build matdev.api)."
    }
    if (lower.includes("500") || lower.includes("serwera")) {
        return "Błąd serwera API. Sprawdź logi backendu i spróbuj ponownie."
    }
    if (context === "upload" && lower.includes("not allowed")) {
        return "Niedozwolony typ pliku. Dozwolone: PDF, Office, CSV, PNG, JPG."
    }
    if (raw.length > 180) {
        return `${raw.slice(0, 177)}…`
    }
    return raw
}

export function combineErrors(...parts: (string | null | undefined)[]): string | null {
    const messages = parts.filter(Boolean) as string[]
    return messages.length > 0 ? messages.join(" · ") : null
}
