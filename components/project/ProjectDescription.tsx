import BlockWrapper from "@/components/ui/BlockWrapper"
import ProjectTags from "@/components/project/ProjectTags"

interface ProjectDescriptionProps {
    description: string
    topic?: string
    issueType?: string
    workpackage?: string
}

const ProjectDescription = ({ description, topic, issueType, workpackage }: ProjectDescriptionProps) => {
    return (
        <BlockWrapper className="gap-5">
            <h2>Description</h2>

            <p>{description}</p>

            {topic && issueType && workpackage && <ProjectTags topic={topic} issueType={issueType} workpackage={workpackage} size="big" />}
        </BlockWrapper>
    )
}

export default ProjectDescription
