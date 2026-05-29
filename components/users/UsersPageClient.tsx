"use client"

import { deleteMatdevUser } from "@/app/actions/user-mutations"
import BlockWrapper from "@/components/ui/BlockWrapper"
import UserFormModal from "@/components/users/UserFormModal"
import UsersTable from "@/components/users/UsersTable"
import UsersTopBar from "@/components/users/UsersTopBar"
import type { UserType } from "@/lib/data"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

type Props = {
    initialUsers: UserType[]
    loadError: string | null
}

const UsersPageClient = ({ initialUsers, loadError }: Props) => {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editUser, setEditUser] = useState<UserType | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [pending, startTransition] = useTransition()

    const openCreate = () => {
        setEditUser(null)
        setIsModalOpen(true)
    }

    const openEdit = (user: UserType) => {
        setEditUser(user)
        setIsModalOpen(true)
    }

    const handleDelete = (user: UserType) => {
        if (!confirm(`Delete user "${user.firstName} ${user.secondName}"?`)) return
        startTransition(async () => {
            setActionError(null)
            const res = await deleteMatdevUser(user.id)
            if (!res.ok) {
                setActionError(res.error)
                return
            }
            router.refresh()
        })
    }

    return (
        <div className="flex h-full w-full flex-col gap-11">
            {(loadError || actionError) ? (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">
                    {loadError ? `Failed to load users: ${loadError}` : actionError}
                </p>
            ) : null}

            <div className="w-full">
                <UsersTopBar onOpenModal={openCreate} search={search} onSearch={setSearch} />
            </div>
            <BlockWrapper>
                <UsersTable
                    users={initialUsers.filter(u => {
                        const t = search.trim().toLowerCase()
                        if (!t) return true
                        const fullName = `${u.firstName} ${u.secondName}`.toLowerCase()
                        return (
                            fullName.includes(t) ||
                            u.firstName.toLowerCase().includes(t) ||
                            u.secondName.toLowerCase().includes(t) ||
                            (u.email ?? "").toLowerCase().includes(t) ||
                            (u.phone ?? "").toLowerCase().includes(t)
                        )
                    })}
                    onEdit={openEdit} onDelete={handleDelete} actionPending={pending} />
            </BlockWrapper>
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {
                    setIsModalOpen(false)
                    router.refresh()
                }}
                editUser={editUser}
            />
        </div>
    )
}

export default UsersPageClient
