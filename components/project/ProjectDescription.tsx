import BlockWrapper from "@/components/ui/BlockWrapper"

const ProjectDescription = ({ description }: { description: string }) => {
    return (
        <BlockWrapper className="gap-5">
            <h2>Description</h2>

            <p>{description}</p>
        </BlockWrapper>
    )
}

export default ProjectDescription
