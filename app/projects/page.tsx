import ProjectsPageClient from "@/components/project/ProjectsPageClient"
import { fetchMatdevProjects, fetchProjectCreateLookups } from "@/lib/server/matdev-projects"

const ProjectsPage = async () => {
    const [{ projects, error }, lookupsRes] = await Promise.all([fetchMatdevProjects(), fetchProjectCreateLookups()])
    return (
        <ProjectsPageClient
            initialProjects={projects}
            loadError={error}
            lookups={lookupsRes.lookups}
            lookupsError={lookupsRes.error}
        />
    )
}

export default ProjectsPage
