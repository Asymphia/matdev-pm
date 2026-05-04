"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import UserFormModal from "@/components/users/UserFormModal"
import UsersTable from "@/components/users/UsersTable"
import UsersTopBar from "@/components/users/UsersTopBar"
import type { UserType } from "@/lib/data"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
    initialUsers: UserType[]
    loadError: string | null
}

const UsersPageClient = ({ initialUsers, loadError }: Props) => {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="flex h-full w-full flex-col gap-11">
            {loadError ? (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">Nie udało się wczytać użytkowników: {loadError}</p>
            ) : null}

            <div className="w-full">
                <UsersTopBar onOpenModal={() => setIsModalOpen(true)} />
            </div>
            <BlockWrapper>
                <UsersTable users={initialUsers} />
            </BlockWrapper>
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {
                    setIsModalOpen(false)
                    router.refresh()
                }}
            />
        </div>
    )
}

export default UsersPageClient
