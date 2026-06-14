import ProjectsPageClient from "@/components/project/ProjectsPageClient"
import { enrichProjectWithLookups } from "@/lib/matdev-project-map"
import { fetchMatdevProjects, fetchProjectCreateLookups } from "@/lib/server/matdev-projects"

const ProjectsPage = async () => {
    const [{ projects, error }, lookupsRes] = await Promise.all([fetchMatdevProjects(), fetchProjectCreateLookups()])
    const enriched = projects.map(p => enrichProjectWithLookups(p, lookupsRes.lookups))
    return (
        <ProjectsPageClient
            initialProjects={enriched}
            loadError={error}
            lookups={lookupsRes.lookups}
            lookupsError={lookupsRes.error}
        />
    )
}

export default ProjectsPage
