"use client"

import StatusItem from "@/components/ui/StatusItem"
import ProjectDeadline from "@/components/project/ProjectDeadline"
import IconButton from "@/components/ui/IconButton"
import ContextMenu from "@/components/ui/ContextMenu"
import { PencilIcon } from "@heroicons/react/24/outline"
import { ProjectStatus } from "@/lib/data"

type StatusOption = { id: number; name: string }

interface ProjectSidebarProps {
    status: ProjectStatus
    deadline: string
    onEdit?: () => void
    statusOptions?: StatusOption[]
    onStatusChange?: (statusId: number) => void
    onDeadlineChange?: () => void
}

const ProjectSidebar = ({ status, deadline, onEdit, statusOptions = [], onStatusChange, onDeadlineChange }: ProjectSidebarProps) => {
    return (
        <div className="flex items-center gap-2">
            {onStatusChange && statusOptions.length > 0 ? (
                <div className="flex items-center gap-1">
                    <StatusItem status={status} size="big" />
                    <ContextMenu
                        items={statusOptions.map(s => ({ label: s.name, onClick: () => onStatusChange(s.id) }))}
                    />
                </div>
            ) : (
                <StatusItem status={status} size="big" />
            )}

            <button
                type="button"
                onClick={onDeadlineChange}
                className={`${onDeadlineChange ? "hover:opacity-70 transition-opacity cursor-pointer" : ""}`}
                disabled={!onDeadlineChange}
            >
                <ProjectDeadline deadline={deadline} />
            </button>

            <IconButton Icon={PencilIcon} onClick={() => onEdit?.()} />
        </div>
    )
}

export default ProjectSidebar
