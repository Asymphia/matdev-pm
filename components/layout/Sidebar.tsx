"use client"

import { HomeIcon, CreditCardIcon, ListBulletIcon } from "@heroicons/react/24/outline"
import NavItem from "@/components/layout/NavItem"

const Sidebar = () => {
    const menuLinks = [
        { icon: HomeIcon, href: "/" },
        { icon: CreditCardIcon, href: "/budgets" },
        { icon: ListBulletIcon, href: "/projects" },
    ]

    return (
        <div className="h-full px-6">
            <nav className="flex flex-col gap-y-4 h-fit mt-50">
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