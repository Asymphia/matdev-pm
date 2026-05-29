"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import Th from "@/components/ui/Th"
import ContextMenu from "@/components/ui/ContextMenu"
import FormModalShell from "@/components/forms/FormModalShell"
import { PlusIcon, UserIcon, CheckIcon } from "@heroicons/react/24/outline"
import IconButton from "@/components/ui/IconButton"
import { useState } from "react"

type ProjectUser = {
    id: number
    firstName: string
    secondName: string
    email: string
    phone: string
    isResponsible?: boolean
    role?: "Responsible" | "Support" | "Member"
}

type AssignableUser = { id: number; firstName: string; lastName: string }

interface UserListProps {
    users?: ProjectUser[]
    assignableUsers?: AssignableUser[]
    onAssign?: (userId: number, isResponsible: boolean) => void
    onRemove?: (userId: number) => void
    actionPending?: boolean
}

const UserList = ({
    users = [],
    assignableUsers = [],
    onAssign,
    onRemove,
    actionPending,
}: UserListProps) => {
    const [assignModal, setAssignModal] = useState(false)

    const assignedIds = new Set(users.map(u => u.id))
    const available = assignableUsers.filter(u => !assignedIds.has(u.id))

    return (
        <BlockWrapper className="flex flex-col gap-5">
            <header className="flex flex-nowrap items-center justify-between">
                <h2>Users</h2>
                {onAssign && available.length > 0 && (
                    <IconButton Icon={PlusIcon} onClick={() => setAssignModal(true)} disabled={actionPending} />
                )}
            </header>

            {users.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No users assigned to this project.</p>
            ) : (
                <table className="w-full border-separate border-spacing-y-4">
                    <thead>
                        <tr>
                            <Th>Name</Th>
                            <Th>Surname</Th>
                            <Th>E-mail</Th>
                            <Th>Role</Th>
                            <Th>Manage</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="text-center">{user.firstName}</td>
                                <td className="text-center">{user.secondName}</td>
                                <td className="text-center">{user.email}</td>
                                <td className="text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        {user.isResponsible ? <CheckIcon className="text-text-primary-300 size-5" /> : null}
                                        <span>{user.role ?? "Member"}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex justify-center">
                                        {onRemove ? (
                                            <ContextMenu
                                                items={[{ label: "Remove from project", onClick: () => onRemove(user.id), danger: true }]}
                                                disabled={actionPending}
                                            />
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <FormModalShell isOpen={assignModal} title="Assign user to project" onClose={() => setAssignModal(false)}>
                <div className="flex flex-col gap-2">
                    {available.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">All users are already assigned.</p>
                    ) : (
                        available.map(u => (
                            <div key={u.id} className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-secondary transition-colors">
                                <div className="flex items-center gap-3">
                                    <UserIcon className="size-5 text-muted-foreground" />
                                    <span className="text-sm">{u.firstName} {u.lastName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={actionPending}
                                        onClick={() => { onAssign?.(u.id, false); setAssignModal(false) }}
                                        className="border-border cursor-pointer rounded-md border px-3 py-1 text-xs disabled:opacity-50"
                                    >
                                        Member
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actionPending}
                                        onClick={() => { onAssign?.(u.id, true); setAssignModal(false) }}
                                        className="cursor-pointer rounded-md bg-[#2D3748] px-3 py-1 text-xs text-white disabled:opacity-50"
                                    >
                                        Responsible
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </FormModalShell>
        </BlockWrapper>
    )
}

export default UserList
