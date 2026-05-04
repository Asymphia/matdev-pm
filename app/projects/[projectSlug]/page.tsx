import { notFound } from "next/navigation"
import SingleProjectPageClient from "@/components/project/SingleProjectPageClient"
import { fetchMatdevAssignedUsers, fetchMatdevProjectById, fetchMatdevTasksForProject, fetchProjectCreateLookups } from "@/lib/server/matdev-projects"

const SingleProjectPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const id = Number(projectSlug)
    if (!Number.isFinite(id)) {
        notFound()
    }

    const [{ project, error: projectError }, { tasks, error: tasksError }, { users: assignedUsers, error: usersError }, { lookups, error: lookupsError }] = await Promise.all([
        fetchMatdevProjectById(id),
        fetchMatdevTasksForProject(id),
        fetchMatdevAssignedUsers(id),
        fetchProjectCreateLookups(),
    ])

    if (!project) {
        notFound()
    }

    const apiNote = [projectError, tasksError].filter(Boolean).join(" · ")

    const note = [apiNote, usersError, lookupsError].filter(Boolean).join(" · ")
    return <SingleProjectPageClient project={project} tasks={tasks} assignedUsers={assignedUsers} lookups={lookups} lookupsError={lookupsError} apiNote={note} />
}

export default SingleProjectPage
