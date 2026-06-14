import BlockWrapper from "@/components/ui/BlockWrapper"
import CardTitle from "@/components/ui/CardTitle"
import ProjectTags from "@/components/project/ProjectTags"

interface ProjectDescriptionProps {
    description: string
    topic?: string
    issueType?: string
    workpackage?: string
}

const ProjectDescription = ({ description, topic, issueType, workpackage }: ProjectDescriptionProps) => {
    return (
        <BlockWrapper className="flex w-full flex-col gap-5 self-start">
            <CardTitle>Description</CardTitle>

            <p>{description}</p>

            {topic && issueType && workpackage && <ProjectTags topic={topic} issueType={issueType} workpackage={workpackage} size="big" />}
        </BlockWrapper>
    )
}

export default ProjectDescription
