const ProgressBar = ({ name, progress, limit }: { name?: string; progress: number; limit?: string }) => {
    const bgColour = progress < 100 ? (progress < 70 ? "bg-primary-500" : "bg-warning") : "bg-error"

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
