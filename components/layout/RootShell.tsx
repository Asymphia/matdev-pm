"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"

type Props = {
    children: ReactNode
}

const RootShell = ({ children }: Props) => {
    const pathname = usePathname()
    const isWelcome = pathname === "/"

    if (isWelcome) {
        return <div className="min-h-screen w-screen">{children}</div>
    }

    return (
        <div className="flex min-h-screen w-screen">
            <Sidebar />
            <div className="ml-19 flex min-h-screen flex-1 flex-col py-12 pr-12 pl-8">{children}</div>
        </div>
    )
}

export default RootShell
