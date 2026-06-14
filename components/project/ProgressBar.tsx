const ProgressBar = ({
    name,
    progress,
    limit,
    variant = "default",
}: {
    name?: string
    progress: number
    limit?: string
    /** Budget bar uses one color scale aligned with budget charts. */
    variant?: "default" | "budget"
}) => {
    const bgColour =
        variant === "budget"
            ? progress >= 100
                ? "bg-error"
                : "bg-primary-700"
            : progress < 100
              ? progress < 70
                  ? "bg-primary-500"
                  : "bg-warning"
              : "bg-error"

    return (
        <div className="w-full">
            {name && limit && (
                <div className="flex justify-between text-sm">
                    <span>{name}</span>
                    <span>{limit}</span>
                </div>
            )}

            <div className="bg-border h-2 overflow-hidden rounded-full">
                <div className={`h-full rounded-full transition-all ${bgColour}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    )
}

export default ProgressBar
