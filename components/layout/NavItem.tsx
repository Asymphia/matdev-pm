"use client"

import Link from "next/link"
import { ComponentType, SVGProps } from "react"
import { usePathname } from "next/navigation"

interface NavItemProps {
    href: string
    Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NavItem = ({ href, Icon }: NavItemProps) => {
    const pathname = usePathname()
    const isActive = pathname.replace(/\/$/, "") === href.replace(/\/$/, "")

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
