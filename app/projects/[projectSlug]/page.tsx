import { notFound } from "next/navigation"
import SingleProjectPageClient from "@/components/project/SingleProjectPageClient"
import { enrichProjectWithLookups } from "@/lib/matdev-project-map"
import { fetchMatdevAssignedUsers, fetchMatdevProjectById, fetchMatdevTasksForProject, fetchProjectCreateLookups } from "@/lib/server/matdev-projects"
import { fetchAssignableUsersForProject } from "@/lib/server/matdev-tags"
import { fetchProjectBudget } from "@/lib/server/matdev-budget"
import { fetchProjectRisks } from "@/lib/server/matdev-risks"

const SingleProjectPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [
        { project, error: projectError },
        { tasks, error: tasksError },
        { users: assignedUsers, error: usersError },
        { lookups, error: lookupsError },
        { users: assignableUsers },
        budget,
        risks,
    ] = await Promise.all([
        fetchMatdevProjectById(id),
        fetchMatdevTasksForProject(id),
        fetchMatdevAssignedUsers(id),
        fetchProjectCreateLookups(id),
        fetchAssignableUsersForProject(id),
        fetchProjectBudget(id),
        fetchProjectRisks(id),
    ])

    if (!project) {
        notFound()
    }

    const enrichedProject = enrichProjectWithLookups(project, lookups)
    const note = [projectError, tasksError, usersError, lookupsError].filter(Boolean).join(" · ")

    return (
        <SingleProjectPageClient
            project={enrichedProject}
            tasks={tasks}
            assignedUsers={assignedUsers}
            assignableUsers={assignableUsers}
            lookups={lookups}
            apiNote={note}
            budget={budget}
            risks={risks}
        />
    )
}

export default SingleProjectPage
