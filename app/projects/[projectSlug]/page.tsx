import { DUMMY_PROJECTS_DATA } from "@/lib/data"
import { notFound } from "next/navigation"
import ProjectDescription from "@/components/project/ProjectDescription"

const SingleProjectPage = async ({ params }: { params: Promise<{ projectSlug: string }> }) => {
    const { projectSlug } = await params
    const project = DUMMY_PROJECTS_DATA.find(project => project.id === Number(projectSlug))

    if (!project) {
        notFound()
    }

    return (
        <div className="flex h-full w-full flex-col gap-11">
            <h1>{project.projectName}</h1>

            <div className="grid grid-cols-2 gap-4">
                <ProjectDescription description={project.description} />
            </div>
        </div>
    )
}

export default SingleProjectPage
