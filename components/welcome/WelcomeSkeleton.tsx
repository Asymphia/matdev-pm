import Skeleton from "@/components/ui/Skeleton"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

const WelcomeSkeleton = () => (
    <div className="flex min-h-screen">
        <div className="bg-primary-700 hidden w-[42%] flex-col justify-between p-10 lg:flex">
            <Skeleton className="size-14 rounded-2xl opacity-30" />
            <div className="space-y-3">
                <Skeleton className="h-8 w-3/4 opacity-30" />
                <Skeleton className="h-4 w-full opacity-20" />
                <Skeleton className="h-4 w-5/6 opacity-20" />
            </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center lg:text-left">
                    <Skeleton className="mx-auto mb-3 h-8 w-48 lg:mx-0" />
                    <Skeleton className="mx-auto h-4 w-64 lg:mx-0" />
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-11 w-full rounded-md" />
                <div className="flex justify-center pt-4">
                    <LoadingSpinner size="sm" label="Sprawdzam połączenie z API…" />
                </div>
            </div>
        </div>
    </div>
)

export default WelcomeSkeleton
