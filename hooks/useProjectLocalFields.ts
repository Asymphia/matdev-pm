"use client"

import { useState } from "react"
import type { ProjectType } from "@/lib/data"

type ProjectFields = Pick<ProjectType, "status" | "statusId" | "deadline">

/** Optimistic project header fields; re-syncs from server props after router.refresh(). */
export function useProjectLocalFields(project: ProjectFields) {
    const [localStatus, setLocalStatus] = useState(project.status)
    const [localStatusId, setLocalStatusId] = useState(project.statusId)
    const [localDeadline, setLocalDeadline] = useState(project.deadline)

    const [prev, setPrev] = useState({
        status: project.status,
        statusId: project.statusId,
        deadline: project.deadline,
    })
    if (
        project.status !== prev.status ||
        project.statusId !== prev.statusId ||
        project.deadline !== prev.deadline
    ) {
        setPrev({
            status: project.status,
            statusId: project.statusId,
            deadline: project.deadline,
        })
        setLocalStatus(project.status)
        setLocalStatusId(project.statusId)
        setLocalDeadline(project.deadline)
    }

    return {
        localStatus,
        setLocalStatus,
        localStatusId,
        setLocalStatusId,
        localDeadline,
        setLocalDeadline,
    }
}
