"use client"

import IconButton from "@/components/ui/IconButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import SearchBar from "@/components/ui/SearchBar"

interface UsersTopBarProps {
    onOpenModal: () => void
    search: string
    onSearch: (v: string) => void
}

const UsersTopBar = ({ onOpenModal, search, onSearch }: UsersTopBarProps) => {
    return (
        <header className="flex min-w-0 flex-nowrap items-center justify-between">
            <h1>Users</h1>

            <div className="flex items-center gap-3">
                <IconButton Icon={PlusIcon} onClick={onOpenModal} />
                <SearchBar value={search} onChange={onSearch} placeholder="Search users…" />
            </div>
        </header>
    )
}

export default UsersTopBar
