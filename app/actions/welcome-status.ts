"use server"

import { pingMatdevBackend, probeMatdevProjects } from "@/app/actions/matdev-backend"
import { fetchMatdevUsers } from "@/lib/server/matdev-users"
import { toUserFacingError } from "@/lib/user-facing-errors"
import type { UserType } from "@/lib/data"

export type WelcomeStatus = {
    apiOnline: boolean
    apiLatencyMs: number | null
    apiError: string | null
    projectCount: number
    projectsError: string | null
    users: UserType[]
    usersError: string | null
}

export async function checkWelcomeStatus(): Promise<WelcomeStatus> {
    const [usersRes, ping, projects] = await Promise.all([
        fetchMatdevUsers(),
        pingMatdevBackend(),
        probeMatdevProjects(),
    ])

    return {
        apiOnline: ping.ok,
        apiLatencyMs: ping.ok ? ping.latencyMs : null,
        apiError: ping.ok ? null : toUserFacingError(ping.error, "api"),
        projectCount: projects.ok ? projects.projectCount : 0,
        projectsError: projects.ok ? null : toUserFacingError(projects.error, "api"),
        users: usersRes.users,
        usersError: usersRes.error ? toUserFacingError(usersRes.error, "api") : null,
    }
}
