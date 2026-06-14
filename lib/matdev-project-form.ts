/** Response from GET /api/project/lookups/for-create */
export type ProjectCreateLookups = {
    issueTypes: { id: number; name: string }[]
    topics: { id: number; name: string }[]
    workpackages: { id: number; name: string }[]
    statuses: { id: number; name: string }[]
    priorities: { id: number; name: string }[]
    users: { id: number; firstName: string; lastName: string; displayName: string }[]
}

export type CreateProjectApiBody = {
    projectName: string
    topicId: number
    statusId: number | null
    priorityId: number | null
    issuetypeId: number
    respPeronId: number | null
    suppPersonId: number | null
    startDate: string | null
    endDate: string | null
    workpackageId: number
    description: string | null
}
