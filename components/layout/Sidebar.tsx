"use client"

import { HomeIcon, RectangleGroupIcon, RectangleStackIcon, UserIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline"
import NavItem from "@/components/layout/NavItem"
import { usePathname } from "next/navigation"

const Sidebar = () => {
    const pathname = usePathname()
    const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
    const slug = projectMatch?.[1] ?? null

    const menuLinks = [
        { icon: HomeIcon, href: "/projects" },
        { icon: ClipboardDocumentListIcon, href: "/project-tags" },
        { icon: UserIcon, href: "/users" },
    ]

    const projectSubLinks = slug
        ? [
              {
                  icon: RectangleGroupIcon,
                  href: `/projects/${slug}`,
              },
              {
                  icon: RectangleStackIcon,
                  href: `/projects/${slug}/tasks`,
              },
          ]
        : []

    return (
        <div className="fixed inset-0 h-full w-fit px-6">
            <nav className="mt-39 flex h-fit flex-col items-center gap-y-4">
                {menuLinks.map(link => (
                    <NavItem href={link.href} Icon={link.icon} key={link.href} />
                ))}

                {projectSubLinks.length > 0 && (
                    <>
                        <hr className="bg-border h-1 w-7 rounded-full border-none" />
                        {projectSubLinks.map(link => (
                            <NavItem href={link.href} Icon={link.icon} key={link.href} />
                        ))}
                    </>
                )}
            </nav>
        </div>
    )
}

export default Sidebar
