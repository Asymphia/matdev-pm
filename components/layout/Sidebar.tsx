"use client"

import {
    BanknotesIcon,
    HomeIcon,
    RectangleGroupIcon,
    RectangleStackIcon,
    UserIcon,
    TagIcon,
} from "@heroicons/react/24/outline"
import NavItem from "@/components/layout/NavItem"
import { usePathname } from "next/navigation"

const Sidebar = () => {
    const pathname = usePathname()
    const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
    const slug = projectMatch?.[1] ?? null

    const menuLinks = [
        { icon: HomeIcon, href: "/projects" },
        { icon: TagIcon, href: "/project-tags" },
        { icon: UserIcon, href: "/users" },
    ]

    const projectSubLinks = slug
        ? [
              {
                  icon: RectangleGroupIcon,
                  href: `/projects/${slug}`,
                  matchPrefix: false,
              },
              {
                  icon: RectangleStackIcon,
                  href: `/projects/${slug}/tasks`,
                  matchPrefix: true,
              },
              {
                  icon: BanknotesIcon,
                  href: `/projects/${slug}/budget`,
                  matchPrefix: true,
              },
          ]
        : []

    const mainNavHalfHeightRem = (menuLinks.length * 3.25 + (menuLinks.length - 1) * 1) / 2
    const hasProjectNav = projectSubLinks.length > 0

    return (
        <aside
            className="fixed inset-y-0 left-0 flex w-fit flex-col items-center px-6"
            style={
                hasProjectNav
                    ? { paddingTop: "5.5rem" }
                    : { paddingTop: `calc(50vh - ${mainNavHalfHeightRem}rem)` }
            }
        >
            <nav className="flex flex-col items-center gap-y-3">
                {menuLinks.map(link => (
                    <NavItem href={link.href} Icon={link.icon} key={link.href} />
                ))}
            </nav>

            {hasProjectNav && (
                <nav className="mt-3 flex flex-col items-center gap-y-3">
                    <hr className="bg-border mb-1 h-1 w-7 rounded-full border-none" />
                    {projectSubLinks.map(link => (
                        <NavItem
                            href={link.href}
                            Icon={link.icon}
                            key={link.href}
                            matchPrefix={link.matchPrefix}
                        />
                    ))}
                </nav>
            )}
        </aside>
    )
}

export default Sidebar
