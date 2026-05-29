"use client"

import { useState, useTransition } from "react"
import { pingMatdevBackend, probeMatdevProjects, type MatdevPingResult, type MatdevProjectsProbeResult } from "@/app/actions/matdev-backend"
import Button from "@/components/ui/Button"

type Props = {
    initialPing: MatdevPingResult
    initialProjects: MatdevProjectsProbeResult
}

const BackendConnectionCard = ({ initialPing, initialProjects }: Props) => {
    const [ping, setPing] = useState(initialPing)
    const [projects, setProjects] = useState(initialProjects)
    const [pending, startTransition] = useTransition()

    const runChecks = () => {
        startTransition(async () => {
            const [p, pr] = await Promise.all([pingMatdevBackend(), probeMatdevProjects()])
            setPing(p)
            setProjects(pr)
        })
    }

    return (
        <section className="border-border max-w-xl rounded-lg border p-6">
            <h2 className="mb-1 text-lg font-semibold">Backend API</h2>
            <p className="text-text-primary-300 mb-4 text-sm">
                Server actions call <code className="text-xs">MATDEV_API_BASE_URL</code> (default{" "}
                <code className="text-xs">http://localhost:5196</code>). Uruchom API profil <code className="text-xs">http</code>.
            </p>

            <dl className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                    <dt className="text-text-primary-300">GET /api/health</dt>
                    <dd>
                        {ping.ok ? (
                            <span className="text-green-700 dark:text-green-400">
                                OK · {ping.latencyMs} ms{ping.utc ? ` · ${ping.utc}` : ""}
                            </span>
                        ) : (
                            <span className="text-red-700 dark:text-red-400">
                                {ping.error}
                                {ping.status != null ? ` (${ping.status})` : ""}
                            </span>
                        )}
                    </dd>
                </div>
                <div className="flex justify-between gap-4">
                    <dt className="text-text-primary-300">GET /api/project</dt>
                    <dd>
                        {projects.ok ? (
                            <span className="text-green-700 dark:text-green-400">OK · {projects.projectCount} projects</span>
                        ) : (
                            <span className="text-red-700 dark:text-red-400">
                                {projects.error}
                                {projects.status != null ? ` (${projects.status})` : ""}
                            </span>
                        )}
                    </dd>
                </div>
            </dl>

            <Button type="button" onClick={runChecks} disabled={pending}>
                {pending ? "Sprawdzam…" : "Ping ponownie"}
            </Button>
        </section>
    )
}

export default BackendConnectionCard
