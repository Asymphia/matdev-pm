"use client"

import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"

const UsersTopBar = () => {
    return (
        <header className="flex flex-nowrap min-w-0 items-center justify-between">
            <h1>
                Users
            </h1>

            <div className="flex items-center gap-3">
                <IconButton Icon={ PlusIcon } onClick={() => {}} />
                <SearchBar />
            </div>
        </header>
    )
}

export default UsersTopBar