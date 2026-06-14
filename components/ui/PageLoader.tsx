import LoadingSpinner from "@/components/ui/LoadingSpinner"

type Props = {
    label?: string
    fullScreen?: boolean
    compact?: boolean
}

const PageLoader = ({ label = "Ładowanie…", fullScreen = false, compact = false }: Props) => {
    const wrapper = fullScreen
        ? "fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
        : compact
          ? "flex items-center justify-center py-16"
          : "flex min-h-[50vh] flex-col items-center justify-center gap-6 py-24"

    return (
        <div className={wrapper}>
            {!compact ? (
                <div className="text-center">
                    <div className="bg-primary-700 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl shadow-md">
                        <span className="text-background text-xl font-bold tracking-tight">M</span>
                    </div>
                    <p className="text-text-primary-500 text-lg font-semibold">MatDev PM</p>
                </div>
            ) : null}
            <LoadingSpinner size={compact ? "sm" : "lg"} label={label} />
        </div>
    )
}

export default PageLoader
