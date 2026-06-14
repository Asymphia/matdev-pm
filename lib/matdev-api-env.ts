/** Base URL of the matdev API (no trailing slash). Server-only unless exposed via NEXT_PUBLIC_. */
export function getMatdevApiBaseUrl(): string {
    const raw = process.env.MATDEV_API_BASE_URL ?? "http://127.0.0.1:5196"
    return raw.replace(/\/$/, "")
}
