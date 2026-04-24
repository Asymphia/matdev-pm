import TextIcon from "@/components/ui/TextIcon"
import { BriefcaseIcon, ExclamationTriangleIcon, HashtagIcon } from "@heroicons/react/24/outline"

interface ProjectTagProps {
    topic: string
    issueType: string
    workpackage: string
    size?: "big" | "small"
}

const ProjectTags = ({ topic, issueType, workpackage, size = "small" }: ProjectTagProps) => {
    return (
        <div className="grid grid-cols-3">
            <div className="justify-self-start">
                <TextIcon text={topic} Icon={HashtagIcon} size={size} />
            </div>

            <div className="justify-self-center">
                <TextIcon text={issueType} Icon={ExclamationTriangleIcon} size={size} />
            </div>

            <div className="justify-self-end">
                <TextIcon text={workpackage} Icon={BriefcaseIcon} size={size} />
            </div>
        </div>
    )
}

export default ProjectTags
