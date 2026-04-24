"use client"

import BlockWrapper from "@/components/ui/BlockWrapper"
import { DUMMY_USERS_DATA } from "@/lib/data"
import UserFormModal from "@/components/users/UserFormModal"
import UsersTable from "@/components/users/UsersTable"
import UsersTopBar from "@/components/users/UsersTopBar"
import { useState } from "react"

const UsersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-11 w-full h-full">
      <div className="w-full">
        <UsersTopBar onOpenModal={() => setIsModalOpen(true)} />
      </div>
      <BlockWrapper>
        <UsersTable users={DUMMY_USERS_DATA} />
      </BlockWrapper>
      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default UsersPage
