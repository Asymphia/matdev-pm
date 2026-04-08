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
        <div className="flex flex-col gap-11 w-full h-full">
            <ProjectTopBar current={ currentFilter } setCurrent={ (val) => setCurrentFilter(val) } />

            <div className="grid 2xl:grid-cols-4 grid-cols-3 gap-4">
                {
                    data.map((project, index) => (
                        <ProjectItem
                            key={ index }
                            project={ project }
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default ProjectsPage
