const ProgressBar = ({ name, progress, limit }: { name: string; progress?: number; limit?: string }) => {
    if (!progress || !limit) {
        return <div className="text-sm">{name} not set.</div>
    }

    const bgColour = progress < 100 ? (progress < 70 ? "bg-primary-500" : "bg-warning") : "bg-error"

    return (
        <div className="w-full">
            <div className="flex justify-between text-sm">
                <span>{name}</span>
                <span>{limit}</span>
            </div>

            <div className="bg-border h-2 overflow-hidden rounded-full">
                <div className={`h-full rounded-full transition-all ${bgColour}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    )
}

export default ProgressBar
