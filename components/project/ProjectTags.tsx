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
        <div className="flex flex-wrap gap-2">
            <TextIcon text={topic} Icon={HashtagIcon} size={size} variant="badge" />
            <TextIcon text={issueType} Icon={ExclamationTriangleIcon} size={size} variant="badge" />
            <TextIcon text={workpackage} Icon={BriefcaseIcon} size={size} variant="badge" />
        </div>
    )
}

export default ProjectTags
