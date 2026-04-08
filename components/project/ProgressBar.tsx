const ProgressBar = ({ name, progress, limit } : { name: string, progress?: number, limit?: string }) => {
    if(!progress || !limit) {
        return (
            <div className="text-text-primary-500">
                { name } not set.
            </div>
        )
    }

    const bgColour = progress < 100 ? progress < 70 ? "bg-primary-500" : "bg-warning" : "bg-error"

    return (
        <div className="w-full">
            <div className="flex justify-between text-text-primary-500">
                <span>{ name }</span>
                <span>{ limit }</span>
            </div>

            <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${bgColour}`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    )
}

export default ProgressBar