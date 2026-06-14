"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type Tab = { href: string; label: string; match: (path: string) => boolean }

const ProjectTabs = ({ projectSlug }: { projectSlug: string }) => {
    const pathname = usePathname()
    const base = `/projects/${projectSlug}`

    const tabs: Tab[] = [
        { href: base, label: "Overview", match: p => p === base || p === `${base}/` },
        { href: `${base}/tasks`, label: "Tasks", match: p => p.startsWith(`${base}/tasks`) },
        { href: `${base}/gantt`, label: "Gantt", match: p => p.startsWith(`${base}/gantt`) },
        { href: `${base}/budget`, label: "Budget", match: p => p.startsWith(`${base}/budget`) },
        { href: `${base}/lab`, label: "Lab", match: p => p.startsWith(`${base}/lab`) },
    ]

    return (
        <nav className="border-border flex gap-1 border-b border-solid" aria-label="Project sections">
            {tabs.map(tab => {
                const active = tab.match(pathname.replace(/\/$/, ""))
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                            active ? "text-primary-700" : "text-text-primary-300 hover:text-primary-700"
                        }`}
                    >
                        {tab.label}
                        <span
                            aria-hidden
                            className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-700 transition-opacity ${
                                active ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    </Link>
                )
            })}
        </nav>
    )
}

export default ProjectTabs
