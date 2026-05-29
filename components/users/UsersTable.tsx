import ContextMenu from "@/components/ui/ContextMenu"
import { UserType } from "@/lib/data"
import { ChevronDownIcon } from "@heroicons/react/24/outline"

interface UsersTableProps {
    users: UserType[]
    onEdit?: (user: UserType) => void
    onDelete?: (user: UserType) => void
    actionPending?: boolean
}

const UsersTable = ({ users, onEdit, onDelete, actionPending }: UsersTableProps) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="grid w-full grid-cols-[1fr_1fr_1fr_80px] justify-items-center gap-4 font-semibold">
                <button type="button" className="flex flex-row items-center gap-1">
                    <div>Name</div>
                    <ChevronDownIcon className="size-4" />
                </button>
                <div>Email</div>
                <div>Phone</div>
                <div>Manage</div>
            </div>
            <div className="flex flex-col gap-4">
                {users.map(user => {
                    const menuItems = [
                        ...(onEdit ? [{ label: "Edit", onClick: () => onEdit(user) }] : []),
                        ...(onDelete ? [{ label: "Delete", onClick: () => onDelete(user), danger: true }] : []),
                    ]
                    return (
                        <div key={user.id} className="grid w-full grid-cols-[1fr_1fr_1fr_80px] items-center justify-items-center gap-4">
                            <div>{user.firstName} {user.secondName}</div>
                            <div>{user.email}</div>
                            <div className="font-medium">{user.phone}</div>
                            <div className="flex justify-center">
                                {menuItems.length > 0 && <ContextMenu items={menuItems} disabled={actionPending} />}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default UsersTable
