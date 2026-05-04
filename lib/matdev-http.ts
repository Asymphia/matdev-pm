import { getMatdevApiBaseUrl } from "@/lib/matdev-api-env"

export async function matdevFetch(path: string, init?: RequestInit) {
    const base = getMatdevApiBaseUrl()
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`
    return fetch(url, {
        ...init,
        cache: "no-store",
        headers: {
            Accept: "application/json",
            ...init?.headers,
        },
    })
}
