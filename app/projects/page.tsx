"use client"

import ProjectItem from "@/components/project/ProjectItem"
import { DUMMY_PROJECTS_DATA } from "@/lib/data"
import ProjectTopBar from "@/components/project/ProjectTopBar"
import {useEffect, useState} from "react"

export type ProjectStatus = "To do" | "In progress" | "Completed"

const ProjectsPage = () => {
    const [currentFilter, setCurrentFilter] = useState<ProjectStatus | null>(null)
    const [data, setData] = useState(DUMMY_PROJECTS_DATA)

    useEffect(() => {
        if (!currentFilter) {
            setData(DUMMY_PROJECTS_DATA)
            return
        }

        const filtered = DUMMY_PROJECTS_DATA.filter(
            (project) => project.status === currentFilter
        )

        setData(filtered)
    }, [currentFilter])

    return (
        <div className="flex flex-col gap-11 w-full h-full">
            <ProjectTopBar current={ currentFilter } setCurrent={ (val) => setCurrentFilter(val) } />

            <div className="grid grid-cols-4 gap-4">
                {
                    data.map((project, index) => (
                        <ProjectItem
                            key={index}
                            name={project.projectName}
                            description={project.description}
                            startDate={new Date(project.startDate)}
                            endDate={new Date(project.deadline)}
                            budget={project.budget}
                            amountSpent={project.amountSpent}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default ProjectsPage
