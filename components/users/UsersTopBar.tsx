"use client"

import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"
import { useRouter } from "next/navigation"

const UsersTopBar = () => {
    const router = useRouter()
    return (
        <header className="flex min-w-0 flex-nowrap items-center justify-between">
            <h1>Users</h1>

            <div className="flex items-center gap-3">
                <IconButton Icon={ PlusIcon } onClick={() => router.push('?showmodal=true')} />
                <SearchBar />
            </div>
        </header>
    )
}

export default UsersTopBar
