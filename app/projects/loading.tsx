import Skeleton from "@/components/ui/Skeleton"

const ProjectsLoading = () => (
    <div className="flex h-full w-full flex-col gap-11">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid min-h-[420px] flex-1 grid-cols-2 gap-4 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
        </div>
    </div>
)

export default ProjectsLoading
