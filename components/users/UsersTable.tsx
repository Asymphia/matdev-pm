import UserSnippet from "@/components/users/UserSnippet"
import { UserType } from "@/lib/data"
import { ChevronDownIcon } from "@heroicons/react/24/outline"

interface UsersTableProps {
    users: UserType[]
}

const UsersTable = ({ users }: UsersTableProps) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="grid w-full grid-cols-4 justify-items-center gap-4 font-semibold">
                <button type="button" className="flex flex-row items-center gap-1">
                    <div>Name</div>
                    <ChevronDownIcon className="size-4" />
                </button>
                <div>Email</div>
                <div>Phone</div>
                <div>Manage</div>
            </div>
            <div className="flex flex-col gap-4">
                {users.map(user => (
                    <UserSnippet key={user.id} name={`${user.firstName} ${user.secondName}`} email={user.email} phone={user.phone} />
                ))}
            </div>
        </div>
    )
}

export default UsersTable
