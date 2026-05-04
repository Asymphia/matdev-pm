"use client"

import StatusItem from "@/components/ui/StatusItem"
import ProjectDeadline from "@/components/project/ProjectDeadline"
import IconButton from "@/components/ui/IconButton"
import { PencilIcon } from "@heroicons/react/24/outline"
import { ProjectStatus } from "@/lib/data"

interface ProjectSidebarProps {
    status: ProjectStatus
    deadline: string
    onEdit?: () => void
}

const ProjectSidebar = ({ status, deadline, onEdit }: ProjectSidebarProps) => {
    return (
        <div className="flex items-center gap-2">
            <StatusItem status={status} size="big" />

            <ProjectDeadline deadline={deadline} />

            <IconButton Icon={PencilIcon} onClick={() => onEdit?.()} />
        </div>
    )
}

export default ProjectSidebar
