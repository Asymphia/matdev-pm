"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import Th from "@/components/ui/Th"
import { DUMMY_USERS_DATA, type UserType } from "@/lib/data"
import { PlusIcon, EllipsisVerticalIcon, CheckIcon } from "@heroicons/react/24/outline"
import IconButton from "@/components/ui/IconButton"

type ProjectUser = UserType & {
    isResponsible?: boolean
    role?: "Responsible" | "Support" | "Member"
}

interface UserListProps {
    users?: ProjectUser[]
}

const UserList = ({ users = DUMMY_USERS_DATA }: UserListProps) => {
    return (
        <BlockWrapper className="flex flex-col gap-5">
            <header className="flex flex-nowrap items-center justify-between">
                <h2>Users</h2>

                <IconButton Icon={PlusIcon} onClick={() => {}} />
            </header>

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
                                <button className="group flex w-full justify-center">
                                    <EllipsisVerticalIcon className="text-text-primary-300 group-hover:text-primary-700 group-active:text-primary-500 size-6 transition" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </BlockWrapper>
    )
}

export default UserList
