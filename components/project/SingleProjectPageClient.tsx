"use client"

import ProjectDescription from "@/components/project/ProjectDescription"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import ProjectSidebar from "@/components/project/ProjectSidebar"
import TasksList from "@/components/project/TasksList"
import BudgetChart from "@/components/project/BudgetChart"
import WarningsList from "@/components/project/WarningsList"
import UserList from "@/components/project/UserList"
import type { ProjectType, TaskType } from "@/lib/data"
import type { ProjectCreateLookups } from "@/lib/matdev-project-form"
import type { ProjectAssignedUser } from "@/lib/server/matdev-projects"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
    project: ProjectType
    tasks: TaskType[]
    assignedUsers: ProjectAssignedUser[]
    lookups: ProjectCreateLookups | null
    lookupsError: string | null
    apiNote: string
}

const SingleProjectPageClient = ({ project, tasks, assignedUsers, lookups, lookupsError, apiNote }: Props) => {
    const router = useRouter()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const usersWithRoles = assignedUsers.map(user => ({
        ...user,
        role: user.id === project.respPeronId ? "Responsible" : user.id === project.suppPersonId ? "Support" : "Member",
    }))

    return (
        <div className="flex h-full w-full flex-col gap-11">
            {apiNote ? <p className="text-error border-error rounded-md border px-4 py-3 text-sm">Część danych z API: {apiNote}</p> : null}

            <header className="flex items-center justify-between">
                <h1>{project.projectName}</h1>

                <ProjectSidebar status={project.status} deadline={project.deadline} onEdit={() => setIsEditModalOpen(true)} />
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <ProjectDescription description={project.description} topic={project.topic} issueType={project.issueType} workpackage={project.workpackage} />

                    <TasksList tasks={tasks} />
                </div>

                <div className="flex flex-col gap-4">
                    <BudgetChart />

                    <WarningsList />

                    <UserList users={usersWithRoles} />
                </div>
            </div>

            <ProjectFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onCreated={() => {
                    setIsEditModalOpen(false)
                    router.refresh()
                }}
                lookups={lookups}
                lookupsError={lookupsError}
                mode="edit"
                initialProject={project}
            />
        </div>
    )
}

export default SingleProjectPageClient
