"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import Th from "@/components/ui/Th"
import { DUMMY_USERS_DATA } from "@/lib/data"
import { PlusIcon, EllipsisVerticalIcon, CheckIcon } from "@heroicons/react/24/outline"
import IconButton from "@/components/ui/IconButton"

const UserList = () => {
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
                        <Th>Is responsible</Th>
                        <Th>Manage</Th>
                    </tr>
                </thead>

                <tbody>
                    {DUMMY_USERS_DATA.map((user, index) => (
                        <tr key={index}>
                            <td className="text-center">{user.firstName}</td>
                            <td className="text-center">{user.secondName}</td>
                            <td className="text-center">{user.email}</td>
                            <td className="text-center">
                                <div className="flex justify-center">
                                    <CheckIcon className="text-text-primary-300 size-6" />
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
