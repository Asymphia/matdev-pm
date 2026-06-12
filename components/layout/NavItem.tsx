"use client"

import Link from "next/link"
import { ComponentType, SVGProps } from "react"
import { usePathname } from "next/navigation"

interface NavItemProps {
    href: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    /** Highlight when pathname equals href or is a nested route (e.g. /tasks/5). */
    matchPrefix?: boolean
}

const NavItem = ({ href, Icon, matchPrefix = false }: NavItemProps) => {
    const pathname = usePathname()
    const normalized = pathname.replace(/\/$/, "")
    const target = href.replace(/\/$/, "")
    const isActive = matchPrefix
        ? normalized === target || normalized.startsWith(`${target}/`)
        : normalized === target

    return (
        <Link
            href={href}
            className={`border-border group flex size-13 items-center justify-center rounded-full border border-solid ${isActive ? "bg-primary-700" : "bg-background hover:bg-foreground"}`}
        >
            <Icon className={`size-6 ${isActive ? "text-background" : "text-primary-700 group-hover:text-primary-500"}`} />
        </Link>
    )
}

export default NavItem
