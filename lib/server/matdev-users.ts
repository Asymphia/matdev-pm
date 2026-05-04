import { matdevFetch } from "@/lib/matdev-http"
import { mapApiUserToUserType, type ApiGetUserDTO } from "@/lib/matdev-user-map"
import type { UserType } from "@/lib/data"

type ApiResponseModel<T> = {
    data?: T
    message?: string | null
}

export async function fetchMatdevUsers(): Promise<{ users: UserType[]; error: string | null }> {
    try {
        const res = await matdevFetch("/api/user")
        if (!res.ok) {
            return { users: [], error: `Użytkownicy: HTTP ${res.status}` }
        }
        const json = (await res.json()) as ApiResponseModel<ApiGetUserDTO[]>
        const data = json.data
        if (!Array.isArray(data)) {
            return { users: [], error: "Użytkownicy: niepoprawna odpowiedź API" }
        }
        return { users: data.map(mapApiUserToUserType), error: null }
    } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error"
        return { users: [], error: message }
    }
}
