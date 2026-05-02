"use client"

import ProjectItem from "@/components/project/ProjectItem"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import { useState } from "react"
import { DUMMY_PROJECTS_DATA, ProjectStatus } from "@/lib/data"

const ProjectsPage = () => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const data = currentFilter ? DUMMY_PROJECTS_DATA.filter(project => project.status === currentFilter) : DUMMY_PROJECTS_DATA

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <ProjectTopBar current={currentFilter} setCurrent={val => setCurrentFilter(val)} onOpenModal={() => setIsModalOpen(true)} />

            <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3">
                {data.map(project => (
                    <ProjectItem key={project.id} project={project} />
                ))}
            </div>

            <ProjectFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}

export default ProjectsPage
