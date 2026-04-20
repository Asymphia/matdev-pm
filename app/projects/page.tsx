"use client"

import ProjectItem from "@/components/project/ProjectItem"
import { DUMMY_PROJECTS_DATA } from "@/lib/data"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import { useState } from "react"

export type ProjectStatus = "To do" | "In progress" | "Completed"

const ProjectsPage = () => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)

    const data = currentFilter ? DUMMY_PROJECTS_DATA.filter(project => project.status === currentFilter) : DUMMY_PROJECTS_DATA

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <ProjectTopBar current={currentFilter} setCurrent={val => setCurrentFilter(val)} />

            <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3">
                {data.map((project, index) => (
                    <ProjectItem key={index} project={project} />
                ))}
            </div>
        </div>
    )
}

export default ProjectsPage
