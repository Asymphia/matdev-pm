import ProjectTagsPageClient from "@/components/project-tags/ProjectTagsPageClient"
import { fetchTagCollections } from "@/lib/server/matdev-tags"

const TagsPage = async () => {
    const { data, error } = await fetchTagCollections()
    return (
        <ProjectTagsPageClient
            issues={data.issues}
            topics={data.topics}
            workpackages={data.workpackages}
            taskCategories={data.taskCategories}
            loadError={error}
        />
    )
}

export default TagsPage
