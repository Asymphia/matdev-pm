import { UserType } from "@/lib/data"
import Th from "@/components/ui/Th"
import DeleteIconButton from "@/components/ui/DeleteIconButton"

interface UsersTableProps {
    users: UserType[]
    onEdit?: (user: UserType) => void
    onDelete?: (user: UserType) => void
    actionPending?: boolean
}

function initials(firstName: string, secondName: string) {
    const a = firstName.trim()[0] ?? ""
    const b = secondName.trim()[0] ?? ""
    return (a + b).toUpperCase() || "?"
}

const UsersTable = ({ users, onEdit, onDelete, actionPending }: UsersTableProps) => {
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-border border-b">
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th align="center">Actions</Th>
                </tr>
            </thead>
            <tbody className="divide-border divide-y">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-foreground/60 transition-colors">
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
                        <td className="text-text-primary-300 py-3 pr-4">
                            {user.phone?.trim() ? user.phone : "—"}
                        </td>
                        <td className="py-3">
                            <div className="flex items-center justify-center gap-1">
                                {onEdit ? (
                                    <button
                                        type="button"
                                        disabled={actionPending}
                                        onClick={() => onEdit(user)}
                                        className="text-text-primary-300 hover:text-primary-700 rounded px-2 py-1 text-xs transition-colors disabled:opacity-40"
                                    >
                                        Edit
                                    </button>
                                ) : null}
                                {onDelete ? (
                                    <DeleteIconButton
                                        disabled={actionPending}
                                        onClick={() => onDelete(user)}
                                        title="Delete user"
                                    />
                                ) : null}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default UsersTable
