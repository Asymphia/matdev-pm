export type StatusItemType = "To do" | "Low" | "Completed" | "Medium" | "In progress" | "High" | "Cancelled"

export function statusBadgeClasses(status: string): string {
    const n = status.trim().toLowerCase()

    if (n.includes("completed") || n.includes("closed") || n.includes("done") || n === "low") {
        return "bg-primary-300/20 text-primary-500"
    }
    if (n.includes("progress") || n.includes("open") || n === "medium") {
        return "bg-warning/20 text-warning"
    }
    if (n.includes("cancel") || n === "high") {
        return "bg-error/20 text-error"
    }
    return "bg-text-primary-500/15 text-text-primary-300"
}

const StatusItem = ({ status, size = "small" }: { status: StatusItemType; size?: "big" | "small" }) => {
    return (
        <div
            className={`inline-flex shrink-0 items-center justify-center rounded-full whitespace-nowrap ${size === "big" ? "min-w-[9.5rem] px-5 py-2 text-base" : "min-w-[5.5rem] px-4 py-1 text-sm"} ${statusBadgeClasses(status)}`}
        >
            {status}
        </div>
    )
}

export default StatusItem
