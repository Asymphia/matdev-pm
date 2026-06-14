"use client"

import { deleteMatdevUser } from "@/app/actions/user-mutations"
import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import UserFormModal from "@/components/users/UserFormModal"
import UsersTable from "@/components/users/UsersTable"
import UsersTopBar from "@/components/users/UsersTopBar"
import type { UserType } from "@/lib/data"
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useConfirm } from "@/hooks/useConfirm"

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
    const { confirm, ConfirmModal } = useConfirm()

    const openCreate = () => {
        setEditUser(null)
        setIsModalOpen(true)
    }

    const openEdit = (user: UserType) => {
        setEditUser(user)
        setIsModalOpen(true)
    }

    const handleDelete = async (user: UserType) => {
        const ok = await confirm({
            title: "Delete user",
            message: `Remove ${user.firstName} ${user.secondName} from the team?`,
            confirmLabel: "Delete",
            danger: true,
        })
        if (!ok) return
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

    const term = search.trim().toLowerCase()
    const filteredUsers = initialUsers.filter(u => {
        if (!term) return true
        const fullName = `${u.firstName} ${u.secondName}`.toLowerCase()
        return (
            fullName.includes(term) ||
            u.firstName.toLowerCase().includes(term) ||
            u.secondName.toLowerCase().includes(term) ||
            (u.email ?? "").toLowerCase().includes(term) ||
            (u.phone ?? "").toLowerCase().includes(term)
        )
    })

    const hasSearch = term.length > 0
    const isEmptyDatabase = initialUsers.length === 0

    return (
        <div className="flex h-full w-full flex-col gap-8">
            {(loadError || actionError) ? (
                <p className="text-error border-error rounded-md border px-4 py-3 text-sm">
                    {loadError ? `Failed to load users: ${loadError}` : actionError}
                </p>
            ) : null}

            <UsersTopBar onOpenModal={openCreate} search={search} onSearch={setSearch} />

            <BlockWrapper className="gap-5 overflow-x-auto">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle>Team</CardTitle>
                        <p className="text-text-primary-100 text-xs">
                            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
                        </p>
                    </div>
                </div>

                {!loadError && filteredUsers.length === 0 ? (
                    <div className="border-border bg-foreground text-text-primary-300 flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-md border border-dashed px-6 py-12 text-center">
                        <div className="border-border bg-background flex size-14 items-center justify-center rounded-md border">
                            {isEmptyDatabase ? (
                                <UserPlusIcon className="text-text-primary-300 size-7" />
                            ) : (
                                <MagnifyingGlassIcon className="text-text-primary-300 size-7" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-text-primary-500 font-medium">
                                {isEmptyDatabase ? "No users yet" : "No users found"}
                            </p>
                            <p className="text-sm">
                                {isEmptyDatabase
                                    ? "Add your first team member with the + button."
                                    : hasSearch
                                      ? `Nothing matches “${search.trim()}”.`
                                      : "No users match the current view."}
                            </p>
                        </div>
                        {isEmptyDatabase ? (
                            <button
                                type="button"
                                onClick={openCreate}
                                className="cursor-pointer rounded-md bg-[#2D3748] px-5 py-2 text-sm text-white"
                            >
                                Add user
                            </button>
                        ) : hasSearch ? (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="border-border cursor-pointer rounded-md border px-5 py-2 text-sm"
                            >
                                Clear search
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <UsersTable users={filteredUsers} onEdit={openEdit} onDelete={handleDelete} actionPending={pending} />
                )}
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
            <ConfirmModal />
        </div>
    )
}

export default UsersPageClient
