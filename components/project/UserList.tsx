"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import Th from "@/components/ui/Th"
import DeleteIconButton from "@/components/ui/DeleteIconButton"
import FormModalShell from "@/components/forms/FormModalShell"
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline"
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

function initials(firstName: string, lastName: string) {
    const a = firstName.trim()[0] ?? ""
    const b = lastName.trim()[0] ?? ""
    return (a + b).toUpperCase() || "?"
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
        <BlockWrapper className="flex w-full flex-col gap-5 self-start">
            <div className="flex items-center justify-between gap-3">
                <CardTitle>Users</CardTitle>
                {onAssign && (
                    <button
                        type="button"
                        onClick={() => setAssignModal(true)}
                        disabled={actionPending || available.length === 0}
                        title={available.length === 0 ? "No more users to assign" : "Assign user"}
                        className="text-text-primary-300 hover:text-primary-700 flex shrink-0 items-center gap-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <PlusIcon className="size-4" /> Assign
                    </button>
                )}
            </div>

            {users.length === 0 ? (
                <p className="text-text-primary-100 text-sm">No users assigned to this project.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-border border-b">
                                <Th>Name</Th>
                                <Th>E-mail</Th>
                                <Th align="center">Role</Th>
                                <Th align="center">Manage</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-foreground/60 align-middle transition-colors">
                                    <td className="py-3 pr-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="bg-primary-700 text-background flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                                                {initials(user.firstName, user.secondName)}
                                            </span>
                                            <span className="text-text-primary-500 truncate font-medium">
                                                {user.firstName} {user.secondName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-text-primary-300 py-3 pr-4">
                                        {user.email?.trim() ? user.email : "—"}
                                    </td>
                                    <td className="py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {user.isResponsible ? (
                                                <CheckIcon className="text-primary-500 size-5 shrink-0" />
                                            ) : null}
                                            <span>{user.role ?? "Member"}</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center justify-center">
                                            {onRemove ? (
                                                <DeleteIconButton
                                                    disabled={actionPending}
                                                    onClick={() => onRemove(user.id)}
                                                    title="Remove from project"
                                                    aria-label="Remove from project"
                                                />
                                            ) : (
                                                <span className="text-text-primary-300 text-xs">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <FormModalShell isOpen={assignModal} title="Assign user to project" onClose={() => setAssignModal(false)}>
                <div className="flex flex-col gap-1">
                    {available.length === 0 ? (
                        <p className="text-text-primary-100 py-2 text-sm">All users are already assigned.</p>
                    ) : (
                        available.map(u => (
                            <div
                                key={u.id}
                                className="border-border hover:bg-foreground/60 flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2 transition-colors"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="bg-primary-700 text-background flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
                                        {initials(u.firstName, u.lastName)}
                                    </span>
                                    <span className="text-text-primary-500 truncate text-sm font-medium">
                                        {u.firstName} {u.lastName}
                                    </span>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        type="button"
                                        disabled={actionPending}
                                        onClick={() => {
                                            onAssign?.(u.id, false)
                                            setAssignModal(false)
                                        }}
                                        className="border-border text-text-primary-500 hover:bg-foreground cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        Member
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actionPending}
                                        onClick={() => {
                                            onAssign?.(u.id, true)
                                            setAssignModal(false)
                                        }}
                                        className="bg-primary-700 hover:bg-primary-800 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
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
