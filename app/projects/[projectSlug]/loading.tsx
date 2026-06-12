import Skeleton from "@/components/ui/Skeleton"

const ProjectSectionLoading = () => (
    <div className="flex flex-col gap-6 p-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-72 w-full rounded-lg" />
    </div>
)

export default ProjectSectionLoading
