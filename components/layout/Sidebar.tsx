"use client"

import { HomeIcon, CreditCardIcon, ListBulletIcon, UserIcon } from "@heroicons/react/24/outline"
import NavItem from "@/components/layout/NavItem"

const Sidebar = () => {
    const menuLinks = [
        { icon: HomeIcon, href: "/" },
        { icon: CreditCardIcon, href: "/budgets" },
        { icon: ListBulletIcon, href: "/projects" },
        { icon: UserIcon, href: "/users"}
    ]

    return (
        <div className="h-full w-fit px-6 fixed inset-0">
            <nav className="flex flex-col gap-y-4 h-fit mt-39">
                {
                    menuLinks.map((link, index) => (
                        <NavItem href={ link.href } Icon={ link.icon } key={ index } />
                    ))
                }
            </nav>
        </div>
    )
}

export default Sidebar