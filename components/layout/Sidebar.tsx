"use client"

import { HomeIcon, CreditCardIcon, ListBulletIcon, UserIcon } from "@heroicons/react/24/outline"
import NavItem from "@/components/layout/NavItem"

const Sidebar = () => {
    const menuLinks = [
        { icon: HomeIcon, href: "/" },
        { icon: CreditCardIcon, href: "/project-tags" },
        { icon: ListBulletIcon, href: "/projects" },
        { icon: UserIcon, href: "/users" },
    ]

    return (
        <div className="fixed inset-0 h-full w-fit px-6">
            <nav className="mt-39 flex h-fit flex-col gap-y-4">
                {menuLinks.map((link, index) => (
                    <NavItem href={link.href} Icon={link.icon} key={index} />
                ))}
            </nav>
        </div>
    )
}

export default Sidebar
